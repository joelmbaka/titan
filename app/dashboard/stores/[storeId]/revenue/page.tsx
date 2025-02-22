export default function RevenuePage({ params }: { params: { storeId: string } }) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Revenue Analytics</h1>
      <p className="text-muted-foreground">Detailed revenue breakdown and trends.</p>
    </div>
  );
} 