import { notFound } from "next/navigation";
import Image from "next/image";
import { connectToDatabase } from "@/lib/db";
import Product from "@/models/Product";
import { AddToCart } from "@/components/shop/add-to-cart";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  await connectToDatabase();

  const product = await Product.findById(id)
    .populate("category", "name slug")
    .populate("supplier", "name")
    .lean();

  if (!product) {
    notFound();
  }

  const hasDiscount =
    product.compareAtPrice && product.compareAtPrice > product.price;

  return (
    <div className="mx-auto max-w-7xl p-4">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Images */}
        <div className="space-y-3">
          <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
            {product.images[0] ? (
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                No image available
              </div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.slice(0, 4).map((img: string, i: number) => (
                <div
                  key={i}
                  className="relative aspect-square rounded-lg overflow-hidden bg-muted border"
                >
                  <Image
                    src={img}
                    alt={`${product.name} ${i + 1}`}
                    fill
                    sizes="10vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">
              {product.category?.name}
            </p>
            <h1 className="text-2xl font-bold mt-1">{product.name}</h1>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-bold">
              Rs. {product.price.toLocaleString()}
            </span>
            {hasDiscount && (
              <span className="text-lg text-muted-foreground line-through">
                Rs. {product.compareAtPrice!.toLocaleString()}
              </span>
            )}
          </div>

          <div className="space-y-2">
            <h2 className="text-sm font-semibold">Description</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {product.description}
            </p>
          </div>

          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Category</span>
              <span>{product.category?.name}</span>
            </div>
            {product.supplier && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Supplier</span>
                <span>{product.supplier.name}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Availability</span>
              <span
                className={
                  product.stock > 0 ? "text-green-600" : "text-destructive"
                }
              >
                {product.stock > 0
                  ? `${product.stock} in stock`
                  : "Out of stock"}
              </span>
            </div>
          </div>

          <AddToCart
            productId={product._id.toString()}
            name={product.name}
            price={product.price}
            image={product.images[0] || ""}
            stock={product.stock}
            disabled={product.stock === 0}
          />
        </div>
      </div>
    </div>
  );
}
