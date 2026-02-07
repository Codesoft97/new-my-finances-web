'use client';

import { ReactNode, useEffect, useState } from 'react';
import { LucideIcon } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

export interface TutorialStep {
  id: string;
  title: string;
  description?: string;
  bullets?: string[];
  icon?: LucideIcon;
  content?: ReactNode;
}

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  steps: TutorialStep[];
  title?: string;
  initialStep?: number;
  onFinish?: () => void;
  onSkip?: () => void;
  allowSkip?: boolean;
}

export default function TutorialModal({
  isOpen,
  onClose,
  steps,
  title = 'Tutorial rapido',
  initialStep = 0,
  onFinish,
  onSkip,
  allowSkip = true,
}: TutorialModalProps) {
  const [currentStep, setCurrentStep] = useState(initialStep);

  useEffect(() => {
    if (!isOpen) return;
    const nextStep = Math.min(Math.max(initialStep, 0), Math.max(steps.length - 1, 0));
    setCurrentStep(nextStep);
  }, [isOpen, initialStep, steps.length]);

  if (!isOpen || steps.length === 0) {
    return null;
  }

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const progress = Math.round(((currentStep + 1) / steps.length) * 100);
  const Icon = step.icon;

  const handleNext = () => {
    if (isLastStep) {
      onFinish?.();
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
      return;
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
      <div className="space-y-5">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
            <span>Etapa {currentStep + 1} de {steps.length}</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-[var(--color-border)] overflow-hidden">
            <div
              className="h-full bg-[var(--color-action)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex items-start gap-3">
          {Icon && (
            <div className="w-11 h-11 rounded-md bg-[var(--color-primary)]/10 flex items-center justify-center">
              <Icon size={22} className="text-[var(--color-primary)]" />
            </div>
          )}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-[var(--color-text)]">{step.title}</h3>
            {step.description && (
              <p className="text-sm text-[var(--color-text-secondary)]">{step.description}</p>
            )}
          </div>
        </div>

        {step.bullets && step.bullets.length > 0 && (
          <ul className="space-y-2 text-sm text-[var(--color-text-secondary)]">
            {step.bullets.map((bullet, index) => (
              <li key={`${step.id}-bullet-${index}`} className="flex items-start gap-2">
                <span className="mt-1.5 h-2 w-2 rounded-full bg-[var(--color-primary)]" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        )}

        {step.content && (
          <div className="pt-1">
            {step.content}
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-2 border-t border-[var(--color-border)]">
          {allowSkip ? (
            <Button variant="ghost" onClick={handleSkip}>
              Pular tutorial
            </Button>
          ) : (
            <div />
          )}
          <div className="flex gap-2 sm:justify-end">
            <Button variant="secondary" onClick={handleBack} disabled={currentStep === 0}>
              Voltar
            </Button>
            <Button onClick={handleNext}>
              {isLastStep ? 'Concluir' : 'Proximo'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
