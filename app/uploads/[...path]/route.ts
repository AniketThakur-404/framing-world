import { readFile } from "node:fs/promises"
import { existsSync } from "node:fs"
import { resolve, extname } from "node:path"
import { tmpdir } from "node:os"

const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params
  let filePath = resolve(process.cwd(), "public", "uploads", ...segments)

  if (!existsSync(filePath)) {
    filePath = resolve(tmpdir(), "uploads", ...segments)
  }

  if (!existsSync(filePath)) {
    return new Response("Not Found", { status: 404 })
  }

  try {
    const file = await readFile(filePath)
    const ext = extname(filePath).toLowerCase()
    const contentType = MIME_TYPES[ext] || "application/octet-stream"

    return new Response(file, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch {
    return new Response("Error reading file", { status: 500 })
  }
}
