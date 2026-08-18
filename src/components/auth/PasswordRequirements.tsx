'use client';

import { Check, Circle } from 'lucide-react';
import { PASSWORD_RULES } from '@/lib/passwordValidation';

interface PasswordRequirementsProps {
  password: string;
  showAlways?: boolean;
}

export function PasswordRequirements({
  password,
  showAlways = false,
}: PasswordRequirementsProps) {
  // If user hasn't started typing and showAlways is false, hide to keep UI minimal
  if (!password && !showAlways) {
    return null;
  }

  const passedRules = PASSWORD_RULES.filter((rule) => rule.test(password || ''));
  const score = passedRules.length;

  const strengthLabels = ['Too Weak', 'Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = [
    'bg-[#D73A49]', // 0 - Red
    'bg-[#D73A49]', // 1 - Red
    'bg-[#E36209]', // 2 - Orange
    'bg-[#D97706]', // 3 - Amber
    'bg-[#2E7D32]', // 4 - Emerald
    'bg-[#1E7E34]', // 5 - Green
  ];

  return (
    <div className="p-3.5 rounded-2xl bg-[#F5F3ED] border border-[#E2DDD2] space-y-2.5 animate-fade-in text-xs">
      {/* Strength Bar */}
      <div>
        <div className="flex items-center justify-between text-[11px] font-semibold text-[#73796E] mb-1.5">
          <span>Password Strength</span>
          <span
            className={`font-bold transition-colors ${
              score === 5
                ? 'text-[#1E7E34]'
                : score >= 3
                ? 'text-[#D97706]'
                : 'text-[#D73A49]'
            }`}
          >
            {password ? strengthLabels[score] : 'Required'} ({score}/5)
          </span>
        </div>
        <div className="h-1.5 w-full bg-[#EAE6DC] rounded-full overflow-hidden flex gap-1">
          {[1, 2, 3, 4, 5].map((step) => (
            <div
              key={step}
              className={`h-full flex-1 rounded-full transition-all duration-300 ${
                score >= step ? strengthColors[score] : 'bg-transparent'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Rules Checklist */}
      <div className="space-y-1.5 pt-1 border-t border-[#EAE6DC]">
        {PASSWORD_RULES.map((rule) => {
          const isPassed = rule.test(password || '');
          return (
            <div
              key={rule.id}
              className={`flex items-center gap-2 transition-all text-[11px] ${
                isPassed ? 'text-[#1E7E34] font-medium' : 'text-[#73796E]'
              }`}
            >
              {isPassed ? (
                <div className="w-3.5 h-3.5 rounded-full bg-[#EDF7EE] border border-[#CCE8CD] flex items-center justify-center shrink-0">
                  <Check className="w-2.5 h-2.5 text-[#1E7E34] stroke-[3]" />
                </div>
              ) : (
                <div className="w-3.5 h-3.5 rounded-full border border-[#C5BFB5] flex items-center justify-center shrink-0">
                  <Circle className="w-1.5 h-1.5 fill-transparent text-transparent" />
                </div>
              )}
              <span>{rule.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
