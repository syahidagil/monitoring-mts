"use client";
import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { drawKopSurat } from "@/lib/pdf/kopSurat";
import { getJadwalUntukCetak } from "@/actions/jadwal.action";

const HARI_ORDER = ["SENIN", "SELASA", "RABU", "KAMIS", "JUMAT", "SABTU"];
const HARI_LABEL: Record<string, string> = {
  SENIN: "Senin", SELASA: "Selasa", RABU: "Rabu", KAMIS: "Kamis", JUMAT: "Jumat", SABTU: "Sabtu",
};

type Props = {
  filters: { kelasId?: string; guruId?: string; hari?: string };
  kelasList: any[];
  guruList: any[];
  tahunAjaranAktif?: { nama: string; semester: string };
};

export default function DownloadJadwalPDF({ filters, kelasList, guruList, tahunAjaranAktif }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    setLoading(true);
    try {
      const jadwal = await getJadwalUntukCetak({
        kelasId: filters.kelasId ? Number(filters.kelasId) : undefined,
        guruId: filters.guruId || undefined,
        hari: filters.hari || undefined,
      });

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
      doc.text("JADWAL PELAJARAN", pageW / 2, 50, { align: "center" });

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

      const kelasNama = filters.kelasId
        ? `Kelas ${kelasList.find((k) => String(k.id) === filters.kelasId)?.nama ?? "-"}`
        : "Semua Kelas";
      const guruNama = filters.guruId
        ? guruList.find((g) => g.id === filters.guruId)?.user?.name ?? "-"
        : "Semua Guru";

      doc.setFont("helvetica", "bold");
      doc.text("Tahun Pelajaran", colL, infoY);
      doc.setFont("helvetica", "normal");
      doc.text(
        `: ${tahunAjaranAktif ? `${tahunAjaranAktif.nama} (${tahunAjaranAktif.semester === "GANJIL" ? "Ganjil" : "Genap"})` : "-"}`,
        colL + 35, infoY
      );

      doc.setFont("helvetica", "bold");
      doc.text("Kelas", colL, infoY + 6);
      doc.setFont("helvetica", "normal");
      doc.text(`: ${kelasNama}`, colL + 35, infoY + 6);

      doc.setFont("helvetica", "bold");
      doc.text("Guru", colR, infoY);
      doc.setFont("helvetica", "normal");
      doc.text(`: ${guruNama}`, colR + 20, infoY);

      doc.setFont("helvetica", "bold");
      doc.text("Tanggal Cetak", colR, infoY + 6);
      doc.setFont("helvetica", "normal");
      doc.text(
        `: ${new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}`,
        colR + 35, infoY + 6
      );

      // ── TABEL PER HARI ─────────────────────────────────────────────────────
      let cursorY = infoY + 14;

      const hariUrut = filters.hari ? [filters.hari] : HARI_ORDER;

      for (const hari of hariUrut) {
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
          head: [["No", "Jam", "Mata Pelajaran", "Kelas", "Guru"]],
          body: rows.map((j, i) => [
            i + 1,
            `${j.jamMulai}\u2013${j.jamSelesai}`,
            j.mataPelajaran?.namaMapel ?? "-",
            `Kelas ${j.kelas.nama}`,
            j.guru?.user?.name ?? "-",
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
            0: { halign: "center", cellWidth: 10 },
            1: { halign: "center", cellWidth: 28 },
            2: { cellWidth: 60 },
            3: { halign: "center", cellWidth: 30 },
            4: { cellWidth: 42 },
          },
          alternateRowStyles: { fillColor: [245, 250, 245] },
        });

        cursorY = (doc as any).lastAutoTable.finalY + 8;
      }

      if (jadwal.length === 0) {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(9);
        doc.setTextColor(150);
        doc.text("Tidak ada jadwal untuk filter yang dipilih.", margin, cursorY);
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
      const namaFile = `Jadwal_Pelajaran_${tahunAjaranAktif?.nama.replace(/\//g, "-") ?? "semester"}.pdf`;
      doc.save(namaFile);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
    >
      {loading
        ? <><Loader2 className="w-4 h-4 animate-spin" /> Membuat PDF...</>
        : <><Download className="w-4 h-4" /> Download PDF</>}
    </button>
  );
}