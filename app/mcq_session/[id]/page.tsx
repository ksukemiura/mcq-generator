"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/database.types";
import { Button } from "@/components/ui/button";
import styles from "./page.module.css";

type McqQuestion = Database["public"]["Tables"]["mcq_questions"]["Row"];
type McqChoice = Database["public"]["Tables"]["mcq_choices"]["Row"];
type McqQuestionWithChoices = McqQuestion & { mcq_choices: McqChoice[] };
type McqSessionAnswer = Database["public"]["Tables"]["mcq_session_answers"]["Row"];

export default function Page() {
  const supabase = createClient();
  const { id: sessionId } = useParams<{ id: string }>();

  const [mcqSetTitle, setMcqSetTitle] = useState<string | null>(null);
  const [questions, setQuestions] = useState<McqQuestionWithChoices[]>([]);
  const [selections, setSelections] = useState<Record<string, string>>({});

  useEffect(() => {
    async function run() {
      try {
        const { data: session, error: sessionError } = await supabase
          .from("mcq_sessions")
          .select("id, mcq_set_id")
          .eq("id", sessionId)
          .single();
        if (sessionError) {
          throw sessionError;
        }

        const { data: mcqSet, error: mcqSetError } = await supabase
          .from("mcq_sets")
          .select("title")
          .eq("id", session.mcq_set_id)
          .single();
        if (mcqSetError) {
          throw mcqSetError;
        }
        setMcqSetTitle(mcqSet.title);

        const { data: questions, error: questionsError } = await supabase
          .from("mcq_questions")
          .select("*, mcq_choices (*)")
          .eq("mcq_set_id", session.mcq_set_id);
        if (questionsError) {
          throw questionsError;
        }
        setQuestions((questions ?? []) as McqQuestionWithChoices[]);
      } catch (error) {
        console.error(error);
      }
    }

    run();
  }, [sessionId, supabase]);

  const allAnswered = useMemo(() => {
    if (!questions.length) {
      return false;
    }
    return questions.every((question) => selections[question.id]);
  }, [questions, selections]);

  function onSelect(questionId: string, choiceId: string) {
    setSelections((prev) => ({ ...prev, [questionId]: choiceId }));
  }

  async function onSubmit() {
    try {
      if (!sessionId) {
        throw new Error("No session id");
      }
      if (!questions.length) {
        throw new Error("No questions loaded");
      }

      const mcqSessionAnswers =
        questions.map((question) => ({
          mcq_session_id: sessionId,
          mcq_question_id: question.id,
          mcq_choice_id: selections[question.id],
        }));

      const { error } = await supabase
        .from("mcq_session_answers")
        .upsert(mcqSessionAnswers, { onConflict: "mcq_session_id,mcq_question_id" });

      if (error) {
        throw error;
      }

      // e.g., router.push(`/sessions/${sessionId}/result`)
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{mcqSetTitle}</h1>
      <ul className={styles.list}>
        {questions.map((question, questionIndex) => (
          <li
            key={question.id}
            className={styles.questionItem}
          >
            <div className={styles.questionText}>
              <strong>Q{questionIndex + 1}. {question.question}</strong>
            </div>
            <div className={styles.choices}>
              {question.mcq_choices
                .slice()
                .map((choice, choiceIndex) => {
                  const checked = (selections[question.id] === choice.id);
                  return (
                    <label
                      key={choice.id}
                      className={`${styles.choiceLabel} ${checked ? styles.choiceLabelChecked : ""}`}
                    >
                      <input
                        type="radio"
                        name={question.id}
                        value={choice.id}
                        checked={!!checked}
                        onChange={() => onSelect(question.id, choice.id)}
                        className={styles.radio}
                      />
                      <span className={styles.choiceText}>
                        {choiceIndex + 1}. {choice.choice}
                      </span>
                    </label>
                  );
                })}
            </div>
          </li>
        ))}
      </ul>
      <div>
        <Button
          onClick={onSubmit}
          disabled={!allAnswered}
          className={styles.submitBtn}
        >
          Submit
        </Button>
      </div>
    </div>
  );
}
