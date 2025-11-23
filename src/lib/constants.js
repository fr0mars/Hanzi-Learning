import { BookOpen, Brain, Flame, Trophy, Zap } from 'lucide-react';

export const TONE_COLORS = {
  1: "text-red-400 border-red-500",
  2: "text-emerald-400 border-emerald-500",
  3: "text-blue-400 border-blue-500",
  4: "text-purple-400 border-purple-500",
  5: "text-slate-400 border-slate-500"
};

export const TYPE_COLORS = {
  radical: "bg-sky-600 border-sky-500 text-white",
  kanji: "bg-pink-600 border-pink-500 text-white",
  vocabulary: "bg-violet-600 border-violet-500 text-white"
};

export const FACTIONS = {
  DRAGON: { name: "Dragon", color: "text-cyan-400", icon: "🐉", bg: "from-cyan-900 to-slate-900", description: "Priorité aux concepts abstraits et à la nature." },
  TURTLE: { name: "Tortue", color: "text-emerald-400", icon: "🐢", bg: "from-emerald-900 to-slate-900", description: "Priorité aux bases solides et à la structure." },
  PHOENIX: { name: "Phoénix", color: "text-rose-400", icon: "🦅", bg: "from-rose-900 to-slate-900", description: "Priorité à l'expression et aux émotions." },
  TIGER: { name: "Tigre", color: "text-amber-100", icon: "🐯", bg: "from-amber-900 to-slate-900", description: "Priorité à l'action et au mouvement." }
};
