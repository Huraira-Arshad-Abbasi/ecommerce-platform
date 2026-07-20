import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().min(1, "Description is required"),
  price: z.number().positive("Price must be positive"),
  compareAtPrice: z.number().positive().optional(),
  images: z.array(z.string()).min(1, "At least one image is required"),
  category: z.string().min(1, "Category is required"),
  supplier: z.string().min(1, "Supplier is required"),
  stock: z.number().int().min(0, "Stock cannot be negative"),
  isActive: z.boolean().default(true),
});

export const productUpdateSchema = productSchema.partial();

export type ProductInput = z.infer<typeof productSchema>;
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;
