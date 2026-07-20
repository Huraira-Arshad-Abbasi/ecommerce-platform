"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface OrderItem {
  product: { name: string; images: string[] };
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  customer: { name: string; email: string; phone?: string };
  items: OrderItem[];
  totalAmount: number;
  status: string;
  paymentMethod: string;
  shippingAddress: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    postalCode?: string;
  };
  createdAt: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const statuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

export default function AdminOrderDetailPage() {
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/admin/orders/${params.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Order not found");
        return res.json();
      })
      .then(setOrder)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [params.id]);

  async function updateStatus(newStatus: string) {
    if (!confirm(`Change status to "${newStatus}"?`)) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        setOrder(updated);
      }
    } catch {
      // silent
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted rounded w-1/4 animate-pulse" />
        <div className="h-64 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div>
        <p className="text-destructive">{error || "Order not found"}</p>
        <Link href="/admin/orders" className="text-sm text-primary hover:underline">
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/orders" className="text-sm text-primary hover:underline">
          &larr; All Orders
        </Link>
        <div className="flex items-center justify-between mt-2">
          <h1 className="text-2xl font-semibold">
            Order #{order._id.slice(-8).toUpperCase()}
          </h1>
          <span
            className={`text-xs px-2.5 py-1 rounded-full font-medium ${
              statusColors[order.status] || ""
            }`}
          >
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Placed on{" "}
          {new Date(order.createdAt).toLocaleDateString("en-PK", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Status Update */}
      <div className="rounded-lg border p-4">
        <h2 className="font-semibold text-sm mb-3">Update Status</h2>
        <div className="flex gap-2 flex-wrap">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => updateStatus(s)}
              disabled={updating || order.status === s}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                order.status === s
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Items */}
      <div className="rounded-lg border divide-y">
        <h2 className="px-4 py-3 font-semibold text-sm">Items</h2>
        {order.items.map((item, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded bg-muted">
              {item.product?.images?.[0] ? (
                <Image
                  src={item.product.images[0]}
                  alt={item.product.name}
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                  No img
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium line-clamp-1">
                {item.product?.name || "Product"}
              </p>
              <p className="text-xs text-muted-foreground">
                Qty: {item.quantity} &times; Rs. {item.price.toLocaleString()}
              </p>
            </div>
            <span className="text-sm font-medium">
              Rs. {(item.price * item.quantity).toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      {/* Info Grid */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="rounded-lg border p-4 space-y-2">
          <h2 className="font-semibold text-sm">Order Summary</h2>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>Rs. {order.totalAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>Free</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment</span>
              <span>Cash on Delivery</span>
            </div>
            <div className="flex justify-between font-semibold pt-1 border-t">
              <span>Total</span>
              <span>Rs. {order.totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border p-4 space-y-2">
          <h2 className="font-semibold text-sm">Customer</h2>
          <div className="text-sm text-muted-foreground space-y-0.5">
            <p className="font-medium text-foreground">
              {order.customer?.name || "Unknown"}
            </p>
            <p>{order.customer?.email}</p>
            {order.customer?.phone && <p>{order.customer.phone}</p>}
          </div>
        </div>

        <div className="rounded-lg border p-4 space-y-2">
          <h2 className="font-semibold text-sm">Shipping Address</h2>
          <div className="text-sm text-muted-foreground space-y-0.5">
            <p className="font-medium text-foreground">
              {order.shippingAddress.fullName}
            </p>
            <p>{order.shippingAddress.phone}</p>
            <p>{order.shippingAddress.address}</p>
            <p>
              {order.shippingAddress.city}
              {order.shippingAddress.postalCode &&
                `, ${order.shippingAddress.postalCode}`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
