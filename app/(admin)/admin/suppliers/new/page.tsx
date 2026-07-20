import { SupplierForm } from "@/components/admin/supplier-form";

export default function NewSupplierPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Create Supplier</h1>
      <SupplierForm mode="create" />
    </div>
  );
}
