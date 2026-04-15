import StrategiesCatalogDetailPage from '@/views/StrategiesCatalogDetailPage';

export default async function StrategiesCatalogPageDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <StrategiesCatalogDetailPage id={id} />;
}
