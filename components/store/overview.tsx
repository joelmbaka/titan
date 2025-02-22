export function Overview() {
  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Store Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-card p-4 rounded-lg">
          <h3 className="text-sm font-medium">Total Sales</h3>
          <p className="text-2xl font-bold mt-2">$0.00</p>
        </div>
        <div className="bg-card p-4 rounded-lg">
          <h3 className="text-sm font-medium">Visitors</h3>
          <p className="text-2xl font-bold mt-2">0</p>
        </div>
        <div className="bg-card p-4 rounded-lg">
          <h3 className="text-sm font-medium">Conversion Rate</h3>
          <p className="text-2xl font-bold mt-2">0%</p>
        </div>
      </div>
    </div>
  );
} 