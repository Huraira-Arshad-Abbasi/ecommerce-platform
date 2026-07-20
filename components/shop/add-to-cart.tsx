"use client";

import { useCartStore } from "@/lib/cart";
import { useRouter } from "next/navigation";

interface AddToCartProps {
  productId: string;
  name: string;
  price: number;
  image: string;
  stock: number;
  disabled?: boolean;
}

export function AddToCart({
  productId,
  name,
  price,
  image,
  stock,
  disabled,
}: AddToCartProps) {
  const addItem = useCartStore((state) => state.addItem);
  const router = useRouter();

  function handleAdd() {
    addItem({ productId, name, price, image, stock });
    router.refresh();
  }

  return (
    <button
      onClick={handleAdd}
      disabled={disabled}
      className="w-full rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
    >
      {disabled ? "Out of Stock" : "Add to Cart"}
    </button>
  );
}
