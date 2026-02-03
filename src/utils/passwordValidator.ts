import zxcvbn from 'zxcvbn';

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: number; // 0-4
  strengthLabel: string;
}

const COMMON_PASSWORDS = [
  '123456', 'password', '123456789', '12345678', '12345',
  '111111', '1234567', 'sunshine', 'qwerty', 'iloveyou',
  'princess', 'admin', 'welcome', '666666', 'abc123',
  'senha', 'senha123', '123mudar', 'mudar123', 'admin123'
];

const STRENGTH_LABELS = ['Muito Fraca', 'Fraca', 'Média', 'Forte', 'Muito Forte'];

export const validatePassword = (password: string): PasswordValidationResult => {
  const errors: string[] = [];

  // Mínimo 8 caracteres
  if (password.length < 8) {
    errors.push('A senha deve ter no mínimo 8 caracteres');
  }

  // Máximo razoável para prevenir DoS
  if (password.length > 128) {
    errors.push('A senha deve ter no máximo 128 caracteres');
  }

  // Deve conter letra maiúscula
  if (!/[A-Z]/.test(password)) {
    errors.push('A senha deve conter pelo menos uma letra maiúscula');
  }

  // Deve conter letra minúscula
  if (!/[a-z]/.test(password)) {
    errors.push('A senha deve conter pelo menos uma letra minúscula');
  }

  // Deve conter número
  if (!/[0-9]/.test(password)) {
    errors.push('A senha deve conter pelo menos um número');
  }

  // Deve conter caractere especial
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    errors.push('A senha deve conter pelo menos um caractere especial');
  }

  // Verificar senhas comuns
  if (COMMON_PASSWORDS.includes(password.toLowerCase())) {
    errors.push('Esta senha é muito comum. Escolha outra');
  }

  // Verificar força usando zxcvbn
  const strength = zxcvbn(password);

  if (password.length >= 8 && strength.score < 2) {
    errors.push('Senha muito fraca. Use uma combinação mais complexa');
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength: strength.score,
    strengthLabel: STRENGTH_LABELS[strength.score]
  };
};

export const getPasswordStrengthColor = (strength: number): string => {
  const colors = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e'];
  return colors[strength] || colors[0];
};
