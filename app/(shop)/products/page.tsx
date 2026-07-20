"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ProductCard } from "@/components/shop/product-card";

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  category: { name: string; slug: string };
  stock: number;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") || ""
  );

  const currentSearch = searchParams.get("search") || "";
  const currentCategory = searchParams.get("category") || "";
  const currentSort = searchParams.get("sort") || "newest";
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (currentSearch) params.set("search", currentSearch);
    if (currentCategory) params.set("category", currentCategory);
    if (currentSort) params.set("sort", currentSort);
    params.set("page", currentPage.toString());

    try {
      const res = await fetch(`/api/products?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products);
        setPagination(data.pagination);
      }
    } catch {
      // Handle error silently
    } finally {
      setLoading(false);
    }
  }, [currentSearch, currentCategory, currentSort, currentPage]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch(() => {});
  }, []);

  function updateParams(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    if (key !== "page") params.set("page", "1");
    router.push(`/products?${params.toString()}`);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    updateParams("search", searchInput);
  }

  return (
    <div className="mx-auto max-w-7xl p-4">
      <h1 className="text-2xl font-semibold mb-6">Products</h1>

      {/* Search + Sort */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search products..."
            className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="submit"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Search
          </button>
        </form>
        <select
          value={currentSort}
          onChange={(e) => updateParams("sort", e.target.value)}
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </select>
      </div>

      <div className="flex gap-6">
        {/* Category Filter */}
        <aside className="hidden md:block w-48 shrink-0">
          <h2 className="text-sm font-semibold mb-3">Categories</h2>
          <div className="space-y-1">
            <button
              onClick={() => updateParams("category", "")}
              className={`block w-full text-left text-sm px-2 py-1.5 rounded ${
                !currentCategory ? "bg-muted font-medium" : "hover:bg-muted"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => updateParams("category", cat._id)}
                className={`block w-full text-left text-sm px-2 py-1.5 rounded ${
                  currentCategory === cat._id
                    ? "bg-muted font-medium"
                    : "hover:bg-muted"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </aside>

        {/* Mobile category filter */}
        <div className="md:hidden mb-4">
          <select
            value={currentCategory}
            onChange={(e) => updateParams("category", e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Product Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square bg-muted rounded-lg" />
                  <div className="p-3 space-y-2">
                    <div className="h-3 bg-muted rounded w-1/3" />
                    <div className="h-4 bg-muted rounded w-2/3" />
                    <div className="h-3 bg-muted rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No products found.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  <button
                    onClick={() =>
                      updateParams("page", (currentPage - 1).toString())
                    }
                    disabled={currentPage <= 1}
                    className="rounded-lg border px-3 py-1.5 text-sm hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {pagination.pages}
                  </span>
                  <button
                    onClick={() =>
                      updateParams("page", (currentPage + 1).toString())
                    }
                    disabled={currentPage >= pagination.pages}
                    className="rounded-lg border px-3 py-1.5 text-sm hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
