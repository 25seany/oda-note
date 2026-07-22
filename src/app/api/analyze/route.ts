import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_MEDIA_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;
type AllowedMediaType = (typeof ALLOWED_MEDIA_TYPES)[number];

function isAllowedMediaType(value: string): value is AllowedMediaType {
  return (ALLOWED_MEDIA_TYPES as readonly string[]).includes(value);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });
  }

  const formData = await request.formData();
  const image = formData.get("image");

  if (!(image instanceof File)) {
    return NextResponse.json({ error: "이미지가 없어요." }, { status: 400 });
  }

  if (!isAllowedMediaType(image.type)) {
    return NextResponse.json(
      { error: "지원하지 않는 이미지 형식이에요." },
      { status: 400 }
    );
  }

  const arrayBuffer = await image.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  let analysis;
  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 1500,
      system:
        "너는 학생이 종이에 푼 문제를 사진으로 찍어 보내면, 문제와 학생 답안을 분석해 채점해주는 도우미야. " +
        "모든 텍스트 응답은 한국어로 작성해. 반드시 record_answer_check 도구를 호출해서 결과를 구조화된 형태로 반환해.",
      tools: [
        {
          name: "record_answer_check",
          description:
            "사진 속 문제와 학생 답안을 분석한 결과를 기록한다.",
          input_schema: {
            type: "object",
            properties: {
              subject: {
                type: "string",
                description: "과목 (예: 수학, 영어, 과학, 국어 등). 판단하기 어려우면 '기타'.",
              },
              question_text: {
                type: "string",
                description: "사진에서 인식한 문제 원문.",
              },
              user_answer: {
                type: "string",
                description: "학생이 종이에 직접 작성한 답. 보이지 않으면 빈 문자열.",
              },
              correct_answer: {
                type: "string",
                description: "이 문제의 정답 및 풀이 과정 요약.",
              },
              is_correct: {
                type: "boolean",
                description: "학생 답안이 정답과 일치하는지 여부. 학생 답안이 아예 없으면 false.",
              },
              explanation: {
                type: "string",
                description: "정답 풀이와, 틀렸다면 왜 틀렸는지에 대한 한국어 설명.",
              },
            },
            required: [
              "subject",
              "question_text",
              "user_answer",
              "correct_answer",
              "is_correct",
              "explanation",
            ],
          },
        },
      ],
      tool_choice: { type: "tool", name: "record_answer_check" },
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: image.type as AllowedMediaType,
                data: base64,
              },
            },
            {
              type: "text",
              text: "이 사진 속 문제와 학생이 작성한 답을 분석해서 record_answer_check 도구를 호출해줘.",
            },
          ],
        },
      ],
    });

    const toolUse = response.content.find(
      (block) => block.type === "tool_use"
    );

    if (!toolUse || toolUse.type !== "tool_use") {
      throw new Error("AI 분석 결과를 읽을 수 없어요.");
    }

    analysis = toolUse.input as {
      subject: string;
      question_text: string;
      user_answer: string;
      correct_answer: string;
      is_correct: boolean;
      explanation: string;
    };
  } catch (err) {
    console.error("analyze error:", err);
    return NextResponse.json(
      { error: "AI 분석 중 오류가 발생했어요. 잠시 후 다시 시도해주세요." },
      { status: 502 }
    );
  }

  const extension = image.type.split("/")[1] === "jpeg" ? "jpg" : image.type.split("/")[1];
  const imagePath = `${user.id}/${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from("problem-images")
    .upload(imagePath, arrayBuffer, { contentType: image.type });

  if (uploadError) {
    return NextResponse.json(
      { error: "이미지 저장 중 오류가 발생했어요." },
      { status: 500 }
    );
  }

  const { data: inserted, error: insertError } = await supabase
    .from("wrong_notes")
    .insert({
      user_id: user.id,
      image_path: imagePath,
      subject: analysis.subject,
      question_text: analysis.question_text,
      user_answer: analysis.user_answer,
      correct_answer: analysis.correct_answer,
      is_correct: analysis.is_correct,
      explanation: analysis.explanation,
    })
    .select("id")
    .single();

  if (insertError || !inserted) {
    return NextResponse.json(
      { error: "노트 저장 중 오류가 발생했어요." },
      { status: 500 }
    );
  }

  return NextResponse.json({ id: inserted.id });
}
