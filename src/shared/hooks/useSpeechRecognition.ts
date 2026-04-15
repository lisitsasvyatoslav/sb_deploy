import { useTranslation } from '@/shared/i18n/client';
import { getLocaleTag } from '@/shared/utils/formatLocale';
import { useState } from 'react';

interface SpeechRecognitionResult {
  results: { [index: number]: { [index: number]: { transcript: string } } };
}

interface SpeechRecognitionError {
  error: string;
}

interface WebkitSpeechRecognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionResult) => void) | null;
  onerror: ((event: SpeechRecognitionError) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

interface WindowWithSpeechRecognition extends Window {
  webkitSpeechRecognition: new () => WebkitSpeechRecognition;
}

export const useSpeechRecognition = () => {
  const { t, i18n } = useTranslation('common');
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      setError(t('speech.notSupported'));
      return;
    }

    const recognition = new (
      window as WindowWithSpeechRecognition
    ).webkitSpeechRecognition();
    recognition.lang = getLocaleTag(i18n.language);
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event: SpeechRecognitionResult) => {
      const transcript = event.results[0][0].transcript;
      setTranscript(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event: SpeechRecognitionError) => {
      setError(t('speech.error', { error: event.error }));
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const stopListening = () => {
    setIsListening(false);
  };

  return {
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    resetTranscript: () => setTranscript(''),
  };
};
