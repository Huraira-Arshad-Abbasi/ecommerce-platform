import { z } from "zod";

export const orderSchema = z.object({
  items: z
    .array(
      z.object({
        product: z.string().min(1),
        quantity: z.number().int().positive(),
        price: z.number().positive(),
      })
    )
    .min(1, "At least one item is required"),
  shippingAddress: z.object({
    fullName: z.string().min(1, "Full name is required"),
    phone: z.string().min(1, "Phone is required"),
    address: z.string().min(1, "Address is required"),
    city: z.string().min(1, "City is required"),
    postalCode: z.string().optional(),
  }),
});

export type OrderInput = z.infer<typeof orderSchema>;
