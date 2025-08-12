import {
  NextRequest,
  NextResponse,
} from "next/server";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: NextRequest) {
  const { text } = await request.json();
  const result = await text2json(text);
  return NextResponse.json(result);
}

type MCQ = {
  question: string;
  choices: [string, string, string, string];
  answer: 0 | 1 | 2 | 3;
};

async function text2json(text: string): Promise<MCQ> {
  const response = await client.responses.create({
    model: "gpt-5-mini",
    input: [
      { role: "user", content: text },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "mcq",
        schema: {
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
            answer: {
              type: "integer",
              description: "Answer index",
              enum: [0, 1, 2, 3],
            },
          },
          required: [
            "question",
            "choices",
            "answer",
          ],
          additionalProperties: false,
        },
      },
    },
  });

  return JSON.parse(response.output_text);
}
