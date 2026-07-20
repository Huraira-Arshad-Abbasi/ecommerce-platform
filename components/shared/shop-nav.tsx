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
  const [mobileOpen, setMobileOpen] = useState(false);
  const itemCount = useCartStore((state) => state.getItemCount());

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header className="border-b">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-4">
        <Link href="/" className="text-lg font-semibold">
          Local Commerce
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-4">
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
              <Link
                href="/orders"
                className={`text-sm hover:underline ${pathname === "/orders" ? "font-medium" : ""}`}
              >
                Orders
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

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 -mr-2 text-muted-foreground hover:text-foreground"
          aria-label="Toggle menu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {mobileOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="4" y1="8" x2="20" y2="8" />
                <line x1="4" y1="16" x2="20" y2="16" />
              </>
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-background">
          <div className="p-4 space-y-3">
            <Link
              href="/products"
              className={`block text-sm ${pathname === "/products" ? "font-medium" : ""}`}
            >
              Products
            </Link>
            {user ? (
              <>
                <Link
                  href="/cart"
                  className={`block text-sm ${pathname === "/cart" ? "font-medium" : ""}`}
                >
                  Cart
                  {mounted && itemCount > 0 && (
                    <span className="ml-1 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium h-5 min-w-5 px-1">
                      {itemCount}
                    </span>
                  )}
                </Link>
                <Link
                  href="/orders"
                  className={`block text-sm ${pathname === "/orders" ? "font-medium" : ""}`}
                >
                  Orders
                </Link>
                {user.role === "admin" && (
                  <Link href="/admin/dashboard" className="block text-sm">
                    Admin
                  </Link>
                )}
                <form action={logout}>
                  <button type="submit" className="text-sm text-muted-foreground">
                    Logout
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login" className="block text-sm">
                  Login
                </Link>
                <Link href="/register" className="block text-sm">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
