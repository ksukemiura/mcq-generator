"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type McqSet = {
  id: string,
  title: string,
  created_at: string,
}

export default function Page() {
  const supabase = createClient();
  const [mcqSets, setMcqSets] = useState<McqSet[]>([]);

  async function getMcqSets(): Promise<McqSet[]> {
    const { data, error } = await supabase
      .from("mcq_sets")
      .select();
    if (error) {
      throw error;
    }
    return data;
  }

  useEffect(() => {
    (async () => {
      const mcqSets = await getMcqSets();
      setMcqSets(mcqSets);
    })();
  }, [supabase]);

  return (
    <>
      <h1>MCQ Sets</h1>
      <ul>
        {mcqSets.map((mcqSet) => (
          <li key={mcqSet.id}>
            <Link href={`/mcq_set/${mcqSet.id}`}>
              <div>
                <p>{mcqSet.title}</p>
                <p>{mcqSet.created_at}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
