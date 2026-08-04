"use client";
import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import type { SantriTahfidz } from "@/actions/guru/hafalan.action";
import { drawKopSurat } from "@/lib/pdf/kopSurat";

type Props = {
  data: SantriTahfidz[];
  guruNama: string;
  namaKelas: string;
  tahunAjaran?: string;
};

export default function DownloadTahfidzPDF({ data, guruNama, namaKelas, tahunAjaran }: Props) {
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
      doc.text("REKAP PROGRESS HAFALAN AL-QUR'AN (TAHFIDZ)", pageW / 2, 50, { align: "center" });

      doc.setLineWidth(0.4);
      doc.setDrawColor(27, 94, 32);
      doc.line(pageW / 2 - 60, 52, pageW / 2 + 60, 52);

      // ── INFO ───────────────────────────────────────────────────────────────
      const infoY = 59;
      const colL = margin;
      const colR = pageW / 2 + 5;
      doc.setFontSize(9);
      doc.setTextColor(50, 50, 50);

      const pairs: [string, string, boolean][] = [
        ["Guru Pengampu", `: ${guruNama}`, true],
        ["Kelas", `: ${namaKelas}`, true],
        ["Tahun Ajaran", `: ${tahunAjaran ?? "-"}`, false],
        ["Tanggal Cetak", `: ${new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}`, false],
      ];
      pairs.forEach(([label, value, isLeft], idx) => {
        const y = infoY + (idx % 2 === 0 ? 0 : 6);
        const xLabel = isLeft ? colL : colR;
        const xValue = isLeft ? colL + 32 : colR + 32;
        doc.setFont("helvetica", "bold");
        doc.text(label, xLabel, y);
        doc.setFont("helvetica", "normal");
        doc.text(value, xValue, y);
      });

      // ── TABEL ──────────────────────────────────────────────────────────────
      const tableStartY = infoY + 14;

      const rows = data.map((s, i) => [
        i + 1,
        s.nama,
        s.nis,
        s.kelasNama,
        s.juzTerakhir !== null ? `Juz ${s.juzTerakhir}` : "-",
        s.halamanTerakhir !== null ? `Hal. ${s.halamanTerakhir}` : "-",
        s.suratTerakhir ?? "-",
        s.totalSetoran,
        s.tanggalTerakhir
          ? new Date(s.tanggalTerakhir).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
          : "-",
      ]);

      autoTable(doc, {
        startY: tableStartY,
        head: [["No", "Nama Santri", "NIS", "Kelas", "Juz", "Halaman", "Surat", "Total Setoran", "Setoran Terakhir"]],
        body: rows,
        margin: { left: margin, right: margin },
        styles: { fontSize: 7.5, cellPadding: 2.5, textColor: [40, 40, 40] },
        headStyles: {
          fillColor: [27, 94, 32],
          textColor: 255,
          fontStyle: "bold",
          halign: "center",
          fontSize: 7.5,
        },
        columnStyles: {
          0: { halign: "center", cellWidth: 8 },
          1: { cellWidth: 38 },
          2: { cellWidth: 20 },
          3: { halign: "center", cellWidth: 14 },
          4: { halign: "center", cellWidth: 16 },
          5: { halign: "center", cellWidth: 18 },
          6: { cellWidth: 20 },
          7: { halign: "center", cellWidth: 20 },
          8: { halign: "center", cellWidth: 26 },
        },
        alternateRowStyles: { fillColor: [245, 250, 245] },
        didParseCell: (hookData) => {
          if (hookData.section === "body" && hookData.column.index === 4) {
            const val = String(hookData.cell.raw ?? "");
            if (val !== "-") {
              hookData.cell.styles.textColor = [21, 128, 61];
              hookData.cell.styles.fontStyle = "bold";
            }
          }
        },
      });

      // ── RINGKASAN ──────────────────────────────────────────────────────────
      const finalY = (doc as any).lastAutoTable.finalY + 6;
      const sudahSetoran = data.filter((s) => s.totalSetoran > 0).length;

      doc.setFontSize(8);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(100);
      doc.text(
        `Total: ${data.length} santri  •  Sudah setoran: ${sudahSetoran}  •  Belum setoran: ${data.length - sudahSetoran}`,
        margin, finalY
      );

      // ── TANDA TANGAN ───────────────────────────────────────────────────────
      const ttY = finalY + 14;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(50, 50, 50);

      doc.text("Mengetahui,", margin, ttY);
      doc.text("Guru Tahfidz", margin, ttY + 5);
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

      const fileName = `Rekap_Tahfidz_${namaKelas.replace(/\s/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;
      doc.save(fileName);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={loading || data.length === 0}
      className="flex items-center gap-2 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
    >
      {loading
        ? <><Loader2 size={14} className="animate-spin" /> Membuat PDF...</>
        : <><Download size={14} /> Ekspor</>}
    </button>
  );
}
