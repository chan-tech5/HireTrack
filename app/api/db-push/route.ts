import { NextResponse } from "next/server";
import { execSync } from "child_process";
import path from "path";
import fs from "fs";

export async function GET() {
  try {
    const paths = [
      path.join(process.cwd(), "node_modules", "prisma", "build", "index.js"),
      path.join(process.cwd(), "node_modules", ".bin", "prisma"),
    ];
    let prismaPath = "";
    for (const p of paths) {
      if (fs.existsSync(p)) {
        prismaPath = p;
        break;
      }
    }
    
    const cmd = prismaPath 
      ? (prismaPath.endsWith(".js") ? `node "${prismaPath}" db push --accept-data-loss` : `"${prismaPath}" db push --accept-data-loss`)
      : "npx --no-install prisma db push --accept-data-loss";

    const output = execSync(cmd, {
      env: { 
        ...process.env, 
        PRISMA_DISABLE_WARNINGS: "true",
        HOME: "/tmp" // Override home directory to writable directory in Lambda env
      },
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
