/**
 * Password validation criteria & helpers for AILB platform
 *
 * Rules:
 * 1. Minimum 8 characters
 * 2. At least one lowercase letter (a-z)
 * 3. At least one uppercase letter (A-Z)
 * 4. At least one number (0-9)
 * 5. At least one special character (!@#$%^&*...)
 */

export interface PasswordRule {
  id: 'length' | 'lowercase' | 'uppercase' | 'number' | 'special';
  label: string;
  test: (pw: string) => boolean;
}

export const PASSWORD_RULES: PasswordRule[] = [
  {
    id: 'length',
    label: 'At least 8 characters',
    test: (pw: string) => pw.length >= 8,
  },
  {
    id: 'lowercase',
    label: 'At least one lowercase letter (a-z)',
    test: (pw: string) => /[a-z]/.test(pw),
  },
  {
    id: 'uppercase',
    label: 'At least one uppercase letter (A-Z)',
    test: (pw: string) => /[A-Z]/.test(pw),
  },
  {
    id: 'number',
    label: 'At least one number (0-9)',
    test: (pw: string) => /[0-9]/.test(pw),
  },
  {
    id: 'special',
    label: 'At least one special character (!@#$%^&*)',
    test: (pw: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`§±]/.test(pw),
  },
];

export function getPasswordRuleStatuses(password: string): Record<string, boolean> {
  const result: Record<string, boolean> = {};
  for (const rule of PASSWORD_RULES) {
    result[rule.id] = rule.test(password || '');
  }
  return result;
}

export function isPasswordValid(password: string): boolean {
  if (!password) return false;
  return PASSWORD_RULES.every((rule) => rule.test(password));
}

export function validatePassword(password: string): { isValid: boolean; error?: string } {
  if (!password) {
    return { isValid: false, error: 'Password is required.' };
  }
  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters.' };
  }
  if (!/[a-z]/.test(password)) {
    return { isValid: false, error: 'Password must include at least one lowercase letter (a-z).' };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: 'Password must include at least one uppercase letter (A-Z).' };
  }
  if (!/[0-9]/.test(password)) {
    return { isValid: false, error: 'Password must include at least one number (0-9).' };
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`§±]/.test(password)) {
    return {
      isValid: false,
      error: 'Password must include at least one special character (e.g. !@#$%^&*).',
    };
  }
  return { isValid: true };
}
