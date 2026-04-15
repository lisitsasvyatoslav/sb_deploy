import { redirect } from 'next/navigation';
import ProfilePageNew from '@/views/ProfilePageNew';
import type { ProfileSection } from '@/features/profile/components/ProfileNav';

const VALID_SECTIONS: ProfileSection[] = [
  'my-profile',
  'general',
  'portfolios',
  'tariff',
  'payments',
  'legal',
];

interface Props {
  params: Promise<{ section: string }>;
}

export default async function ProfileSectionPage({ params }: Props) {
  const { section } = await params;

  if (!VALID_SECTIONS.includes(section as ProfileSection)) {
    redirect('/profile/my-profile');
  }

  return <ProfilePageNew section={section as ProfileSection} />;
}
