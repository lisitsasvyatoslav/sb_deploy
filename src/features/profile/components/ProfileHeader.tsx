'use client';

import React, { useMemo } from 'react';
import { useTheme } from 'next-themes';
import { getClientRegionConfig } from '@/shared/config/region';

type Theme = 'dark' | 'light';

interface BannerConfig {
  bg: string;
  textColor: string;
  title: string;
}

const BANNER_CONFIG: Record<string, Record<Theme, BannerConfig>> = {
  ru: {
    dark: {
      bg: '#7863F6',
      textColor: 'rgba(255,255,255,0.6)',
      title: 'ФИНАМ ДНЕВНИК',
    },
    light: {
      bg: '#8A7CF8',
      textColor: 'rgba(4,4,5,0.56)',
      title: 'ФИНАМ ДНЕВНИК',
    },
  },
  us: {
    dark: {
      bg: '#AFDE41',
      textColor: 'rgba(4,4,5,0.56)',
      title: 'Introducing limex',
    },
    light: {
      bg: '#11C516',
      textColor: 'rgba(255,255,255,0.6)',
      title: 'Introducing limex',
    },
  },
};

const TOP_LEFT_LINES = [
  { top: 9, text: '"Image": "data:image/png;base64..."' },
  {
    top: 18,
    text: '"description": "no custody.no backroom deals.no invisible hands"',
  },
] as const;

const BOTTOM_RIGHT_LINES = [
  { top: 80, text: '>> execute :: AI.Mint( "dream sequence" )' },
  { top: 88.58, text: '>> state :: entropy::balanced()' },
  { top: 97.16, text: '>> hediex :: 7k opsci[doo[ [ok]' },
] as const;

function DecorativeText({
  left,
  top,
  color,
  children,
}: {
  left: number;
  top: number;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div
      aria-hidden
      className="absolute font-mono uppercase select-none"
      style={{
        left,
        top,
        fontSize: 7,
        lineHeight: 1,
        color,
        letterSpacing: '-0.02em',
      }}
    >
      {children}
    </div>
  );
}

function BannerBackground() {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/profile-banner-bg.png"
        alt=""
        aria-hidden
        className="absolute pointer-events-none select-none"
        style={{
          left: 219,
          top: -748,
          width: 1057,
          height: 1586,
          objectFit: 'cover',
        }}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/profile-banner-pattern.svg"
        alt=""
        aria-hidden
        className="absolute pointer-events-none select-none"
        style={{ left: 0.5, top: -106, width: 1439, height: 345, opacity: 0.3 }}
      />
    </>
  );
}

function BannerTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 flex items-start justify-center pointer-events-none">
      <span
        className="font-inter font-bold uppercase tracking-tight"
        style={{ fontSize: 50, lineHeight: 1, color: '#000000', marginTop: 25 }}
      >
        {children}
      </span>
    </div>
  );
}

function ProfileBanner({ bg, textColor, title }: BannerConfig) {
  return (
    <div
      className="relative w-full overflow-hidden shrink-0"
      style={{ height: 100, backgroundColor: bg }}
    >
      <BannerBackground />
      {TOP_LEFT_LINES.map((line) => (
        <DecorativeText
          key={line.top}
          left={68}
          top={line.top}
          color={textColor}
        >
          {line.text}
        </DecorativeText>
      ))}
      {BOTTOM_RIGHT_LINES.map((line) => (
        <DecorativeText
          key={line.top}
          left={1206}
          top={line.top}
          color={textColor}
        >
          {line.text}
        </DecorativeText>
      ))}
      <BannerTitle>{title}</BannerTitle>
    </div>
  );
}

/**
 * ProfileHeader — banner at the top of the profile page
 *
 * Figma node: 962:237310
 */
const ProfileHeader: React.FC = () => {
  const { resolvedTheme } = useTheme();
  const theme: Theme = resolvedTheme === 'light' ? 'light' : 'dark';
  const isLime = useMemo(() => getClientRegionConfig().theme === 'lime', []);
  const config = isLime ? BANNER_CONFIG.us[theme] : BANNER_CONFIG.ru[theme];
  return (
    <div className="relative w-full overflow-hidden shrink-0 h-[100px] bg-background-base">
      <ProfileBanner {...config} />
    </div>
  );
};

export default ProfileHeader;
