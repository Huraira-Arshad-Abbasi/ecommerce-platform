export default async function HomePage() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";

  let products: Array<{
    _id: string;
    name: string;
    slug: string;
    price: number;
    compareAtPrice?: number;
    images: string[];
    category: { name: string; slug: string };
    stock: number;
  }> = [];
  let categories: Array<{
    _id: string;
    name: string;
    slug: string;
    image?: string;
  }> = [];

  try {
    const [productsRes, categoriesRes] = await Promise.all([
      fetch(`${baseUrl}/api/products?limit=8&sort=newest`, {
        cache: "no-store",
      }),
      fetch(`${baseUrl}/api/categories`, { cache: "no-store" }),
    ]);

    if (productsRes.ok) {
      const data = await productsRes.json();
      products = data.products;
    }
    if (categoriesRes.ok) {
      categories = await categoriesRes.json();
    }
  } catch {
    // Server-side fetch failed, render empty state
  }

  return (
    <div className="mx-auto max-w-7xl space-y-12 p-4">
      {/* Hero */}
      <section className="text-center space-y-3 py-12">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Local Commerce Platform
        </h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Discover products from local sellers. Quality goods, curated for you.
        </p>
        <a
          href="/products"
          className="inline-block rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Browse Products
        </a>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4">Categories</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {categories.map((cat) => (
              <a
                key={cat._id}
                href={`/products?category=${cat._id}`}
                className="flex items-center justify-center rounded-lg border p-4 text-sm font-medium hover:bg-muted transition-colors"
              >
                {cat.name}
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      {products.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4">Featured Products</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {products.map((product) => (
              <a
                key={product._id}
                href={`/product/${product._id}`}
                className="group block overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-md"
              >
                <div className="aspect-square bg-muted flex items-center justify-center text-muted-foreground text-sm">
                  {product.images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    "No image"
                  )}
                </div>
                <div className="p-3 space-y-1">
                  <p className="text-xs text-muted-foreground">
                    {product.category.name}
                  </p>
                  <h3 className="text-sm font-medium line-clamp-1">
                    {product.name}
                  </h3>
                  <span className="text-sm font-semibold">
                    Rs. {product.price.toLocaleString()}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {products.length === 0 && categories.length === 0 && (
        <section className="text-center py-12 text-muted-foreground">
          <p>No products available yet. Check back soon!</p>
        </section>
      )}
    </div>
  );
}
