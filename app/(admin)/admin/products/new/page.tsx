import { ProductForm } from "@/components/admin/product-form";

export default function NewProductPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Create Product</h1>
      <ProductForm mode="create" />
    </div>
  );
}
