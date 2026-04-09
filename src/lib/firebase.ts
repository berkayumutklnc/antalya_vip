"use client";

import { getApps, getApp, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

function requireClientEnv(name: string): string {
  const val = process.env[name];
  if (!val) {
    throw new Error(
      `[firebase] Missing required client env var: ${name}. ` +
      `Check .env.local — see .env.example for reference.`,
    );
  }
  return val;
}

function buildConfig() {
  return {
    apiKey: requireClientEnv("NEXT_PUBLIC_FIREBASE_API_KEY"),
    authDomain: requireClientEnv("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"),
    projectId: requireClientEnv("NEXT_PUBLIC_FIREBASE_PROJECT_ID"),
    storageBucket: requireClientEnv("NEXT_PUBLIC_FIREBASE_STORAGE"),
    messagingSenderId: requireClientEnv("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"),
    appId: requireClientEnv("NEXT_PUBLIC_FIREBASE_APP_ID"),
  };
}

let _app: FirebaseApp | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (_app) return _app;
  if (typeof window === "undefined") {
    throw new Error("Firebase client sadece client bileşenlerde kullanılmalı.");
  }
  _app = getApps().length ? getApp() : initializeApp(buildConfig());
  return _app;
}

export function getClientAuth(): Auth {
  return getAuth(getFirebaseApp());
}

export function getClientDb(): Firestore {
  return getFirestore(getFirebaseApp());
}
