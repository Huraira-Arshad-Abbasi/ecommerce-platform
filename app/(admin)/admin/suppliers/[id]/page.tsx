"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { SupplierForm } from "@/components/admin/supplier-form";

interface SupplierData {
  _id: string;
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  isActive: boolean;
}

export default function EditSupplierPage() {
  const params = useParams();
  const [supplier, setSupplier] = useState<SupplierData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/admin/suppliers/${params.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Supplier not found");
        return res.json();
      })
      .then(setSupplier)
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

  if (error || !supplier) {
    return (
      <div>
        <p className="text-destructive">{error || "Supplier not found"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Edit Supplier</h1>
      <SupplierForm supplier={supplier} mode="edit" />
    </div>
  );
}
