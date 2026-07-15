import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "Tidak ada file" }, { status: 400 });
  }

  const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: "Format file tidak didukung. Gunakan PDF, JPG, atau PNG" }, { status: 400 });
  }

  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return NextResponse.json({ error: "Ukuran file maksimal 10MB" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const ext = path.extname(file.name);
  const baseName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9]/g, "-");
  const fileName = `${baseName}-${Date.now()}${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads", "pmbm");

  await mkdir(uploadDir, { recursive: true });
  const filePath = path.join(uploadDir, fileName);
  await writeFile(filePath, buffer);

  return NextResponse.json({
    success: true,
    fileName: file.name,
    filePath: `/uploads/pmbm/${fileName}`,
  });
}
