// src/hooks/useFirestore.ts
import { useState, useEffect } from "react";
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

  // enabled가 false면 처음부터 loading을 false로 초기화
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(enabled); // ← 이렇게 초기값으로 처리
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!enabled) return; // ← setState 호출 없이 그냥 return

    let cancelled = false;

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
  }, [collectionName, enabled]); // eslint-disable-line

  return { data, loading, error };
}
