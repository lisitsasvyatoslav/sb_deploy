'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import AnimatedSendButton from '@/features/chat/components/SendButton';
import { WELCOME_SLUGS, getSlugByText } from '@/features/welcome/constants';
import '@/features/chat/components/ChatInput.css';

// Derive suggestions from slug config, repeated to fill the 6-card grid
const SUGGESTIONS = [...WELCOME_SLUGS, ...WELCOME_SLUGS].map((s) => s.text);

const ArrowUpRight = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
    className="text-text-secondary"
  >
    <path
      d="M2.5 9.5L9.5 2.5M9.5 2.5H4.5M9.5 2.5V7.5"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

interface WelcomeFormProps {
  sparklyId: string;
  onSubmit: (question: string, sparklyId: string) => void;
}

const WelcomeForm: React.FC<WelcomeFormProps> = ({ sparklyId, onSubmit }) => {
  const [question, setQuestion] = useState('');
  const router = useRouter();

  const submitQuestion = useCallback(() => {
    const trimmed = question.trim();
    if (!trimmed) return;
    onSubmit(trimmed, sparklyId);
  }, [question, sparklyId, onSubmit]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      submitQuestion();
    },
    [submitQuestion]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        submitQuestion();
      }
    },
    [submitQuestion]
  );

  const handleSuggestionClick = useCallback(
    (text: string) => {
      const slug = getSlugByText(text);
      if (slug) {
        router.push(`/welcome/${slug}`);
      } else {
        onSubmit(text, sparklyId);
      }
    },
    [router, sparklyId, onSubmit]
  );

  const hasText = question.trim().length > 0;

  return (
    <div className="flex flex-col items-center justify-center h-full px-4">
      <div className="flex flex-col items-center w-full max-w-[700px]">
        {/* Chat-style input */}
        <form onSubmit={handleSubmit} className="w-full relative isolate">
          {/* Ellipse BG — purple glow protruding below input (matches Figma) */}
          <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-0 w-[118%] h-[170px] z-0">
            <svg
              preserveAspectRatio="none"
              width="100%"
              height="100%"
              viewBox="0 0 825 170"
              fill="none"
            >
              <ellipse
                cx="412.5"
                cy="85"
                rx="412.5"
                ry="85"
                fill="url(#ellipseBgGrad)"
                fillOpacity="0.6"
              />
              <defs>
                <radialGradient
                  id="ellipseBgGrad"
                  cx="0"
                  cy="0"
                  r="1"
                  gradientUnits="userSpaceOnUse"
                  gradientTransform="translate(412.5 85) rotate(90) scale(85 412.5)"
                >
                  <stop style={{ stopColor: 'var(--color-accent)' }} />
                  <stop
                    offset="1"
                    style={{
                      stopColor: 'var(--welcome-ellipse-fade)',
                      stopOpacity: 0,
                    }}
                  />
                </radialGradient>
              </defs>
            </svg>
          </div>

          <div
            className={`
              chat-input-container
              relative z-[1] bg-[var(--chat-input-bg)] overflow-hidden
              border-y border-x-0 h-[100px]
            `}
            style={{
              borderImage:
                'linear-gradient(to right, transparent, var(--color-accent), transparent) 1',
            }}
          >
            <div className="relative z-[1] flex flex-col justify-between h-full">
              {/* Text input area */}
              <div className="px-[11px] pt-[10px]">
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Помогу с любым вопросом"
                  rows={1}
                  className="w-full bg-transparent text-text-primary placeholder-text-secondary text-[14px] leading-[20px] tracking-[-0.2px] resize-none outline-none"
                  autoFocus
                />
              </div>

              {/* Bottom toolbar */}
              <div className="flex items-center justify-end pr-[6px] pb-[4px] h-[40px]">
                <AnimatePresence mode="wait">
                  {hasText && (
                    <AnimatedSendButton
                      key="send-button"
                      onClick={() => {
                        const trimmed = question.trim();
                        if (trimmed) onSubmit(trimmed, sparklyId);
                      }}
                      label="Отправить"
                    />
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </form>

        {/* Suggestion cards grid */}
        <div className="grid grid-cols-3 gap-4 w-full mt-10">
          {SUGGESTIONS.map((text, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSuggestionClick(text)}
              className="
                relative text-left p-4 flex items-start
                rounded-[2px] border-[1.5px]
                bg-[var(--welcome-card-bg)] border-[var(--welcome-card-border)]
                backdrop-blur-[6px]
                shadow-[0px_1px_2px_0px_rgba(0,0,0,0.12)]
                hover:bg-[var(--surface-low)] hover:border-[var(--border-light)]
                transition-colors duration-200
                cursor-pointer min-h-[96px]
              "
            >
              <span className="text-[12px] leading-[16px] tracking-[-0.2px] text-text-secondary font-normal pr-5 block">
                {text}
              </span>
              <span className="absolute top-[8px] right-[8px]">
                <ArrowUpRight />
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WelcomeForm;
