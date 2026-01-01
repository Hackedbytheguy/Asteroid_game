"use client";
import dynamic from "next/dynamic";

const Game = dynamic(() => import("../components/Game"), { ssr: false });

export default function Astroid() {
  return (
    <main>
      <Game />
    </main>
  );
}
