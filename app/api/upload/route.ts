import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save path inside public/uploads
    const uploadDir = join(process.cwd(), "public", "uploads");

    // Ensure dir exists
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Generate unique name to prevent collisions
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}.${fileExt}`;
    const filePath = join(uploadDir, fileName);

    await writeFile(filePath, buffer);

    const url = `/uploads/${fileName}`;

    return NextResponse.json({
      url,
      fileName: file.name,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
