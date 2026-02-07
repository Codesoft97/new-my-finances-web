'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import FirstAccessTutorialModal from '@/components/tutorial/FirstAccessTutorialModal';
import { useAuth } from '@/contexts/AuthContext';

const STORAGE_PREFIX = 'first-access-tutorial-v1';

export default function FirstAccessTutorial() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const storageKey = useMemo(() => {
    if (!user?.id) return null;
    return `${STORAGE_PREFIX}:${user.id}`;
  }, [user?.id]);

  useEffect(() => {
    if (!storageKey) return;
    const seen = localStorage.getItem(storageKey) === 'true';
    if (!seen) {
      setIsOpen(true);
    }
  }, [storageKey]);

  const markSeen = useCallback(() => {
    if (!storageKey) return;
    localStorage.setItem(storageKey, 'true');
  }, [storageKey]);

  const handleClose = useCallback(() => {
    markSeen();
    setIsOpen(false);
  }, [markSeen]);

  const handleFinish = useCallback(() => {
    markSeen();
    setIsOpen(false);
  }, [markSeen]);

  return (
    <FirstAccessTutorialModal
      isOpen={isOpen}
      onClose={handleClose}
      onFinish={handleFinish}
    />
  );
}
