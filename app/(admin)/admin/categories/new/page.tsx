import { CategoryForm } from "@/components/admin/category-form";

export default function NewCategoryPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Create Category</h1>
      <CategoryForm mode="create" />
    </div>
  );
}
