import mongoose, { Schema, Document } from "mongoose";

export interface ISupplier extends Document {
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SupplierSchema = new Schema<ISupplier>(
  {
    name: { type: String, required: true },
    contactPerson: { type: String },
    phone: { type: String },
    email: { type: String },
    address: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

SupplierSchema.index({ name: "text" });
SupplierSchema.index({ isActive: 1 });

export default mongoose.models.Supplier ||
  mongoose.model<ISupplier>("Supplier", SupplierSchema);
