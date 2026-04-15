import LegalDocsLayout from '@/features/legal/components/LegalDocsLayout';

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LegalDocsLayout>{children}</LegalDocsLayout>;
}
