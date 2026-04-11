"use client";

import { getApps, getApp, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

function optionalClientEnv(name: string): string {
  return process.env[name] || "";
}

function isConfigured(): boolean {
  return !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
}

function buildConfig() {
  return {
    apiKey: optionalClientEnv("NEXT_PUBLIC_FIREBASE_API_KEY"),
    authDomain: optionalClientEnv("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"),
    projectId: optionalClientEnv("NEXT_PUBLIC_FIREBASE_PROJECT_ID"),
    storageBucket: optionalClientEnv("NEXT_PUBLIC_FIREBASE_STORAGE"),
    messagingSenderId: optionalClientEnv("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"),
    appId: optionalClientEnv("NEXT_PUBLIC_FIREBASE_APP_ID"),
  };
}

let _app: FirebaseApp | null = null;

/** Returns true if Firebase client env vars are set */
export function isFirebaseConfigured(): boolean {
  return isConfigured();
}

export function getFirebaseApp(): FirebaseApp {
  if (_app) return _app;
  if (typeof window === "undefined") {
    throw new Error("Firebase client sadece client bileşenlerde kullanılmalı.");
  }
  if (!isConfigured()) {
    throw new Error(
      "[firebase] Client env vars not configured. Set NEXT_PUBLIC_FIREBASE_* in Vercel dashboard.",
    );
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
