"use client";
import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { drawKopSurat } from "@/lib/pdf/kopSurat";

type Props = {
  data: any[];
  guruNama: string;
  kelasFilter?: string;
  siswaFilter?: { nama: string; nis: string; kelas: string };
};

export default function DownloadRekapTahsinPDF({ data, guruNama, kelasFilter, siswaFilter }: Props) {
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
      const judulDoc = siswaFilter
        ? `REKAP EVALUASI TAHSIN SANTRI — ${siswaFilter.nama.toUpperCase()}`
        : "REKAP EVALUASI TAHSIN AL-QUR'AN";
      doc.text(judulDoc, pageW / 2, 50, { align: "center" });

      doc.setLineWidth(0.4);
      doc.setDrawColor(27, 94, 32);
      doc.line(pageW / 2 - 60, 52, pageW / 2 + 60, 52);

      // ── INFO ───────────────────────────────────────────────────────────────
      const infoY = 59;
      const colL = margin;
      const colR = pageW / 2 + 5;
      doc.setFontSize(9);
      doc.setTextColor(50, 50, 50);

      if (siswaFilter) {
        doc.setFont("helvetica", "bold");
        doc.text("Nama Santri", colL, infoY);
        doc.setFont("helvetica", "normal");
        doc.text(`: ${siswaFilter.nama} (NIS: ${siswaFilter.nis})`, colL + 32, infoY);

        doc.setFont("helvetica", "bold");
        doc.text("Kelas", colL, infoY + 6);
        doc.setFont("helvetica", "normal");
        doc.text(`: ${siswaFilter.kelas}`, colL + 32, infoY + 6);

        doc.setFont("helvetica", "bold");
        doc.text("Guru Penguji", colR, infoY);
        doc.setFont("helvetica", "normal");
        doc.text(`: ${guruNama}`, colR + 30, infoY);

        doc.setFont("helvetica", "bold");
        doc.text("Tanggal Cetak", colR, infoY + 6);
        doc.setFont("helvetica", "normal");
        doc.text(`: ${new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}`, colR + 30, infoY + 6);
      } else {
        doc.setFont("helvetica", "bold");
        doc.text("Guru Penguji", colL, infoY);
        doc.setFont("helvetica", "normal");
        doc.text(`: ${guruNama}`, colL + 32, infoY);

        doc.setFont("helvetica", "bold");
        doc.text("Kelas", colR, infoY);
        doc.setFont("helvetica", "normal");
        doc.text(`: ${kelasFilter || "Semua Kelas"}`, colR + 30, infoY);

        doc.setFont("helvetica", "bold");
        doc.text("Tanggal Cetak", colR, infoY + 6);
        doc.setFont("helvetica", "normal");
        doc.text(`: ${new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}`, colR + 30, infoY + 6);
      }

      // ── TABEL ──────────────────────────────────────────────────────────────
      const tableStartY = infoY + 14;

      const rows = data.map((r, i) => [
        i + 1,
        new Date(r.tanggal).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }),
        siswaFilter ? r.surat : `${r.siswa.nama} (${r.siswa.kelas.nama})`,
        siswaFilter ? `Juz ${r.juz ?? "-"}` : r.surat,
        siswaFilter ? `Hal. ${r.halaman ?? "-"}` : `Juz ${r.juz ?? "-"}`,
        siswaFilter ? r.tajwid : `Hal. ${r.halaman ?? "-"}`,
        siswaFilter ? r.makhraj : r.tajwid,
        siswaFilter ? r.sifatul : r.makhraj,
        siswaFilter ? "" : r.sifatul,
      ].filter((val, idx) => siswaFilter ? idx <= 7 : true));

      const headCols = siswaFilter
        ? [["No", "Tanggal", "Surat & Rentang Ayat", "Juz", "Halaman", "Tajwid", "Makhraj", "Sifatul"]]
        : [["No", "Tanggal", "Nama Santri", "Surat & Rentang Ayat", "Juz", "Halaman", "Tajwid", "Makhraj", "Sifatul"]];

      autoTable(doc, {
        startY: tableStartY,
        head: headCols,
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
        columnStyles: siswaFilter ? {
          0: { halign: "center", cellWidth: 10 },
          1: { halign: "center", cellWidth: 26 },
          2: { cellWidth: 60 },
          3: { halign: "center", cellWidth: 18 },
          4: { halign: "center", cellWidth: 18 },
          5: { halign: "center", cellWidth: 16 },
          6: { halign: "center", cellWidth: 16 },
          7: { halign: "center", cellWidth: 16 },
        } : {
          0: { halign: "center", cellWidth: 8 },
          1: { halign: "center", cellWidth: 22 },
          2: { cellWidth: 38 },
          3: { cellWidth: 44 },
          4: { halign: "center", cellWidth: 14 },
          5: { halign: "center", cellWidth: 14 },
          6: { halign: "center", cellWidth: 13 },
          7: { halign: "center", cellWidth: 13 },
          8: { halign: "center", cellWidth: 13 },
        },
        alternateRowStyles: { fillColor: [245, 250, 245] },
      });

      // ── RINGKASAN ──────────────────────────────────────────────────────────
      const finalY = (doc as any).lastAutoTable.finalY + 6;
      doc.setFontSize(8);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(100);
      doc.text(`Total Record: ${data.length} evaluasi tahsin`, margin, finalY);

      // ── TANDA TANGAN ───────────────────────────────────────────────────────
      const ttY = finalY + 12;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(50, 50, 50);

      doc.text("Mengetahui,", margin, ttY);
      doc.text("Guru Tahsin", margin, ttY + 5);
      doc.setFont("helvetica", "bold");
      doc.text(guruNama, margin, ttY + 28);

      const ttRightX = pageW - margin - 50;
      doc.text("Jakarta, " + new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" }), ttRightX, ttY);
      doc.text("Kepala Madrasah,", ttRightX, ttY + 5);
      doc.setFont("helvetica", "bold");
      doc.text("(................................)", ttRightX, ttY + 28);

      // ── FOOTER ─────────────────────────────────────────────────────────────
      const pageH = doc.internal.pageSize.getHeight();
      doc.setDrawColor(200);
      doc.setLineWidth(0.3);
      doc.line(margin, pageH - 12, pageW - margin, pageH - 12);
      doc.setFontSize(7);
      doc.setTextColor(160);
      doc.text("Dicetak oleh Sistem Monitoring MTS Al-Amin Bintaro", pageW / 2, pageH - 8, { align: "center" });

      const namePart = siswaFilter ? siswaFilter.nama.replace(/[^a-zA-Z0-9]/g, "_") : "Semua";
      const fileName = `Rekap_Tahsin_${namePart}_${new Date().toISOString().split("T")[0]}.pdf`;
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
