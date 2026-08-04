"use client";
import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { drawKopSurat } from "@/lib/pdf/kopSurat";

type Props = {
  data: any[];
  guruNama: string;
  kelasFilter?: string;
  mapelFilter?: string;
  semesterFilter?: string;
};

export default function DownloadRekapNilaiPDF({
  data, guruNama, kelasFilter, mapelFilter, semesterFilter,
}: Props) {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    if (data.length === 0) return;
    setLoading(true);
    try {
      const { default: jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");

      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageW = doc.internal.pageSize.getWidth();
      const margin = 15;

      // ── KOP SURAT ──────────────────────────────────────────────────────────
      await drawKopSurat(doc, pageW, margin);

      // ── JUDUL ──────────────────────────────────────────────────────────────
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(27, 94, 32);
      doc.text("REKAP NILAI SISWA", pageW / 2, 50, { align: "center" });

      doc.setLineWidth(0.4);
      doc.setDrawColor(27, 94, 32);
      doc.line(pageW / 2 - 30, 52, pageW / 2 + 30, 52);

      // ── INFO ───────────────────────────────────────────────────────────────
      const infoY = 59;
      const colL = margin;
      const colR = pageW / 2 + 5;
      doc.setFontSize(9);
      doc.setTextColor(50, 50, 50);

      doc.setFont("helvetica", "bold");
      doc.text("Guru Pengampu", colL, infoY);
      doc.setFont("helvetica", "normal");
      doc.text(`: ${guruNama}`, colL + 35, infoY);

      doc.setFont("helvetica", "bold");
      doc.text("Mata Pelajaran", colL, infoY + 6);
      doc.setFont("helvetica", "normal");
      doc.text(`: ${mapelFilter || "Semua Mapel"}`, colL + 35, infoY + 6);

      doc.setFont("helvetica", "bold");
      doc.text("Kelas", colR, infoY);
      doc.setFont("helvetica", "normal");
      doc.text(`: ${kelasFilter || "Semua Kelas"}`, colR + 30, infoY);

      doc.setFont("helvetica", "bold");
      doc.text("Semester", colR, infoY + 6);
      doc.setFont("helvetica", "normal");
      doc.text(`: ${semesterFilter || "Semua Semester"}`, colR + 30, infoY + 6);

      // ── TABEL ──────────────────────────────────────────────────────────────
      const tableStartY = infoY + 14;

      const rows = data.map((r, i) => {
        const rincianStr = r.nilaiList
          ? r.nilaiList.map((n: any) => `${n.jenis}: ${n.nilai}`).join(", ")
          : "-";
        return [
          i + 1,
          r.siswa.nama,
          r.siswa.nis,
          r.kelas,
          rincianStr,
          r.rata ?? "-",
        ];
      });

      autoTable(doc, {
        startY: tableStartY,
        head: [["No", "Nama Siswa", "NIS", "Kelas", "Rincian Nilai", "Rata-rata"]],
        body: rows,
        margin: { left: margin, right: margin },
        styles: { fontSize: 8, cellPadding: 2.5, textColor: [40, 40, 40] },
        headStyles: {
          fillColor: [27, 94, 32],
          textColor: 255,
          fontStyle: "bold",
          halign: "center",
          fontSize: 8,
        },
        columnStyles: {
          0: { halign: "center", cellWidth: 8 },
          1: { cellWidth: 42 },
          2: { cellWidth: 22 },
          3: { halign: "center", cellWidth: 16 },
          4: { cellWidth: 70 },
          5: { halign: "center", cellWidth: 22 },
        },
        alternateRowStyles: { fillColor: [245, 250, 245] },
        didParseCell: (hookData) => {
          if (hookData.section === "body" && hookData.column.index === 5) {
            const num = parseFloat(String(hookData.cell.raw ?? "0"));
            if (num >= 75) hookData.cell.styles.textColor = [21, 128, 61];
            else if (num >= 60) hookData.cell.styles.textColor = [161, 98, 7];
            else hookData.cell.styles.textColor = [185, 28, 28];
            hookData.cell.styles.fontStyle = "bold";
          }
        },
      });

      // ── RINGKASAN ──────────────────────────────────────────────────────────
      const finalY = (doc as any).lastAutoTable.finalY + 6;
      doc.setFontSize(8);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(100);
      doc.text(`Total: ${data.length} siswa`, margin, finalY);

      // ── TANDA TANGAN ───────────────────────────────────────────────────────
      const ttY = finalY + 14;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(50, 50, 50);

      doc.text("Mengetahui,", margin, ttY);
      doc.text("Guru Pengampu", margin, ttY + 5);
      doc.setFont("helvetica", "bold");
      doc.text(guruNama, margin, ttY + 30);
      doc.setFont("helvetica", "normal");

      const ttRightX = pageW - margin - 50;
      doc.text("Jakarta, " + new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" }), ttRightX, ttY);
      doc.text("Kepala Madrasah,", ttRightX, ttY + 5);
      doc.setFont("helvetica", "bold");
      doc.text("(................................)", ttRightX, ttY + 30);
      doc.setFont("helvetica", "normal");

      // ── FOOTER ─────────────────────────────────────────────────────────────
      const pageH = doc.internal.pageSize.getHeight();
      doc.setDrawColor(200);
      doc.setLineWidth(0.3);
      doc.line(margin, pageH - 12, pageW - margin, pageH - 12);
      doc.setFontSize(7);
      doc.setTextColor(160);
      doc.text("Dicetak oleh Sistem Monitoring MTS Al-Amin Bintaro", pageW / 2, pageH - 8, { align: "center" });

      const fileName = `Rekap_Nilai_${new Date().toISOString().split("T")[0]}.pdf`;
      doc.save(fileName);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading || data.length === 0}
      className="flex items-center gap-2 bg-[#1B5E20] hover:bg-[#2E7D32] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
    >
      {loading
        ? <><Loader2 className="w-4 h-4 animate-spin" /> Membuat PDF...</>
        : <><Download className="w-4 h-4" /> Download PDF</>}
    </button>
  );
}
