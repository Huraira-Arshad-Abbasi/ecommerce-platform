import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "../.env.local") });

const MONGODB_URI = process.env.MONGODB_URI!;

// Schemas
const UserSchema = new mongoose.Schema(
  { name: String, email: { type: String, unique: true }, password: String, role: { type: String, default: "customer" } },
  { timestamps: true }
);
const CategorySchema = new mongoose.Schema(
  { name: String, slug: { type: String, unique: true }, description: String, image: String, isActive: { type: Boolean, default: true } },
  { timestamps: true }
);
const SupplierSchema = new mongoose.Schema(
  { name: String, contactPerson: String, phone: String, email: String, address: String, isActive: { type: Boolean, default: true } },
  { timestamps: true }
);
const ProductSchema = new mongoose.Schema(
  {
    name: String, slug: { type: String, unique: true }, description: String, price: Number, compareAtPrice: Number,
    images: [String], category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier" }, stock: Number, isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);
const OrderSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    items: [{ product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" }, quantity: Number, price: Number }],
    totalAmount: Number,
    shippingAddress: { fullName: String, phone: String, address: String, city: String, postalCode: String },
    status: { type: String, default: "pending" },
    paymentMethod: { type: String, default: "cod" },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);
const Category = mongoose.models.Category || mongoose.model("Category", CategorySchema);
const Supplier = mongoose.models.Supplier || mongoose.model("Supplier", SupplierSchema);
const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);
const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema);

// Dummy Data
const categories = [
  { name: "Electronics", slug: "electronics", description: "Gadgets, devices, and accessories", image: "https://res.cloudinary.com/demo/image/upload/v1/sample.jpg" },
  { name: "Clothing", slug: "clothing", description: "Men's and women's fashion", image: "https://res.cloudinary.com/demo/image/upload/v1/sample.jpg" },
  { name: "Home & Kitchen", slug: "home-kitchen", description: "Furniture, decor, and kitchen essentials", image: "https://res.cloudinary.com/demo/image/upload/v1/sample.jpg" },
  { name: "Books", slug: "books", description: "Fiction, non-fiction, and educational", image: "https://res.cloudinary.com/demo/image/upload/v1/sample.jpg" },
  { name: "Sports", slug: "sports", description: "Fitness equipment and sportswear", image: "https://res.cloudinary.com/demo/image/upload/v1/sample.jpg" },
];

const suppliers = [
  { name: "TechVibe Distributors", contactPerson: "Ahmed Khan", phone: "0301-1234567", email: "ahmed@techvibe.pk", address: "Blue Area, Islamabad" },
  { name: "Fashion Hub Imports", contactPerson: "Sara Malik", phone: "0321-7654321", email: "sara@fashionhub.pk", address: "MM Alam Road, Lahore" },
  { name: "HomeEssentials Co.", contactPerson: "Usman Ali", phone: "0333-9876543", email: "usman@homeess.pk", address: "Saddar, Karachi" },
  { name: "BookWorld Pakistan", contactPerson: "Fatima Noor", phone: "0345-1112233", email: "fatima@bookworld.pk", address: "Liberty Market, Lahore" },
  { name: "SportsZone Enterprises", contactPerson: "Bilal Ahmed", phone: "0300-5556677", email: "bilal@sportszone.pk", address: "Gulshan-e-Iqbal, Karachi" },
];

// Products per category
const productsByCategory: Record<string, Array<{ name: string; slug: string; description: string; price: number; compareAtPrice?: number; stock: number; images: string[] }>> = {
  electronics: [
    { name: "Wireless Bluetooth Headphones", slug: "wireless-bt-headphones", description: "Premium noise-cancelling over-ear headphones with 30-hour battery life and crystal-clear sound.", price: 4500, compareAtPrice: 5999, stock: 25, images: ["https://res.cloudinary.com/demo/image/upload/v1/sample.jpg"] },
    { name: "USB-C Fast Charging Cable", slug: "usb-c-fast-charge-cable", description: "2-meter braided nylon USB-C to USB-C cable supporting 100W fast charging.", price: 850, stock: 100, images: ["https://res.cloudinary.com/demo/image/upload/v1/sample.jpg"] },
    { name: "Portable Power Bank 20000mAh", slug: "power-bank-20000mah", description: "High-capacity power bank with dual USB output and LED display.", price: 3200, compareAtPrice: 3999, stock: 40, images: ["https://res.cloudinary.com/demo/image/upload/v1/sample.jpg"] },
    { name: "Mechanical Gaming Keyboard", slug: "mechanical-gaming-keyboard", description: "RGB backlit mechanical keyboard with blue switches and aluminum frame.", price: 6500, stock: 15, images: ["https://res.cloudinary.com/demo/image/upload/v1/sample.jpg"] },
    { name: "Smart Watch Pro", slug: "smart-watch-pro", description: "Fitness tracker with heart rate monitor, GPS, and 7-day battery life.", price: 8900, compareAtPrice: 11999, stock: 20, images: ["https://res.cloudinary.com/demo/image/upload/v1/sample.jpg"] },
  ],
  clothing: [
    { name: "Classic Cotton T-Shirt", slug: "classic-cotton-tshirt", description: "100% organic cotton crew neck t-shirt. Available in multiple colors.", price: 1200, stock: 80, images: ["https://res.cloudinary.com/demo/image/upload/v1/sample.jpg"] },
    { name: "Slim Fit Denim Jeans", slug: "slim-fit-denim-jeans", description: "Dark wash slim fit jeans with stretch fabric for comfort.", price: 3500, compareAtPrice: 4500, stock: 35, images: ["https://res.cloudinary.com/demo/image/upload/v1/sample.jpg"] },
    { name: "Winter Wool Jacket", slug: "winter-wool-jacket", description: "Warm wool blend jacket with inner lining. Perfect for cold weather.", price: 7800, stock: 18, images: ["https://res.cloudinary.com/demo/image/upload/v1/sample.jpg"] },
    { name: "Running Sneakers", slug: "running-sneakers", description: "Lightweight breathable sneakers with cushioned sole for running.", price: 4200, compareAtPrice: 5500, stock: 30, images: ["https://res.cloudinary.com/demo/image/upload/v1/sample.jpg"] },
  ],
  "home-kitchen": [
    { name: "Non-Stick Cookware Set", slug: "non-stick-cookware-set", description: "5-piece non-stick cookware set with heat-resistant handles.", price: 5500, compareAtPrice: 7000, stock: 12, images: ["https://res.cloudinary.com/demo/image/upload/v1/sample.jpg"] },
    { name: "Robot Vacuum Cleaner", slug: "robot-vacuum-cleaner", description: "Smart robot vacuum with mapping, scheduling, and app control.", price: 18500, stock: 8, images: ["https://res.cloudinary.com/demo/image/upload/v1/sample.jpg"] },
    { name: "LED Desk Lamp", slug: "led-desk-lamp", description: "Adjustable LED desk lamp with 5 brightness levels and USB charging port.", price: 2800, stock: 25, images: ["https://res.cloudinary.com/demo/image/upload/v1/sample.jpg"] },
    { name: "Memory Foam Pillow", slug: "memory-foam-pillow", description: "Ergonomic memory foam pillow with cooling gel layer.", price: 2200, compareAtPrice: 2999, stock: 45, images: ["https://res.cloudinary.com/demo/image/upload/v1/sample.jpg"] },
  ],
  books: [
    { name: "The Art of Programming", slug: "art-of-programming", description: "A comprehensive guide to modern software development practices.", price: 1500, stock: 50, images: ["https://res.cloudinary.com/demo/image/upload/v1/sample.jpg"] },
    { name: "Urdu Poetry Collection", slug: "urdu-poetry-collection", description: "Beautiful collection of classic and modern Urdu poetry.", price: 800, stock: 60, images: ["https://res.cloudinary.com/demo/image/upload/v1/sample.jpg"] },
    { name: "Python for Beginners", slug: "python-for-beginners", description: "Learn Python programming from scratch with hands-on projects.", price: 1200, compareAtPrice: 1600, stock: 40, images: ["https://res.cloudinary.com/demo/image/upload/v1/sample.jpg"] },
  ],
  sports: [
    { name: "Yoga Mat Premium", slug: "yoga-mat-premium", description: "Extra thick non-slip yoga mat with carrying strap.", price: 2500, stock: 35, images: ["https://res.cloudinary.com/demo/image/upload/v1/sample.jpg"] },
    { name: "Adjustable Dumbbell Set", slug: "adjustable-dumbbell-set", description: "5-25kg adjustable dumbbell set with quick-change mechanism.", price: 12000, compareAtPrice: 15000, stock: 10, images: ["https://res.cloudinary.com/demo/image/upload/v1/sample.jpg"] },
    { name: "Cricket Bat English Willow", slug: "cricket-bat-english-willow", description: "Professional grade English willow cricket bat with full grip.", price: 8500, stock: 15, images: ["https://res.cloudinary.com/demo/image/upload/v1/sample.jpg"] },
    { name: "Football Size 5", slug: "football-size-5", description: "FIFA approved size 5 football with thermally bonded panels.", price: 3200, stock: 25, images: ["https://res.cloudinary.com/demo/image/upload/v1/sample.jpg"] },
  ],
};

const customers = [
  { name: "Ali Raza", email: "ali@example.com", password: "customer123" },
  { name: "Zainab Fatima", email: "zainab@example.com", password: "customer123" },
  { name: "Hassan Nawaz", email: "hassan@example.com", password: "customer123" },
];

async function seed() {
  if (!MONGODB_URI) {
    console.error("MONGODB_URI is not defined");
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  // Check if data already exists
  const catCount = await Category.countDocuments();
  if (catCount > 0) {
    console.log("Database already has data. Skipping seed.");
    await mongoose.disconnect();
    process.exit(0);
  }

  // 1. Create categories
  console.log("Creating categories...");
  const createdCategories = await Category.insertMany(categories);
  console.log(`  Created ${createdCategories.length} categories`);

  // 2. Create suppliers
  console.log("Creating suppliers...");
  const createdSuppliers = await Supplier.insertMany(suppliers);
  console.log(`  Created ${createdSuppliers.length} suppliers`);

  // 3. Create products
  console.log("Creating products...");
  let totalProducts = 0;
  const allProducts: Array<{ _id: mongoose.Types.ObjectId; price: number; slug: string }> = [];

  for (const cat of createdCategories) {
    const products = productsByCategory[cat.slug] || [];
    const supplier = createdSuppliers[totalProducts % createdSuppliers.length];
    for (const p of products) {
      const created = await Product.create({ ...p, category: cat._id, supplier: supplier._id, isActive: true });
      allProducts.push({ _id: created._id, price: created.price, slug: created.slug });
      totalProducts++;
    }
  }
  console.log(`  Created ${totalProducts} products`);

  // 4. Create customer users
  console.log("Creating customers...");
  const hashedPassword = await bcrypt.hash("customer123", 10);
  const createdCustomers = [];
  for (const c of customers) {
    const user = await User.create({ name: c.name, email: c.email, password: hashedPassword, role: "customer" });
    createdCustomers.push(user);
  }
  console.log(`  Created ${createdCustomers.length} customers`);

  // 5. Create sample orders
  console.log("Creating sample orders...");
  const statuses = ["pending", "confirmed", "shipped", "delivered", "pending", "confirmed"];
  const cities = ["Lahore", "Karachi", "Islamabad", "Rawalpindi", "Faisalabad"];
  let totalOrders = 0;

  for (const customer of createdCustomers) {
    // Each customer gets 2-4 orders
    const orderCount = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < orderCount; i++) {
      const numItems = 1 + Math.floor(Math.random() * 3);
      const orderItems = [];
      const usedIndices = new Set<number>();

      for (let j = 0; j < numItems; j++) {
        let idx: number;
        do {
          idx = Math.floor(Math.random() * allProducts.length);
        } while (usedIndices.has(idx));
        usedIndices.add(idx);

        const p = allProducts[idx];
        const qty = 1 + Math.floor(Math.random() * 2);
        orderItems.push({ product: p._id, quantity: qty, price: p.price });
      }

      const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

      await Order.create({
        customer: customer._id,
        items: orderItems,
        totalAmount: total,
        shippingAddress: {
          fullName: customer.name,
          phone: `03${Math.floor(10000000 + Math.random() * 90000000)}`,
          address: `${Math.floor(1 + Math.random() * 200)}, Main Street`,
          city: cities[Math.floor(Math.random() * cities.length)],
          postalCode: String(Math.floor(50000 + Math.random() * 10000)),
        },
        status: statuses[Math.floor(Math.random() * statuses.length)],
        paymentMethod: "cod",
      });
      totalOrders++;
    }
  }
  console.log(`  Created ${totalOrders} orders`);

  console.log("\n--- Seed Complete ---");
  console.log("Admin:    admin@localcommerce.com / admin123");
  console.log("Customer: ali@example.com / customer123");
  console.log("Customer: zainab@example.com / customer123");
  console.log("Customer: hassan@example.com / customer123");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
