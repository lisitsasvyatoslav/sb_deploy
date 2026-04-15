import { redirect } from 'next/navigation';
import LegalDocAppPage from '@/views/LegalDocAppPage';
import { LEGAL_DOCS_META } from '@/features/legal/utils/legalDocUtils';

interface Props {
  params: Promise<{ doc: string }>;
}

export default async function LegalDocPage({ params }: Props) {
  const { doc } = await params;

  const isValid = LEGAL_DOCS_META.some((d) => d.key === doc);
  if (!isValid) {
    redirect('/profile/legal');
  }

  return <LegalDocAppPage doc={doc} />;
}
