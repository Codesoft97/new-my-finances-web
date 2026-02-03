import { validatePassword, getPasswordStrengthColor } from '../passwordValidator';

describe('passwordValidator', () => {
  describe('validatePassword', () => {
    it('returns invalid for empty password', () => {
      const result = validatePassword('');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('A senha deve ter no mínimo 8 caracteres');
    });

    it('returns invalid for password shorter than 8 characters', () => {
      const result = validatePassword('Abc123!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('A senha deve ter no mínimo 8 caracteres');
    });

    it('returns invalid for password without uppercase letter', () => {
      const result = validatePassword('abcd1234!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('A senha deve conter pelo menos uma letra maiúscula');
    });

    it('returns invalid for password without lowercase letter', () => {
      const result = validatePassword('ABCD1234!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('A senha deve conter pelo menos uma letra minúscula');
    });

    it('returns invalid for password without number', () => {
      const result = validatePassword('Abcdefgh!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('A senha deve conter pelo menos um número');
    });

    it('returns invalid for password without special character', () => {
      const result = validatePassword('Abcd1234');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('A senha deve conter pelo menos um caractere especial');
    });

    it('returns invalid for common password', () => {
      const result = validatePassword('123456');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Esta senha é muito comum. Escolha outra');
    });

    it('returns valid for strong password', () => {
      const result = validatePassword('MyStr0ng!Pass');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('returns strength score between 0 and 4', () => {
      const weakResult = validatePassword('a');
      expect(weakResult.strength).toBeGreaterThanOrEqual(0);
      expect(weakResult.strength).toBeLessThanOrEqual(4);

      const strongResult = validatePassword('MyV3ry$tr0ng&SecurePa$$w0rd!');
      expect(strongResult.strength).toBeGreaterThanOrEqual(0);
      expect(strongResult.strength).toBeLessThanOrEqual(4);
    });

    it('returns strength label', () => {
      const result = validatePassword('MyStr0ng!Pass');
      expect(['Muito Fraca', 'Fraca', 'Média', 'Forte', 'Muito Forte']).toContain(result.strengthLabel);
    });

    it('returns invalid for password longer than 128 characters', () => {
      const longPassword = 'A1!' + 'a'.repeat(130);
      const result = validatePassword(longPassword);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('A senha deve ter no máximo 128 caracteres');
    });

    it('validates Portuguese common passwords', () => {
      const result = validatePassword('senha123');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Esta senha é muito comum. Escolha outra');
    });
  });

  describe('getPasswordStrengthColor', () => {
    it('returns red for score 0', () => {
      expect(getPasswordStrengthColor(0)).toBe('#ef4444');
    });

    it('returns orange for score 1', () => {
      expect(getPasswordStrengthColor(1)).toBe('#f97316');
    });

    it('returns yellow for score 2', () => {
      expect(getPasswordStrengthColor(2)).toBe('#eab308');
    });

    it('returns lime for score 3', () => {
      expect(getPasswordStrengthColor(3)).toBe('#84cc16');
    });

    it('returns green for score 4', () => {
      expect(getPasswordStrengthColor(4)).toBe('#22c55e');
    });

    it('returns red for invalid score', () => {
      expect(getPasswordStrengthColor(-1)).toBe('#ef4444');
      expect(getPasswordStrengthColor(5)).toBe('#ef4444');
    });
  });
});
