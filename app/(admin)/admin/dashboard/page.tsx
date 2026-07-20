"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Stats {
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  totalRevenue: number;
  pendingOrders: number;
  recentOrders: {
    _id: string;
    totalAmount: number;
    status: string;
    createdAt: string;
    customer: { name: string; email: string };
  }[];
  topProducts: {
    _id: string;
    name: string;
    totalSold: number;
    revenue: number;
  }[];
  topCategories: {
    _id: string;
    name: string;
    orderCount: number;
    revenue: number;
  }[];
  ordersByDay: {
    _id: string;
    count: number;
    revenue: number;
  }[];
  recentRevenue: {
    _id: string;
    revenue: number;
  }[];
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-lg border p-4">
              <div className="h-4 bg-muted rounded w-1/2 mb-2" />
              <div className="h-8 bg-muted rounded w-1/3" />
            </div>
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="animate-pulse rounded-lg border h-48" />
          <div className="animate-pulse rounded-lg border h-48" />
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Failed to load stats.</p>
      </div>
    );
  }

  const statCards = [
    { label: "Total Revenue", value: `Rs. ${stats.totalRevenue.toLocaleString()}`, href: "/admin/orders", color: "text-green-600" },
    { label: "Total Orders", value: stats.totalOrders, href: "/admin/orders" },
    { label: "Pending Orders", value: stats.pendingOrders, href: "/admin/orders?status=pending", color: "text-yellow-600" },
    { label: "Products", value: stats.totalProducts, href: "/admin/products" },
    { label: "Customers", value: stats.totalCustomers, href: "/admin/customers" },
  ];

  // Fill in missing days for the chart
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000);
    return d.toISOString().split("T")[0];
  });
  const ordersMap = new Map(stats.ordersByDay.map((d) => [d._id, d]));
  const chartData = last7Days.map((day) => ({
    day,
    count: ordersMap.get(day)?.count || 0,
    revenue: ordersMap.get(day)?.revenue || 0,
  }));
  const maxOrders = Math.max(...chartData.map((d) => d.count), 1);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-lg border p-4 hover:bg-muted/50 transition-colors"
          >
            <p className="text-xs text-muted-foreground">{card.label}</p>
            <p className={`text-xl font-semibold mt-1 ${card.color || ""}`}>
              {card.value}
            </p>
          </Link>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Orders Last 7 Days */}
        <div className="rounded-lg border p-4">
          <h2 className="font-semibold text-sm mb-4">Orders (Last 7 Days)</h2>
          <div className="flex items-end gap-1.5 h-32">
            {chartData.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] text-muted-foreground">
                  {d.count || ""}
                </span>
                <div
                  className="w-full bg-primary/20 rounded-t relative"
                  style={{
                    height: `${d.count > 0 ? Math.max((d.count / maxOrders) * 100, 8) : 4}%`,
                  }}
                >
                  <div className="absolute inset-0 bg-primary rounded-t" />
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {new Date(d.day).toLocaleDateString("en-PK", { weekday: "narrow" })}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Last 30 Days */}
        <div className="rounded-lg border p-4">
          <h2 className="font-semibold text-sm mb-4">Revenue (Last 30 Days)</h2>
          {stats.recentRevenue.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
              No revenue data yet.
            </div>
          ) : (
            <div className="space-y-2">
              {stats.recentRevenue.slice(-7).map((d) => {
                const maxRev = Math.max(...stats.recentRevenue.map((r) => r.revenue));
                return (
                  <div key={d._id} className="flex items-center gap-3 text-sm">
                    <span className="w-16 text-xs text-muted-foreground shrink-0">
                      {new Date(d._id).toLocaleDateString("en-PK", { month: "short", day: "numeric" })}
                    </span>
                    <div className="flex-1 h-4 bg-muted rounded overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded"
                        style={{ width: `${(d.revenue / maxRev) * 100}%` }}
                      />
                    </div>
                    <span className="w-24 text-right text-xs font-medium shrink-0">
                      Rs. {d.revenue.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Recent Orders */}
        <div className="lg:col-span-2 rounded-lg border">
          <div className="px-4 py-3 border-b flex items-center justify-between">
            <h2 className="font-semibold text-sm">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs text-primary hover:underline">
              View All
            </Link>
          </div>
          <div className="divide-y">
            {stats.recentOrders.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                No orders yet.
              </div>
            ) : (
              stats.recentOrders.map((order) => (
                <div key={order._id} className="px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{order.customer?.name || "Unknown"}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString("en-PK", { month: "short", day: "numeric" })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">Rs. {order.totalAmount.toLocaleString()}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[order.status] || ""}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="rounded-lg border">
          <div className="px-4 py-3 border-b flex items-center justify-between">
            <h2 className="font-semibold text-sm">Top Products</h2>
            <Link href="/admin/products" className="text-xs text-primary hover:underline">
              View All
            </Link>
          </div>
          <div className="divide-y">
            {stats.topProducts.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                No sales yet.
              </div>
            ) : (
              stats.topProducts.map((p, i) => (
                <div key={p._id} className="px-4 py-3 flex items-center gap-3">
                  <span className="text-xs font-bold text-muted-foreground w-4">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-1">{p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.totalSold} sold
                    </p>
                  </div>
                  <span className="text-xs font-medium">
                    Rs. {p.revenue.toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Top Categories */}
      {stats.topCategories.length > 0 && (
        <div className="rounded-lg border">
          <div className="px-4 py-3 border-b">
            <h2 className="font-semibold text-sm">Top Categories</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 divide-x">
            {stats.topCategories.map((cat, i) => (
              <div key={cat._id} className="px-4 py-3 text-center">
                <span className="text-xs font-bold text-muted-foreground">
                  #{i + 1}
                </span>
                <p className="text-sm font-medium mt-1">{cat.name}</p>
                <p className="text-xs text-muted-foreground">
                  Rs. {cat.revenue.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
