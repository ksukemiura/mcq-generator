"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/database.types";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type McqQuestion = Database["public"]["Tables"]["mcq_questions"]["Row"];
type McqChoice = Database["public"]["Tables"]["mcq_choices"]["Row"];
type McqQuestionWithChoices = McqQuestion & { mcq_choices: McqChoice[] };

export default function Page() {
  const supabase = createClient();
  const { id: mcqSetId } = useParams<{ id: string }>();
  const [mcqQuestions, setMcqQuestions] = useState<McqQuestionWithChoices[]>([]);
  const router = useRouter();

  async function getMcqQuestions(mcqSetId: string): Promise<McqQuestionWithChoices[]> {
    const { data, error } = await supabase
      .from("mcq_questions")
      .select("*, mcq_choices (*)")
      .eq("mcq_set_id", mcqSetId)
      .order("created_at", { ascending: false });
    if (error) {
      throw error;
    }
    console.log(data);
    return (data ?? []) as McqQuestionWithChoices[];
  }

  async function handleStartSession() {
    try {
      const { data, error } = await supabase
        .from("mcq_sessions")
        .insert({ mcq_set_id: mcqSetId })
        .select("id")
        .single();
      if (error) {
        throw error;
      }
      if (data?.id) {
        router.push(`/mcq_session/${data.id}`);
      }
    } catch (error) {
      console.error("Failed to start session", error);
    }
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
      <div style={{ margin: "12px 0" }}>
        <Button onClick={handleStartSession}>Start a session</Button>
      </div>
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

