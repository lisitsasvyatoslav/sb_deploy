'use client';

import Button from '@/shared/ui/Button';
import { isDev } from '@/shared/config/environment';
import { useTranslation } from '@/shared/i18n/client';
import { auth } from '@/services/api';
import React, { useEffect, useRef, useState } from 'react';

const DEV_USERS = [
  { email: 'victor@trading-diary.com', label: 'Victor (user)' },
  { email: 'alice@trading-diary.com', label: 'Alice (user)' },
  { email: 'peter@trading-diary.com', label: 'Peter (user)' },
  { email: 'admin@trading-diary.com', label: 'Admin' },
];

const DevLoginPanel: React.FC<{ onError: (msg: string) => void }> = ({
  onError,
}) => {
  const { t } = useTranslation('auth');
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isEnabled =
      typeof window !== 'undefined' &&
      localStorage.getItem('dev-login') === 'true';

    setVisible(isDev && isEnabled);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  if (!visible) return null;

  return (
    <div className="relative" ref={containerRef}>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="secondary"
          size="md"
          disabled={loading}
          loading={loading}
          className="flex-1"
          onClick={async () => {
            onError('');
            setLoading(true);
            try {
              await auth.devLogin();
            } catch {
              onError('Dev login failed');
            } finally {
              setLoading(false);
            }
          }}
        >
          {loading ? t('devLogin.submitting') : 'Dev Login'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="md"
          disabled={loading}
          className="px-3"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          {menuOpen ? '▲' : '▼'}
        </Button>
      </div>
      {menuOpen && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-surface-medium border border-blackinverse-a12 rounded-[4px] shadow-lg z-10 overflow-hidden">
          {DEV_USERS.map((user) => (
            <button
              key={user.email}
              type="button"
              disabled={loading}
              className="w-full text-left px-3 py-2 text-sm hover:bg-blackinverse-a6 transition-colors disabled:opacity-50"
              onClick={async () => {
                onError('');
                setLoading(true);
                setMenuOpen(false);
                try {
                  await auth.devLogin(user.email);
                } catch {
                  onError(`Login failed for ${user.email}`);
                } finally {
                  setLoading(false);
                }
              }}
            >
              <span className="font-medium text-blackinverse-a100">
                {user.label}
              </span>
              <span className="text-blackinverse-a32 ml-2 text-xs">
                {user.email}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default DevLoginPanel;
