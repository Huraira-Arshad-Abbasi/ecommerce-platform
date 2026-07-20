export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b p-4">
        <nav className="mx-auto flex max-w-7xl items-center justify-between">
          <a href="/" className="text-lg font-semibold">
            Local Commerce
          </a>
          <div className="flex gap-4">
            <a href="/products" className="text-sm hover:underline">
              Products
            </a>
            <a href="/cart" className="text-sm hover:underline">
              Cart
            </a>
          </div>
        </nav>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
