"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type McqChoice = {
  id: string,
  choice: string,
  is_correct: boolean,
}

type McqQuestion = {
  id: string,
  question: string,
  created_at: string,
  mcq_choices: McqChoice[],
}

export default function Page() {
  const supabase = createClient();
  const { id: mcqSetId } = useParams<{ id: string }>();
  const [mcqQuestions, setMcqQuestions] = useState<McqQuestion[]>([]);

  async function getMcqQuestions(mcqSetId: string): Promise<McqQuestion[]> {
    const { data, error } = await supabase
      .from("mcq_questions")
      .select(`
        id,
        question,
        created_at,
        mcq_choices (
          id,
          choice,
          is_correct
        )
      `)
      .eq("mcq_set_id", mcqSetId)
      .order("created_at", { ascending: false });
    if (error) {
      throw error;
    }
    console.log(data);
    return data;
  }

  useEffect(() => {
    (async () => {
      const mcqQuestions = await getMcqQuestions(mcqSetId);
      setMcqQuestions(mcqQuestions);
    })();
  }, [mcqSetId]);

  return (
    <>
      <h1>MCQ Questions</h1>
      <ul>
        {mcqQuestions.map((mcqQuestion, questionIndex) => (
          <li key={mcqQuestion.id}>
            <div>
              <p>Q{questionIndex + 1}. {mcqQuestion.question}</p>
              <ul>
                {mcqQuestion.mcq_choices.map((mcqChoice, choiceIndex) => (
                  <li key={mcqChoice.id}>{choiceIndex + 1}. {mcqChoice.choice}</li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
