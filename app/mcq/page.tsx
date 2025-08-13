"use client";

import React, { FormEvent, useState } from "react";

type MCQ = {
  question: string;
  choices: [string, string, string, string];
  answer_index: 0 | 1 | 2 | 3;
};

export default function Page() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mcqs, setMcqs] = useState<MCQ[] | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setMcqs(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const text = String(formData.get("text") || "").trim();

    if (!text) {
      setError("Please enter a question");
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

      const data: MCQ[] = await res.json();
      setMcqs(data);
    } catch (error: any) {
      setError(error?.message || "Something went wrong");
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

      {error && <p style={{ color: "red" }}>{error}</p>}

      {mcqs && mcqs.length > 0 && (
        <div>
          <h2>Generated MCQs</h2>
          <ol>
            {mcqs.map((mcq, idx) => (
              <li key={idx}>
                <p>{mcq.question}</p>
                <ul>
                  {mcq.choices.map((c, i) => (
                    <li key={i}>
                      {String.fromCharCode(65 + i)}. {c} {i === mcq.answer_index ? "(Answer)" : ""}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </div>
      )}
    </>
  );
}
