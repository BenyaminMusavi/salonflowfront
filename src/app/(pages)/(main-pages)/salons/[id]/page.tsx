import SalonsDetailView from "./SalonsDetailView";

export default async function SalonsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SalonsDetailView source={{ id }} />;
}
