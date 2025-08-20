import {
  NextRequest,
  NextResponse,
} from "next/server";
import OpenAI from "openai";
import type { MCQ } from "@/types/mcq";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: NextRequest) {
  const { text } = await request.json();
  const result = await generateMcqsFromText(text);
  return NextResponse.json(result);
}

async function generateMcqsFromText(text: string): Promise<MCQ[]> {
  const response = await client.responses.create({
    model: "gpt-5-mini",
    input: [
      { role: "user", content: text },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "mcq_set",
        schema: {
          type: "object",
          properties: {
            mcqs: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  question: {
                    type: "string",
                    description: "Question",
                  },
                  choices: {
                    type: "array",
                    description: "Choices",
                    items: {
                      type: "string",
                    },
                    minItems: 4,
                    maxItems: 4,
                  },
                  answer_index: {
                    type: "integer",
                    description: "Answer index",
                    enum: [0, 1, 2, 3],
                  },
                },
                required: [
                  "question",
                  "choices",
                  "answer_index",
                ],
                additionalProperties: false,
              },
            },
          },
          required: [
            "mcqs",
          ],
          additionalProperties: false,
        },
      },
    },
  });

  const json = JSON.parse(response.output_text);
  return json.mcqs;
}
