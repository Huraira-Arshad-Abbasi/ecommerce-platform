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
  items: OrderItem[];
  totalAmount: number;
  status: string;
  createdAt: string;
}

interface Customer {
  name: string;
  email: string;
  createdAt: string;
  orderCount: number;
  totalSpent: number;
  orders: Order[];
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function AdminCustomerDetailPage() {
  const params = useParams();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/admin/customers/${params.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Customer not found");
        return res.json();
      })
      .then(setCustomer)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted rounded w-1/4 animate-pulse" />
        <div className="h-64 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div>
        <p className="text-destructive">{error || "Customer not found"}</p>
        <Link href="/admin/customers" className="text-sm text-primary hover:underline">
          Back to Customers
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/customers" className="text-sm text-primary hover:underline">
          &larr; All Customers
        </Link>
        <h1 className="text-2xl font-semibold mt-2">{customer.name}</h1>
        <p className="text-sm text-muted-foreground">{customer.email}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Total Orders</p>
          <p className="text-2xl font-semibold mt-1">{customer.orderCount}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Total Spent</p>
          <p className="text-2xl font-semibold mt-1">
            Rs. {customer.totalSpent.toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Joined</p>
          <p className="text-2xl font-semibold mt-1">
            {new Date(customer.createdAt).toLocaleDateString("en-PK", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Orders */}
      <div className="rounded-lg border">
        <div className="px-4 py-3 border-b">
          <h2 className="font-semibold text-sm">Order History</h2>
        </div>
        <div className="divide-y">
          {customer.orders.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              No orders yet.
            </div>
          ) : (
            customer.orders.map((order) => (
              <Link
                key={order._id}
                href={`/admin/orders/${order._id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium">
                    #{order._id.slice(-8).toUpperCase()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString("en-PK", {
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    &middot; {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    Rs. {order.totalAmount.toLocaleString()}
                  </p>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      statusColors[order.status] || ""
                    }`}
                  >
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
