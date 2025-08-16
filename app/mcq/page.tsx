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

      await saveMcqSet(mcqs, "test");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function saveMcqSet(mcqs: MCQ[], title: string) {
    // Save a MCQ set into Supabase
    const mcqSetId = crypto.randomUUID();
    const { error: error1 } = await supabase
      .from("mcq_sets")
      .insert({
        id: mcqSetId,
        title: title,
      });
    if (error1) {
      throw error1;
    }

    // Save MCQ questions into Supabase
    const mcqQuestionIds = Array.from({ length: mcqs.length }, () => crypto.randomUUID());
    const mcqQuestions = mcqs.map((mcq, questionIndex) => ({
      id: mcqQuestionIds[questionIndex],
      mcq_set_id: mcqSetId,
      question: mcq.question,
    }));
    const { error: error2 } = await supabase
      .from("mcq_questions")
      .insert(mcqQuestions);
    if (error2) {
      throw error2;
    }

    // Save MCQ choices into Supabase
    const mcqChoices = mcqs.flatMap(({ choices, answerIndex }, questionIndex) => (
      choices.map((choice, choiceIndex) => ({
        mcq_question_id: mcqQuestionIds[questionIndex],
        choice: choice,
        is_correct: choiceIndex === answerIndex,
      }))
    ));
    const { error: error3 } = await supabase
      .from("mcq_choices")
      .insert(mcqChoices);
    if (error3) {
      throw error3;
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
