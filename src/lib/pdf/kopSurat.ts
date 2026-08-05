import type { jsPDF } from "jspdf";

/**
 * Kop surat resmi Yayasan Al-Amin Pejeruk / MTs Al-Amin Bintaro Ampenan.
 * Menggambar kop di bagian atas dokumen dengan logo di kiri dan kanan,
 * dan mengembalikan posisi Y (mm) setelah garis bawah kop.
 */
export async function drawKopSurat(doc: jsPDF, pageW: number, margin: number): Promise<number> {
  const logoSize = 18;
  const logoY = 11;
  
  // Load dan tambahkan logo di kiri dan kanan
  try {
    const logoPathKiri = "/images/logo-mts.jpg";
    const logoPathKanan = "/images/kemenag.png";
    const logoLeft = margin + 2;
    const logoRight = pageW - margin - logoSize - 2;
    
    // Logo kiri
    doc.addImage(logoPathKiri, "JPEG", logoLeft, logoY, logoSize, logoSize);
    // Logo kanan
    doc.addImage(logoPathKanan, "PNG", logoRight, logoY, logoSize, logoSize);
  } catch (error) {
    console.warn("Logo tidak dapat dimuat:", error);
  }

  // Garis atas kop
  // doc.setDrawColor(27, 94, 32);
  // doc.setLineWidth(1.2);
  // doc.line(margin, 10, pageW - margin, 10);

  // Yayasan
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(27, 94, 32);
  doc.text("YAYASAN AL-AMIN PEJERUK", pageW / 2, 15.5, { align: "center" });

  // Nama madrasah
  doc.setFontSize(14);
  doc.text("MADRASAH TSANAWIYAH AL AMIN BINTARO AMPENAN", pageW / 2, 21, { align: "center" });

  // Legalitas & alamat
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(60, 60, 60);
  doc.text(
    "Akte No. 01 Tahun 2018 SK Menkumham : AHU-0000098.AH.01.05.2018",
    pageW / 2, 26, { align: "center" }
  );
  doc.text(
    "Jalan Dukuh Saleh No. 39 Pejeruk Kec. Ampenan Kota Mataram NTB",
    pageW / 2, 30.5, { align: "center" }
  );
  doc.text(
    "NPWP 01.814.292.7-911000 \u2013 No Hp. 087861377700",
    pageW / 2, 35, { align: "center" }
  );

  // Garis bawah kop (double line)
  doc.setDrawColor(27, 94, 32);
  doc.setLineWidth(1.2);
  doc.line(margin, 38, pageW - margin, 38);
  doc.setLineWidth(0.5);
  doc.line(margin, 40, pageW - margin, 40);

  return 40;
}
