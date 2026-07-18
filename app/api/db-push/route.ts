import { NextResponse } from "next/server";
import { execSync } from "child_process";

export async function GET() {
  try {
    const output = execSync("npx prisma db push --accept-data-loss", {
      env: { ...process.env, PRISMA_DISABLE_WARNINGS: "true" },
    }).toString();
    return NextResponse.json({ success: true, output });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stderr: error.stderr?.toString(),
    });
  }
}
