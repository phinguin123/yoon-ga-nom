import type { ChallengeRule } from "../challengeRules";
import { cn } from "@/lib/utils";

interface ChallengeRulesProps {
  rules: ChallengeRule[];
  className?: string;
}

export function ChallengeRules({ rules, className }: ChallengeRulesProps) {
  if (rules.length === 0) return null;

  return (
    <section
      className={cn(
        "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6",
        className,
      )}
      aria-labelledby="challenge-rules-heading"
    >
      <h2
        id="challenge-rules-heading"
        className="font-display text-lg font-bold text-slate-900"
      >
        Rules
      </h2>

      <ol className="mt-4 space-y-2.5">
        {rules.map((rule, index) => (
          <li key={`${index}-${rule.text}`} className="flex gap-3 text-sm sm:text-base">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 font-display text-xs font-bold text-slate-500">
              {index + 1}
            </span>
            <span
              className={cn(
                "leading-relaxed",
                rule.variant === "special"
                  ? "bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-500 bg-clip-text font-semibold text-transparent"
                  : "font-medium text-slate-700",
              )}
            >
              {rule.text}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
