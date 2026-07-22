import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAllowedMediaType, type Analysis } from "@/lib/gradeImage";

// Persists an already-graded result (from /api/analyze) to the signed-in
// user's notebook: uploads the photo to storage, then inserts the row.
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "You need to be signed in." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const imageBase64 = body?.imageBase64;
  const imageType = body?.imageType;
  const analysis = body?.analysis as Analysis | undefined;

  if (typeof imageBase64 !== "string" || !imageType || !isAllowedMediaType(imageType)) {
    return NextResponse.json({ error: "Invalid image data." }, { status: 400 });
  }
  if (
    !analysis ||
    typeof analysis.subject !== "string" ||
    typeof analysis.question_text !== "string" ||
    typeof analysis.correct_answer !== "string" ||
    typeof analysis.explanation !== "string" ||
    typeof analysis.is_correct !== "boolean"
  ) {
    return NextResponse.json({ error: "Invalid analysis data." }, { status: 400 });
  }

  const arrayBuffer = Buffer.from(imageBase64, "base64");
  const extension = imageType.split("/")[1] === "jpeg" ? "jpg" : imageType.split("/")[1];
  const imagePath = `${user.id}/${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from("problem-images")
    .upload(imagePath, arrayBuffer, { contentType: imageType });

  if (uploadError) {
    return NextResponse.json({ error: "Could not save the image." }, { status: 500 });
  }

  const { data: inserted, error: insertError } = await supabase
    .from("wrong_notes")
    .insert({
      user_id: user.id,
      image_path: imagePath,
      subject: analysis.subject,
      question_text: analysis.question_text,
      user_answer: analysis.user_answer ?? "",
      correct_answer: analysis.correct_answer,
      is_correct: analysis.is_correct,
      explanation: analysis.explanation,
    })
    .select("id")
    .single();

  if (insertError || !inserted) {
    return NextResponse.json({ error: "Could not save the note." }, { status: 500 });
  }

  return NextResponse.json({ id: inserted.id });
}
