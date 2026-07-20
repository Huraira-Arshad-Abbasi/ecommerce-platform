export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r p-4">
        <h2 className="mb-4 text-lg font-semibold">Admin</h2>
        <nav className="flex flex-col gap-2">
          <a href="/admin/dashboard" className="text-sm hover:underline">
            Dashboard
          </a>
          <a href="/admin/products" className="text-sm hover:underline">
            Products
          </a>
          <a href="/admin/categories" className="text-sm hover:underline">
            Categories
          </a>
          <a href="/admin/suppliers" className="text-sm hover:underline">
            Suppliers
          </a>
          <a href="/admin/orders" className="text-sm hover:underline">
            Orders
          </a>
          <a href="/admin/customers" className="text-sm hover:underline">
            Customers
          </a>
        </nav>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
