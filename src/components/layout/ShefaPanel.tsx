"use client";

import { Sparkles } from "lucide-react";

export function ShefaPanel() {
  return (
    <button
      type="button"
      className="fixed bottom-5 start-[72px] z-[100] flex items-center justify-center w-10 h-10 rounded-full bg-gold shadow-lg hover:bg-gold-dark transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
      aria-label="Shefa AI Assistant"
    >
      <Sparkles className="w-[18px] h-[18px] text-white" />
    </button>
  );
}
