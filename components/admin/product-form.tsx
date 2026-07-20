"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Category {
  _id: string;
  name: string;
}

interface Supplier {
  _id: string;
  name: string;
}

interface ProductData {
  _id?: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  category: string;
  supplier: string;
  stock: number;
  isActive: boolean;
}

interface ProductFormProps {
  product?: ProductData;
  mode: "create" | "edit";
}

export function ProductForm({ product, mode }: ProductFormProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: product?.name || "",
    slug: product?.slug || "",
    description: product?.description || "",
    price: product?.price || 0,
    compareAtPrice: product?.compareAtPrice || "",
    images: product?.images || [],
    category: product?.category || "",
    supplier: product?.supplier || "",
    stock: product?.stock || 0,
    isActive: product?.isActive ?? true,
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/categories").then((r) => r.json()),
      fetch("/api/suppliers").then((r) => r.json()),
    ]).then(([cats, sups]) => {
      setCategories(cats);
      setSuppliers(sups);
    });
  }, []);

  function generateSlug(name: string) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setForm((prev) => ({ ...prev, images: [...prev.images, data.url] }));
    } catch {
      setError("Failed to upload image");
    } finally {
      setUploading(false);
    }
  }

  function removeImage(index: number) {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const body = {
      ...form,
      price: Number(form.price),
      compareAtPrice: form.compareAtPrice
        ? Number(form.compareAtPrice)
        : undefined,
      stock: Number(form.stock),
    };

    try {
      const url =
        mode === "create"
          ? "/api/admin/products"
          : `/api/admin/products/${product?._id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save product");
      }

      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">
          Product Name
        </label>
        <input
          id="name"
          required
          value={form.name}
          onChange={(e) => {
            const name = e.target.value;
            setForm((prev) => ({
              ...prev,
              name,
              slug: generateSlug(name),
            }));
          }}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="slug" className="text-sm font-medium">
          Slug
        </label>
        <input
          id="slug"
          required
          value={form.slug}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, slug: e.target.value }))
          }
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">
          Description
        </label>
        <textarea
          id="description"
          required
          rows={4}
          value={form.description}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, description: e.target.value }))
          }
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="price" className="text-sm font-medium">
            Price (Rs.)
          </label>
          <input
            id="price"
            type="number"
            required
            min={1}
            value={form.price}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, price: Number(e.target.value) }))
            }
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="compareAtPrice" className="text-sm font-medium">
            Compare at Price (Rs.)
          </label>
          <input
            id="compareAtPrice"
            type="number"
            min={0}
            value={form.compareAtPrice}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                compareAtPrice: e.target.value,
              }))
            }
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="category" className="text-sm font-medium">
            Category
          </label>
          <select
            id="category"
            required
            value={form.category}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, category: e.target.value }))
            }
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Select category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label htmlFor="supplier" className="text-sm font-medium">
            Supplier
          </label>
          <select
            id="supplier"
            required
            value={form.supplier}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, supplier: e.target.value }))
            }
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Select supplier</option>
            {suppliers.map((sup) => (
              <option key={sup._id} value={sup._id}>
                {sup.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="stock" className="text-sm font-medium">
          Stock
        </label>
        <input
          id="stock"
          type="number"
          required
          min={0}
          value={form.stock}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, stock: Number(e.target.value) }))
          }
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Images */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Images</label>
        <div className="flex flex-wrap gap-3">
          {form.images.map((url, i) => (
            <div key={i} className="relative h-20 w-20 rounded-lg overflow-hidden border">
              <Image
                src={url}
                alt={`Image ${i + 1}`}
                fill
                sizes="80px"
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-0.5 right-0.5 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center"
              >
                &times;
              </button>
            </div>
          ))}
          <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed text-xs text-muted-foreground hover:bg-muted">
            {uploading ? "..." : "+ Upload"}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      {/* Active toggle */}
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.isActive}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, isActive: e.target.checked }))
          }
          className="rounded border-input"
        />
        Active (visible in store)
      </label>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {loading
            ? "Saving..."
            : mode === "create"
              ? "Create Product"
              : "Update Product"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border px-6 py-2.5 text-sm font-medium hover:bg-muted"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
