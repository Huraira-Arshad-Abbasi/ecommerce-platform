import { NextRequest, NextResponse } from "next/server";
import cloudinary, { CLOUDINARY_FOLDER } from "@/lib/cloudinary";
import { getSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  try {
    const result = await new Promise<{ secure_url: string }>(
      (resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: CLOUDINARY_FOLDER,
            resource_type: "image",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result as { secure_url: string });
          }
        );
        stream.end(buffer);
      }
    );

    return NextResponse.json({ url: result.secure_url });
  } catch {
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}
