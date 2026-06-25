// src/hooks/useAuth.ts
"use client";

import { useEffect } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useAuthStore } from "@/store/authStore";
import { User } from "@/types";

export function useAuthListener() {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Firestore에서 유저 정보 가져오기
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        if (userDoc.exists()) {
          setUser({ id: firebaseUser.uid, ...userDoc.data() } as User);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setLoading]);
}

export function useAuth() {
  const { user, loading } = useAuthStore();

  // 이메일 회원가입
  const signUp = async (email: string, password: string, name: string) => {
    const { user: firebaseUser } = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );

    // Firebase Auth 프로필 업데이트
    await updateProfile(firebaseUser, { displayName: name });

    // Firestore에 유저 문서 생성
    const newUser: Omit<User, "id"> = {
      email,
      name,
      role: "customer",
      addresses: [],
      createdAt: new Date(),
    };
    await setDoc(doc(db, "users", firebaseUser.uid), {
      ...newUser,
      createdAt: serverTimestamp(),
    });

    return firebaseUser;
  };

  // 이메일 로그인
  const signIn = async (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  // 구글 로그인
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const { user: firebaseUser } = await signInWithPopup(auth, provider);

    // 신규 유저면 Firestore에 생성
    const userRef = doc(db, "users", firebaseUser.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      await setDoc(userRef, {
        email: firebaseUser.email,
        name: firebaseUser.displayName,
        role: "customer",
        addresses: [],
        createdAt: serverTimestamp(),
      });
    }

    return firebaseUser;
  };

  // 로그아웃
  const logOut = async () => {
    await signOut(auth);
  };

  return { user, loading, signUp, signIn, signInWithGoogle, logOut };
}
