// src/lib/firestore-crud.ts
import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  QueryConstraint,
  DocumentData,
  WithFieldValue,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

// ── 단일 문서 조회
export async function fetchDoc<T>(
  collectionName: string,
  docId: string,
): Promise<T | null> {
  const snap = await getDoc(doc(db, collectionName, docId));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    id: snap.id,
    ...data,
    createdAt: data.createdAt?.toDate?.() ?? data.createdAt,
    updatedAt: data.updatedAt?.toDate?.() ?? data.updatedAt,
  } as T;
}

// ── 컬렉션 전체 조회
export async function fetchCollection<T>(
  collectionName: string,
  constraints: QueryConstraint[] = [],
): Promise<T[]> {
  const q = query(collection(db, collectionName), ...constraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate?.() ?? data.createdAt,
      updatedAt: data.updatedAt?.toDate?.() ?? data.updatedAt,
    } as T;
  });
}

// ── 문서 생성 (자동 ID)
export async function createDoc<T extends DocumentData>(
  collectionName: string,
  data: WithFieldValue<T>,
): Promise<string> {
  const ref = await addDoc(collection(db, collectionName), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

// ── 문서 생성 (지정 ID)
export async function setDocById<T extends DocumentData>(
  collectionName: string,
  docId: string,
  data: WithFieldValue<T>,
): Promise<void> {
  await setDoc(doc(db, collectionName, docId), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

// ── 문서 수정
export async function updateDocById<T extends DocumentData>(
  collectionName: string,
  docId: string,
  data: Partial<WithFieldValue<T>>,
): Promise<void> {
  await updateDoc(doc(db, collectionName, docId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

// ── 문서 삭제
export async function deleteDocById(
  collectionName: string,
  docId: string,
): Promise<void> {
  await deleteDoc(doc(db, collectionName, docId));
}

// ── 서브컬렉션 문서 생성 (지정 ID)
export async function setSubDoc<T extends DocumentData>(
  collectionName: string,
  docId: string,
  subCollection: string,
  subDocId: string,
  data: WithFieldValue<T>,
): Promise<void> {
  await setDoc(doc(db, collectionName, docId, subCollection, subDocId), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

// ── 서브컬렉션 문서 삭제
export async function deleteSubDoc(
  collectionName: string,
  docId: string,
  subCollection: string,
  subDocId: string,
): Promise<void> {
  await deleteDoc(doc(db, collectionName, docId, subCollection, subDocId));
}

// ── 서브컬렉션 전체 조회
export async function fetchSubCollection<T>(
  collectionName: string,
  docId: string,
  subCollection: string,
  constraints: QueryConstraint[] = [],
): Promise<T[]> {
  const q = query(
    collection(db, collectionName, docId, subCollection),
    ...constraints,
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as T[];
}
