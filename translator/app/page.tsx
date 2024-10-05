"use client";
import { translate } from "@/app/lib/groq-translator";

export default function Home() {
  return (
    <>
      <button onClick={translate}>Translate</button>
    </>
  );
}
