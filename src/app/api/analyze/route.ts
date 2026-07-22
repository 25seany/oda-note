import { NextResponse } from "next/server";
import { gradeImage, isAllowedMediaType } from "@/lib/gradeImage";

// Public, unauthenticated endpoint: lets a visitor try the product before
// signing up. It never touches Supabase — nothing is persisted here.
export async function POST(request: Request) {
  const formData = await request.formData();
  const image = formData.get("image");

  if (!(image instanceof File)) {
    return NextResponse.json({ error: "No image was provided." }, { status: 400 });
  }

  if (!isAllowedMediaType(image.type)) {
    return NextResponse.json(
      { error: "Unsupported image format." },
      { status: 400 }
    );
  }

  const arrayBuffer = await image.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");

  try {
    const analysis = await gradeImage(base64, image.type);
    return NextResponse.json({ analysis });
  } catch (err) {
    console.error("analyze error:", err);
    return NextResponse.json(
      { error: "Something went wrong while grading. Please try again." },
      { status: 502 }
    );
  }
}
