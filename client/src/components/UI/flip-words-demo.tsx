import React from "react";
import { FlipWords } from "./flip-words";

export default function FlipWordsDemo() {
  const words = ["scalable", "robust", "efficient", "innovative"];

  return (
    <div className="h-[15rem] flex justify-center items-center px-4">
      <div className="text-4xl mx-auto font-normal text-neutral-600 dark:text-neutral-400">
        Build
        <FlipWords words={words} /> <br />
        solutions with MLL Toll Calculator
      </div>
    </div>
  );
} 