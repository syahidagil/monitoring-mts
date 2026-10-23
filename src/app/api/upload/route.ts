import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import path from "path";
import { auth } from "@/lib/auth";

// Ekstensi ditentukan dari MIME type (whitelist), bukan dari nama file pengguna.
const ALLOWED: Record<string, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

// Batas body request di Vercel (serverless function) adalah 4,5MB.
const MAX_SIZE = 4 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Tidak diizinkan" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const folder = (formData.get("folder") as string) || "content";

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Tidak ada file yang dipilih" },
        { status: 400 }
      );
    }

    const ext = ALLOWED[file.type];
    if (!ext) {
      return NextResponse.json(
        { error: "Format file tidak didukung. Gunakan JPG, PNG, WEBP, GIF, atau PDF" },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Ukuran file maksimal 4MB" },
        { status: 400 }
      );
    }

    const originalExt = path.extname(file.name);
    const baseName =
      path
        .basename(file.name, originalExt)
        .replace(/[^a-zA-Z0-9]/g, "-")
        .slice(0, 50) || "file";
    const safeFolder = folder.replace(/[^a-zA-Z0-9_-]/g, "") || "content";

    const blob = await put(`${safeFolder}/${baseName}.${ext}`, file, {
      access: "public",
      addRandomSuffix: true,
      contentType: file.type,
    });

    return NextResponse.json({
      success: true,
      fileName: file.name,
      filePath: blob.url, // URL lengkap https://....public.blob.vercel-storage.com/...
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan file ke penyimpanan. Coba lagi." },
      { status: 500 }
    );
  }
}