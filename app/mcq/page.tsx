"use client";

import React, { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type MCQ = {
  question: string;
  choices: [string, string, string, string];
  answer_index: 0 | 1 | 2 | 3;
};

export default function Page() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const text = String(formData.get("text")).trim();

    if (!text) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/mcq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Request failed: ${res.status} ${text}`);
      }

      const mcqs: MCQ[] = await res.json();

      // 1. Create a new mcq_set
      const mcqSetId = crypto.randomUUID();
      const title = "test";
      const { error: error1 } = await supabase
          .from("mcq_sets")
          .insert([
            {
              id: mcqSetId,
              title: title,
            },
          ]);
      if (error1) {
        throw error1;
      }

      // 2. Insert mcqs into mcq_set
      const mcqQuestions = mcqs?.map((mcq) => ({
        id: crypto.randomUUID(),
        mcq_set_id: mcqSetId,
        question: mcq.question,
      }));
      const { error: error2 } = await supabase
        .from("mcq_questions")
        .insert(mcqQuestions);
      if (error2) {
        throw error2;
      }

      // 3. Return mcq_set_id
      const mcqQuestionIds = mcqQuestions?.map((mcqQuestion) => (mcqQuestion.id));
      console.log("mcqQuestionIds: ", mcqQuestionIds);
      const mcqChoices = mcqs?.flatMap(({ choices, answer_index }, i) => (
        choices.map((choice, j) => ({
          mcq_question_id: mcqQuestionIds?.[i],
          choice,
          is_correct: j === answer_index,
        }))
      ));
      console.log("mcqChoices: ", mcqChoices);
      const { error: error3 } = await supabase
        .from("mcq_choices")
        .insert(mcqChoices);
      if (error3) {
        throw error3;
      }
    } catch (error: any) {
      console.error(error?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <textarea name="text" placeholder="Enter your question" required />
        <button type="submit" disabled={loading}>
          {loading ? "Generating…" : "Generate MCQ"}
        </button>
      </form>
    </>
  );
}
