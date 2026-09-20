"use client";
import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { drawKopSurat } from "@/lib/pdf/kopSurat";

const HARI_ORDER = ["SENIN", "SELASA", "RABU", "KAMIS", "JUMAT", "SABTU"];
const HARI_LABEL: Record<string, string> = {
  SENIN: "Senin", SELASA: "Selasa", RABU: "Rabu", KAMIS: "Kamis", JUMAT: "Jumat", SABTU: "Sabtu",
};

type JadwalRow = {
  id: number;
  hari: string;
  jamMulai: string;
  jamSelesai: string;
  kelas: { nama: string };
  mataPelajaran?: { namaMapel: string } | null;
  kodeMapel?: string;
  tahunAjaran: { nama: string; semester: string };
};

type Props = {
  jadwal: JadwalRow[];
  guruNama: string;
  nip?: string | null;
};

export default function DownloadJadwalGuruPDF({ jadwal, guruNama, nip }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    setLoading(true);
    try {
      const { default: jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");

      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const margin = 15;

      // ── KOP SURAT ──────────────────────────────────────────────────────────
      await drawKopSurat(doc, pageW, margin);

      // ── JUDUL DOKUMEN ──────────────────────────────────────────────────────
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(27, 94, 32);
      doc.text("JADWAL MENGAJAR", pageW / 2, 50, { align: "center" });

      doc.setLineWidth(0.4);
      doc.setDrawColor(27, 94, 32);
      doc.line(pageW / 2 - 35, 52, pageW / 2 + 35, 52);

      // ── INFO ───────────────────────────────────────────────────────────────
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(50, 50, 50);

      const infoY = 59;
      const colL = margin;
      const colR = pageW / 2 + 5;
      const tahunAjaranNama = jadwal[0]?.tahunAjaran
        ? `${jadwal[0].tahunAjaran.nama} (${jadwal[0].tahunAjaran.semester === "GANJIL" ? "Ganjil" : "Genap"})`
        : "-";

      doc.setFont("helvetica", "bold");
      doc.text("Nama Guru", colL, infoY);
      doc.setFont("helvetica", "normal");
      doc.text(`: ${guruNama}`, colL + 35, infoY);

      doc.setFont("helvetica", "bold");
      doc.text("NIP", colL, infoY + 6);
      doc.setFont("helvetica", "normal");
      doc.text(`: ${nip || "-"}`, colL + 35, infoY + 6);

      doc.setFont("helvetica", "bold");
      doc.text("Tahun Pelajaran", colR, infoY);
      doc.setFont("helvetica", "normal");
      doc.text(`: ${tahunAjaranNama}`, colR + 35, infoY);

      doc.setFont("helvetica", "bold");
      doc.text("Tanggal Cetak", colR, infoY + 6);
      doc.setFont("helvetica", "normal");
      doc.text(
        `: ${new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}`,
        colR + 35, infoY + 6
      );

      // ── TABEL PER HARI ─────────────────────────────────────────────────────
      let cursorY = infoY + 14;

      for (const hari of HARI_ORDER) {
        const rows = jadwal.filter((j) => j.hari === hari);
        if (rows.length === 0) continue;

        if (cursorY > pageH - 40) {
          doc.addPage();
          cursorY = 20;
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(27, 94, 32);
        doc.text(`${HARI_LABEL[hari] ?? hari} (${rows.length} Jadwal)`, margin, cursorY);
        cursorY += 3;

        autoTable(doc, {
          startY: cursorY,
          head: [["No", "Jam", "Mata Pelajaran", "Kelas"]],
          body: rows.map((j, i) => [
            i + 1,
            `${j.jamMulai}\u2013${j.jamSelesai}`,
            j.mataPelajaran?.namaMapel ?? j.kodeMapel ?? "-",
            `Kelas ${j.kelas.nama}`,
          ]),
          margin: { left: margin, right: margin },
          styles: { fontSize: 8, cellPadding: { top: 2.5, right: 2, bottom: 2.5, left: 2 }, textColor: [40, 40, 40], valign: "middle", lineColor: [220, 220, 220], lineWidth: 0.1 },
          headStyles: {
            fillColor: [27, 94, 32],
            textColor: 255,
            fontStyle: "bold",
            halign: "center",
            valign: "middle",
            fontSize: 8,
          },
          columnStyles: {
            0: { halign: "center", cellWidth: 12 },
            1: { halign: "center", cellWidth: 32 },
            2: { cellWidth: 78 },
            3: { halign: "center", cellWidth: 30 },
          },
          alternateRowStyles: { fillColor: [245, 250, 245] },
        });

        cursorY = (doc as any).lastAutoTable.finalY + 8;
      }

      if (jadwal.length === 0) {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(9);
        doc.setTextColor(150);
        doc.text("Belum ada jadwal mengajar.", margin, cursorY);
      }

      // ── TANDA TANGAN ───────────────────────────────────────────────────────
      if (jadwal.length > 0) {
        const ttY = cursorY + 10;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(50, 50, 50);
        const ttRightX = pageW - margin - 50;
        doc.text("Mataram, " + new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" }), ttRightX, ttY);
        doc.text("Guru Pengampu,", ttRightX, ttY + 5);
        doc.setFont("helvetica", "bold");
        doc.text(guruNama, ttRightX, ttY + 25);
      }

      // ── FOOTER ─────────────────────────────────────────────────────────────
      const pageCount = doc.getNumberOfPages();
      for (let p = 1; p <= pageCount; p++) {
        doc.setPage(p);
        doc.setDrawColor(200);
        doc.setLineWidth(0.3);
        doc.line(margin, pageH - 12, pageW - margin, pageH - 12);
        doc.setFontSize(7);
        doc.setTextColor(160);
        doc.text("Dicetak oleh Sistem Monitoring MTS Al-Amin Bintaro", pageW / 2, pageH - 8, { align: "center" });
      }

      // ── SIMPAN ─────────────────────────────────────────────────────────────
      const namaFile = `Jadwal_Mengajar_${guruNama.replace(/\s+/g, "_")}.pdf`;
      doc.save(namaFile);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading || jadwal.length === 0}
      className="flex items-center gap-2 bg-[#1B5E20] hover:bg-[#2E7D32] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
    >
      {loading
        ? <><Loader2 className="w-4 h-4 animate-spin" /> Membuat PDF...</>
        : <><Download className="w-4 h-4" /> Download PDF</>}
    </button>
  );
}