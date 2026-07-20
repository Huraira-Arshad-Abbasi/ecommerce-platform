import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "../.env.local") });

const MONGODB_URI = process.env.MONGODB_URI!;

const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: { type: String, default: "customer" },
  },
  { timestamps: true }
);

const User =
  mongoose.models.User || mongoose.model("User", UserSchema);

async function seed() {
  if (!MONGODB_URI) {
    console.error("MONGODB_URI is not defined");
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  const email = "admin@localcommerce.com";
  const password = "admin123";

  const existing = await User.findOne({ email });
  if (existing) {
    console.log(`Admin user already exists: ${email}`);
    await mongoose.disconnect();
    process.exit(0);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await User.create({
    name: "Admin",
    email,
    password: hashedPassword,
    role: "admin",
  });

  console.log(`Admin user created: ${email} / ${password}`);
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
