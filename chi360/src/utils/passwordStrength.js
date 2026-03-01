// Returns score 0-4 and label/color for password strength
export function getPasswordStrength(password) {
  if (!password) return { score: 0, label: '', color: '#e0e0e8', checks: getChecks('') };

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  // Cap at 4
  score = Math.min(score, 4);

  const levels = [
    { label: 'Too weak',  color: '#ef4444' },
    { label: 'Weak',      color: '#f97316' },
    { label: 'Fair',      color: '#eab308' },
    { label: 'Strong',    color: '#22c55e' },
    { label: 'Very strong', color: '#4f6ef7' },
  ];

  return { score, ...levels[score], checks: getChecks(password) };
}

function getChecks(password) {
  return [
    { label: '8+ characters',        pass: password.length >= 8 },
    { label: 'Uppercase letter',      pass: /[A-Z]/.test(password) },
    { label: 'Number',                pass: /[0-9]/.test(password) },
    { label: 'Special character',     pass: /[^A-Za-z0-9]/.test(password) },
  ];
}
