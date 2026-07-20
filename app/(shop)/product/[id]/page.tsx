export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="mx-auto max-w-7xl p-4">
      <h1 className="text-2xl font-semibold">Product Detail</h1>
    </div>
  );
}
