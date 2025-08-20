"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/database.types";
import { Button } from "@/components/ui/button";
import styles from "../page.module.css";

type McqQuestion = Database["public"]["Tables"]["mcq_questions"]["Row"];
type McqChoice = Database["public"]["Tables"]["mcq_choices"]["Row"];
type McqQuestionWithChoices = McqQuestion & { mcq_choices: McqChoice[] };
type McqSession = Database["public"]["Tables"]["mcq_sessions"]["Row"];
type McqSessionAnswer = Database["public"]["Tables"]["mcq_session_answers"]["Row"];

export default function ResultPage() {
  const supabase = createClient();
  const { id: sessionId } = useParams<{ id: string }>();

  const [mcqSetTitle, setMcqSetTitle] = useState<string>("");
  const [session, setSession] = useState<
    Pick<McqSession, "id" | "mcq_set_id" | "correct_count" | "created_at"> | null
  >(null);
  const [questions, setQuestions] = useState<McqQuestionWithChoices[]>([]);
  const [answers, setAnswers] = useState<
    Pick<McqSessionAnswer, "mcq_question_id" | "mcq_choice_id" | "is_correct">[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function run() {
      try {
        if (!sessionId) return;

        // 1) Load session
        const { data: s, error: sessionErr } = await supabase
          .from("mcq_sessions")
          .select("id, mcq_set_id, correct_count, created_at")
          .eq("id", sessionId)
          .single();
        if (sessionErr) throw sessionErr;
        setSession(s);

        // 2) Load set title
        const { data: setRow, error: setErr } = await supabase
          .from("mcq_sets")
          .select("title")
          .eq("id", s.mcq_set_id)
          .single();
        if (setErr) throw setErr;
        setMcqSetTitle(setRow.title);

        // 3) Load questions + choices
        const { data: qs, error: qErr } = await supabase
          .from("mcq_questions")
          .select("*, mcq_choices (*)")
          .eq("mcq_set_id", s.mcq_set_id);
        if (qErr) throw qErr;
        setQuestions((qs ?? []) as McqQuestionWithChoices[]);

        // 4) Load user answers
        const { data: as, error: aErr } = await supabase
          .from("mcq_session_answers")
          .select("mcq_question_id, mcq_choice_id, is_correct")
          .eq("mcq_session_id", sessionId);
        if (aErr) throw aErr;
        setAnswers(as ?? []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    run();
  }, [sessionId, supabase]);

  const answersByQ = useMemo(() => {
    const m: Record<string, { choiceId: string; isCorrect: boolean | null }> = {};
    for (const a of answers) {
      m[a.mcq_question_id] = { choiceId: a.mcq_choice_id, isCorrect: a.is_correct };
    }
    return m;
  }, [answers]);

  const total = questions.length;
  const correct =
    session?.correct_count ?? answers.reduce((acc, a) => acc + (a.is_correct ? 1 : 0), 0);
  const percent = total ? Math.round((correct / total) * 100) : 0;

  if (loading) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Loading results…</h1>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>{mcqSetTitle}</h1>
        <div className={styles.score}>
          Score: <strong>{correct} / {total}</strong> ({percent}%)
        </div>
        {session?.created_at && (
          <div className={styles.sessionMeta}>
            Started: {new Date(session.created_at).toLocaleString()}
          </div>
        )}
      </header>

      <ul className={styles.list}>
        {questions.map((q, qIdx) => {
          const ans = answersByQ[q.id];
          const selectedChoiceId = ans?.choiceId;
          const selectedIsCorrect = ans?.isCorrect ?? null;

          return (
            <li key={q.id} className={styles.questionItem}>
              <div className={`${styles.questionText} ${styles.questionHeader}`}>
                <strong>Q{qIdx + 1}. {q.question}</strong>
                {selectedIsCorrect === true && <span aria-label="correct">✅</span>}
                {selectedIsCorrect === false && <span aria-label="incorrect">❌</span>}
              </div>

              <div className={styles.choices}>
                {q.mcq_choices.slice().map((choice, cIdx) => {
                  const isSelected = selectedChoiceId === choice.id;
                  // Assuming mcq_choices has boolean "is_correct"
                  const isCorrectChoice = (choice as any).is_correct === true;

                  const cardStateClass =
                    isSelected && selectedIsCorrect
                      ? styles.selectedCorrect
                      : isSelected && !selectedIsCorrect
                      ? styles.selectedWrong
                      : !isSelected && isCorrectChoice
                      ? styles.correctChoice
                      : "";

                  return (
                    <div
                      key={choice.id}
                      className={[
                        styles.choiceLabel,
                        styles.choiceCard,
                        isSelected ? styles.choiceLabelChecked : "",
                        cardStateClass,
                      ].filter(Boolean).join(" ")}
                    >
                      <span
                        className={[
                          styles.choiceText,
                          isSelected ? styles.choiceTextSelected : "",
                        ].filter(Boolean).join(" ")}
                      >
                        {cIdx + 1}. {choice.choice}
                      </span>

                      {isSelected && selectedIsCorrect === true && (
                        <span className={styles.answerNote}>(Your answer ✓)</span>
                      )}
                      {isSelected && selectedIsCorrect === false && (
                        <span className={styles.answerNote}>(Your answer)</span>
                      )}
                      {!isSelected && isCorrectChoice && (
                        <span className={styles.answerNote}>(Correct)</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </li>
          );
        })}
      </ul>

      <div className={styles.actions}>
        <Link href={`/mcq_session/${sessionId}`}>
          <Button variant="outline">Back to session</Button>
        </Link>
        {session?.mcq_set_id && (
          <Link href={`/mcq_set/${session.mcq_set_id}`}>
            <Button>Go to set</Button>
          </Link>
        )}
      </div>
    </div>
  );
}
