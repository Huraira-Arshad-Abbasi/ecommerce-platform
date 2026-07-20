import Link from "next/link";
import Image from "next/image";

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  category: {
    name: string;
    slug: string;
  };
  stock: number;
}

export function ProductCard({ product }: { product: Product }) {
  const hasDiscount =
    product.compareAtPrice && product.compareAtPrice > product.price;

  return (
    <Link
      href={`/product/${product._id}`}
      className="group block overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-square bg-muted">
        {product.images[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
            No image
          </div>
        )}
        {hasDiscount && (
          <span className="absolute top-2 left-2 rounded bg-destructive px-2 py-0.5 text-xs text-destructive-foreground">
            Sale
          </span>
        )}
      </div>
      <div className="p-3 space-y-1">
        <p className="text-xs text-muted-foreground">{product.category.name}</p>
        <h3 className="text-sm font-medium line-clamp-1">{product.name}</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">
            Rs. {product.price.toLocaleString()}
          </span>
          {hasDiscount && (
            <span className="text-xs text-muted-foreground line-through">
              Rs. {product.compareAtPrice!.toLocaleString()}
            </span>
          )}
        </div>
        {product.stock === 0 && (
          <p className="text-xs text-destructive">Out of stock</p>
        )}
      </div>
    </Link>
  );
}
