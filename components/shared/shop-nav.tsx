"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { logout } from "@/app/actions/auth";
import { useCartStore } from "@/lib/cart";

interface ShopNavProps {
  user?: {
    name: string;
    role: string;
  } | null;
}

export function ShopNav({ user }: ShopNavProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const itemCount = useCartStore((state) => state.getItemCount());

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="border-b">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-4">
        <Link href="/" className="text-lg font-semibold">
          Local Commerce
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/products"
            className={`text-sm hover:underline ${pathname === "/products" ? "font-medium" : ""}`}
          >
            Products
          </Link>
          {user ? (
            <>
              <Link
                href="/cart"
                className={`text-sm hover:underline ${pathname === "/cart" ? "font-medium" : ""}`}
              >
                Cart
                {mounted && itemCount > 0 && (
                  <span className="ml-1 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium h-5 min-w-5 px-1">
                    {itemCount}
                  </span>
                )}
              </Link>
              {user.role === "admin" && (
                <Link href="/admin/dashboard" className="text-sm hover:underline">
                  Admin
                </Link>
              )}
              <form action={logout}>
                <button type="submit" className="text-sm text-muted-foreground hover:underline">
                  Logout
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm hover:underline">
                Login
              </Link>
              <Link href="/register" className="text-sm hover:underline">
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
