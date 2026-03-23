"use client";

import { Sparkles } from "lucide-react";

export function ShefaPanel() {
  return (
    <button
      type="button"
      className="fixed bottom-5 start-[72px] z-[100] flex items-center justify-center w-10 h-10 rounded-full shadow-lg transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      style={{ background: "var(--accent-teal)", color: "#fff" }}
      aria-label="Shefa AI Assistant"
    >
      <Sparkles className="w-[18px] h-[18px] text-white" />
    </button>
  );
}
