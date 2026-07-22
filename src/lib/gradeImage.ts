import Anthropic from "@anthropic-ai/sdk";

export const ALLOWED_MEDIA_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;
export type AllowedMediaType = (typeof ALLOWED_MEDIA_TYPES)[number];

export function isAllowedMediaType(value: string): value is AllowedMediaType {
  return (ALLOWED_MEDIA_TYPES as readonly string[]).includes(value);
}

export type Analysis = {
  subject: string;
  question_text: string;
  user_answer: string;
  correct_answer: string;
  is_correct: boolean;
  explanation: string;
};

export async function gradeImage(
  base64: string,
  mediaType: AllowedMediaType
): Promise<Analysis> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const response = await anthropic.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 1500,
    system:
      "You are a study assistant. A student sends a photo of a handwritten problem and their answer. " +
      "Read the problem, read their handwritten answer, and grade it. Detect the language the question " +
      "is written in and reply in that same language for every text field. Always call the " +
      "record_answer_check tool with the structured result.",
    tools: [
      {
        name: "record_answer_check",
        description:
          "Records the analysis of the problem and the student's answer shown in the photo.",
        input_schema: {
          type: "object",
          properties: {
            subject: {
              type: "string",
              description:
                "Subject of the problem (e.g. Math, English, Science), in the same language as the question. Use a generic label if unclear.",
            },
            question_text: {
              type: "string",
              description: "The problem exactly as it appears in the photo.",
            },
            user_answer: {
              type: "string",
              description:
                "The student's handwritten answer. Empty string if none is visible.",
            },
            correct_answer: {
              type: "string",
              description: "The correct answer and a brief summary of the solution.",
            },
            is_correct: {
              type: "boolean",
              description:
                "Whether the student's answer matches the correct answer. False if no answer is visible.",
            },
            explanation: {
              type: "string",
              description:
                "Explanation of the correct solution, and why the student's answer was wrong if it was.",
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
            source: { type: "base64", media_type: mediaType, data: base64 },
          },
          {
            type: "text",
            text: "Analyze this problem and the student's answer, then call record_answer_check.",
          },
        ],
      },
    ],
  });

  const toolUse = response.content.find((block) => block.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("Could not read the AI analysis result.");
  }

  return toolUse.input as Analysis;
}
