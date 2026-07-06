// src/hooks/useFirestore.ts
import { useState, useEffect, useRef } from "react";
import {
  collection,
  query,
  getDocs,
  QueryConstraint,
  DocumentData,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

interface UseCollectionOptions {
  constraints?: QueryConstraint[];
  enabled?: boolean;
}

export function useCollection<T = DocumentData>(
  collectionName: string,
  options: UseCollectionOptions = {},
) {
  const { constraints = [], enabled = true } = options;
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<Error | null>(null);

  // constraints를 JSON으로 직렬화해서 변경 감지
  // (객체 참조가 매 렌더마다 달라지는 문제 해결)
  const constraintsKey = JSON.stringify(constraints.map((c) => c.type));

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    setLoading(true);

    const fetchData = async () => {
      try {
        const q = query(collection(db, collectionName), ...constraints);
        const snapshot = await getDocs(q);
        if (cancelled) return;

        const result = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate?.() ?? data.createdAt,
            updatedAt: data.updatedAt?.toDate?.() ?? data.updatedAt,
          };
        }) as T[];

        setData(result);
      } catch (err) {
        if (!cancelled) setError(err as Error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [collectionName, enabled, constraintsKey]); // eslint-disable-line

  return { data, loading, error };
}
