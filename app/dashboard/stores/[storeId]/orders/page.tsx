export default function OrdersPage({ params }: { params: { storeId: string } }) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Order Management</h1>
      <p className="text-muted-foreground">View and manage customer orders.</p>
    </div>
  );
} 