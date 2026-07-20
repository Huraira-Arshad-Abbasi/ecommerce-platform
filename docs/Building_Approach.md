# Building the Local Commerce Platform — A Developer's Approach

**Purpose:** This document explains how this project is being built, step by step. It is written for students and junior developers who want to understand not just *what* was built, but *why* and *how*.

**Last Updated:** Phase 8 — Admin Product Management

---

## How to Read This Document

This is a living document. After every completed phase, we update this document with:
- What was built
- Why specific decisions were made
- What patterns and principles were followed
- What problems were solved and how

If you are a student reading this, start from the beginning. Each section builds on the previous one.

---

## Before Writing Any Code

Most developers make the mistake of opening a code editor immediately. We did the opposite.

Before writing a single line of code, three documents were created:

1. **Project Blueprint** — Defines *why* this project exists, *what* problem it solves, and *what* we are intentionally not building.
2. **Developer Guide** — Defines the technical rules, architecture principles, and coding standards.
3. **Development Roadmap** — Defines the *order* in which features will be built, broken into milestones.

Then a fourth document was created:

4. **MVP Building Strategy** — A more detailed, actionable breakdown of the roadmap with specific folder structures, completion checklists, and rules for each phase.

**Lesson:** Planning before coding saves more time than any framework or tool ever will. A clear plan prevents feature creep, reduces confusion, and keeps the project focused on business goals.

---

## The Technology Stack and Why Each Tool Was Chosen

| Tool | Why |
|---|---|
| **Next.js (App Router)** | Server-side rendering, API routes, file-based routing — all in one framework. |
| **TypeScript** | Catches errors at compile time, makes code self-documenting. |
| **Tailwind CSS + shadcn/ui** | Rapid UI development without writing custom CSS. shadcn gives production-ready components. |
| **MongoDB + Mongoose** | Flexible schema for a startup that is still learning about its data. Mongoose adds validation and type safety. |
| **Zod** | Validates user input on both client and server. One schema, two uses. |
| **React Hook Form** | Handles form state, validation, and submission without re-rendering the entire form. |
| **jose** | Lightweight JWT library for session management. Works in Edge and Node.js runtimes. |
| **bcryptjs** | Hashes passwords before storing them. Never store plain text passwords. |
| **Cloudinary** | Offloads image storage and optimization to a dedicated service. |

**Lesson:** Every technology choice should solve a specific problem. Do not add a library because it is popular. Add it because you need it.

---

## The Architecture Pattern

The project follows a **feature-based architecture** with strict separation of concerns:

```
app/
  (auth)/          ← Feature: Authentication (route group, no URL segment)
  (shop)/          ← Feature: Customer-facing pages
  (admin)/         ← Feature: Admin dashboard
  api/             ← Feature: API endpoints
  actions/         ← Feature: Server actions

components/
  ui/              ← Reusable UI primitives (shadcn)
  shared/          ← Components used across features
  auth/            ← Auth-specific components
  shop/            ← Shop-specific components
  admin/           ← Admin-specific components

lib/
  auth.ts          ← Session management logic
  db.ts            ← Database connection logic
  utils.ts         ← General utilities
  cloudinary.ts    ← Image upload logic

models/            ← Database schemas (Mongoose)
schemas/           ← Validation schemas (Zod)
```

### Key Rules

1. **UI components only render and handle interaction.** Business logic lives in `lib/`, `actions/`, or API routes.
2. **Database access is centralized** through `lib/db.ts`. Components never connect to the database directly.
3. **Each module is independent.** Authentication does not depend on Products. Products do not depend on Orders.
4. **Validation happens in two places.** Zod schemas validate on the client (for UX) and on the server (for security). Never trust client-side validation alone.

**Lesson:** Good architecture is not about using the latest patterns. It is about keeping code simple, organized, and easy to change.

---

## Phase 1 — Foundation Setup

### What Was Built

The project started with `create-next-app`. The first step was to **remove** everything that came default.

### Boilerplate Cleanup

The default Next.js page contains logos, links to Vercel templates, and documentation. None of this is needed. We replaced it with a single heading:

```tsx
// app/page.tsx
export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="text-center space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight">
          Local Commerce Platform
        </h1>
        <p className="text-sm text-zinc-500">Coming soon.</p>
      </div>
    </div>
  );
}
```

The `public/` folder had 5 SVG files (`next.svg`, `vercel.svg`, `globe.svg`, `file.svg`, `window.svg`). All deleted. They served no purpose.

### Folder Structure

Every folder was created with a purpose:

- `(auth)/` — Route group for login and register. The parentheses mean this segment does not appear in the URL. So `/login` not `(auth)/login`.
- `(shop)/` — Customer-facing pages: products, product detail, cart, checkout.
- `(admin)/` — Admin dashboard pages. The sidebar navigation lives in this layout.
- `api/` — REST API endpoints for each resource.
- `components/` — Split by scope: `ui/` for shared primitives, feature folders for feature-specific components.
- `lib/` — Shared utilities and configurations.
- `models/` — Mongoose schemas, one file per model.
- `schemas/` — Zod validation schemas, one file per feature.

### Environment Variables

An `.env.example` file documents all required variables without exposing actual secrets:

```
MONGODB_URI=...
AUTH_SECRET=...
CLOUDINARY_CLOUD_NAME=...
```

The `.env.local` file (gitignored) contains the real values. The `.gitignore` was already configured to exclude `.env*` files.

### Packages Installed

Only what was needed:
- `mongoose` + `mongodb` — Database
- `next-auth` + `jose` — Authentication (later simplified to just jose)
- `zod` — Validation
- `bcryptjs` — Password hashing
- `cloudinary` — Image uploads
- `clsx` + `tailwind-merge` — Utility classes for conditional styling
- `react-hook-form` + `@hookform/resolvers` — Form handling
- `server-only` — Prevents server code from leaking to client

**Lesson:** A clean foundation prevents technical debt from day one. Every folder, every file, every package should have a clear reason to exist.

---

## Phase 2 — Data Models

### What Was Built

Five Mongoose models representing the core business entities:

**User**
```ts
{
  name: String,      // Required
  email: String,     // Required, unique (indexed)
  password: String,  // Required (hashed)
  role: "customer" | "admin",  // Default: "customer"
  timestamps: true
}
```

**Category**
```ts
{
  name: String,      // Required, text index for search
  slug: String,      // Required, unique
  description: String,
  image: String,     // Cloudinary URL
  isActive: Boolean, // Default: true, indexed
  timestamps: true
}
```

**Supplier**
```ts
{
  name: String,      // Required, text index for search
  contactPerson: String,
  phone: String,
  email: String,
  address: String,
  isActive: Boolean, // Default: true, indexed
  timestamps: true
}
```

**Product**
```ts
{
  name: String,          // Required, text index
  slug: String,          // Required, unique
  description: String,   // Required, text index
  price: Number,         // Required, indexed
  compareAtPrice: Number,
  images: [String],      // Cloudinary URLs
  category: ObjectId,    // Ref → Category, indexed
  supplier: ObjectId,    // Ref → Supplier, indexed
  stock: Number,         // Required, default: 0
  isActive: Boolean,     // Default: true, indexed
  timestamps: true
}
```

**Order**
```ts
{
  customer: ObjectId,    // Ref → User, indexed
  items: [{
    product: ObjectId,   // Ref → Product
    quantity: Number,
    price: Number
  }],
  totalAmount: Number,
  shippingAddress: {
    fullName, phone, address, city, postalCode
  },
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled",
  paymentMethod: "cod",  // Cash on Delivery only for MVP
  timestamps: true       // indexed
}
```

### Why Indexes Matter

Indexes are like a book's table of contents. Without them, MongoDB scans every document to find matching records. With them, MongoDB jumps directly to the right location.

```ts
// Without index: MongoDB scans ALL products
Product.find({ category: someId })

// With index: MongoDB uses the index to jump to matching products
ProductSchema.index({ category: 1 });
```

We added:
- **Text indexes** on searchable fields (name, description) for search functionality.
- **Single-field indexes** on frequently filtered fields (category, supplier, isActive, status).
- **Compound index** on `{ customer: 1, createdAt: -1 }` for efficient order history queries.

### Why Zod Schemas Are Separate from Mongoose

Mongoose validates at the database level. Zod validates at the API/form level. They serve different purposes:

- **Zod** runs before data reaches the database. It gives users friendly error messages.
- **Mongoose** runs as a safety net at the database level. It ensures data integrity.

```ts
// schemas/product.ts — validates API input
export const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  price: z.number().positive("Price must be positive"),
  // ...
});

// models/Product.ts — validates database writes
const ProductSchema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  // ...
});
```

**Lesson:** Data modeling is the most important part of building an application. Get your models right, and everything else becomes easier. Get them wrong, and every feature becomes a struggle.

---

## Phase 3 — Authentication

### The Problem

Users need to register, log in, and access protected pages. Sessions must persist across page reloads. Protected routes must redirect unauthenticated users.

### The Approach

We chose a **custom JWT-based authentication** approach instead of using a library like NextAuth/Auth.js directly. Here is why:

1. **Full control** over the session logic and user model.
2. **No adapter conflicts** — the Auth.js MongoDB adapter had dependency version conflicts with our Mongoose setup.
3. **Simpler debugging** — when something breaks, we know exactly where to look.
4. **Educational value** — building auth from scratch teaches how sessions actually work.

### How Sessions Work

```
1. User submits login form
        ↓
2. Server validates credentials (bcrypt.compare)
        ↓
3. Server creates JWT containing { userId, role }
        ↓
4. JWT is stored as an httpOnly cookie
        ↓
5. On every request, proxy.ts reads the cookie and decrypts the JWT
        ↓
6. If JWT is valid → user is authenticated
   If JWT is missing/invalid → redirect to /login
```

### The Three Files

**`lib/auth.ts`** — Session management
```ts
encrypt(payload)     // Creates a JWT from user data
decrypt(session)     // Verifies and decodes a JWT
createSession()      // Encrypts + sets the cookie
getSession()         // Reads and decrypts the current session
deleteSession()      // Deletes the cookie (logout)
```

**`app/actions/auth.ts`** — Server actions
```ts
register(state, formData)  // Validates → hashes password → saves user → creates session
login(state, formData)     // Validates → finds user → compares password → creates session
logout()                   // Deletes session → redirects to /login
```

**`proxy.ts`** — Route protection (Next.js 16 replaces middleware.ts with proxy.ts)
```ts
// Protected routes: /cart, /checkout → redirect to /login if no session
// Auth routes: /login, /register → redirect to / if session exists
```

### Forms with useActionState

Next.js 16 and React 19 recommend `useActionState` for form handling with server actions:

```tsx
const [state, action, pending] = useActionState(login, null);

// state — returned errors or messages from the server action
// action — the server action to call on form submit
// pending — true while the action is running (for loading states)
```

This pattern keeps validation logic on the server (where it is secure) while providing instant feedback on the client.

### Password Security

Passwords are never stored in plain text. The flow is:

```
Register:  "mypassword" → bcrypt.hash() → "$2a$10$..." (stored in DB)
Login:     "mypassword" + "$2a$10$..." → bcrypt.compare() → true/false
```

bcrypt adds a random "salt" to each password before hashing, so even identical passwords produce different hashes.

**Lesson:** Never build authentication from scratch in production without understanding security deeply. For learning purposes, building it yourself teaches invaluable lessons about how sessions, cookies, and JWTs actually work.

---

## Patterns Used Throughout

### 1. Server Actions Over API Routes

For mutations (creating, updating, deleting data), we use Next.js Server Actions instead of API routes:

```ts
// Server Action (preferred for forms)
"use server"
export async function register(state, formData) { ... }

// API Route (used for external/public APIs)
export async function POST(request) { ... }
```

Server Actions are type-safe, work with React forms, and do not require manual fetch calls.

### 2. Route Groups for Layouts

Route groups with parentheses `(folder)` create shared layouts without adding URL segments:

```
app/(auth)/layout.tsx      → Centers the form on screen
app/(auth)/login/page.tsx  → URL: /login (not /auth/login)
app/(shop)/layout.tsx      → Adds the shop navigation header
```

### 3. Client vs Server Components

- **Server Components** (default) — Run on the server, can access the database directly, cannot use hooks or browser APIs.
- **Client Components** (`"use client"`) — Run in the browser, can use hooks like `useState`, `useActionState`, `usePathname`.

Rule of thumb: Start with Server Components. Only add `"use client"` when you need interactivity.

### 4. Incremental Development

Each phase builds on the previous one:
```
Foundation → Data Models → Auth → Products → Cart → Orders → Admin
```

We do not build multiple features simultaneously. We finish one, test it, commit it, then move to the next.

---

## Phase 4 — Product Browsing

### What Was Built

Three pages that let customers discover and view products, plus an API layer with filtering, search, and pagination.

### API Routes

The product API (`app/api/products/route.ts`) supports:
- **Category filtering** — `?category=slug`
- **Price range** — `?minPrice=500&maxPrice=5000`
- **Text search** — `?search=keyword` (uses MongoDB text index)
- **Sorting** — `?sort=price-asc`, `price-desc`, `name-asc`, `newest`
- **Pagination** — `?page=1&limit=12` (returns `total`, `page`, `pages`)

A separate `app/api/products/[id]/route.ts` handles fetching a single product.

### Pages

**Homepage** (`app/(shop)/page.tsx`)
- Server component that fetches featured products and categories
- Hero section, featured products grid, category cards
- Calls the internal API using `fetch()` with `next: { revalidate: 3600 }` for ISR

**Product Listing** (`app/(shop)/products/page.tsx`)
- Client component with URL search params for filters
- `useRouter` + `useSearchParams` to sync filter state with URL
- Sidebar filters (categories, price range), search bar, sort dropdown
- `ProductCard` component for consistent product display

**Product Detail** (`app/(shop)/product/[id]/page.tsx`)
- Server component with `generateMetadata` for SEO
- Product images, price, description, stock status
- `AddToCart` client component handles cart interaction

### Lesson

The homepage uses **Incremental Static Regeneration** (ISR) — `revalidate: 3600` means the page is generated at build time and re-generated at most once per hour. This gives the performance of static pages with the freshness of dynamic ones. The product listing page is fully dynamic because filters change constantly.

---

## Phase 5 — Shopping Cart

### What Was Built

A client-side shopping cart using Zustand with localStorage persistence.

### Why Zustand Over Context API

React Context re-renders every consumer when any part of the state changes. Zustand solves this with selective subscriptions:

```tsx
// Only re-renders when items change, not when other state changes
const items = useCartStore((state) => state.items);

// Only re-renders when total changes
const total = useCartStore((state) => state.getTotal());
```

### Cart Architecture

The cart is entirely client-side. There is no server-side cart, no cart API, and no cart model. Why?

1. **Anonymous users** need a cart before they log in.
2. **Performance** — no server round-trips for adding/removing items.
3. **Simplicity** — localStorage is sufficient for MVP.
4. **Merging** — on login, we can optionally merge the localStorage cart with a server-side cart (future phase).

### Cart Store (`lib/cart.ts`)

```ts
interface CartState {
  items: CartItem[];
  addItem(item)          // Adds item or increments quantity (capped at stock)
  removeItem(id)         // Removes item entirely
  updateQuantity(id, n)  // Sets quantity (capped at stock)
  clearCart()            // Empties the cart
  getTotal()             // Sum of price * quantity
  getItemCount()         // Sum of quantities
}
```

Persisted to `localStorage` under the key `"cart-storage"` via Zustand's `persist` middleware.

### AddToCart Component (`components/shop/add-to-cart.tsx`)

- Reads URL search params to detect `?added=1` (post-redirect feedback)
- Shows quantity selector and "Added to Cart" confirmation
- Validates that user is logged in before allowing add

### Cart Page (`app/(shop)/cart/page.tsx`)

- Displays all items with images, quantity controls, and remove buttons
- Order summary sidebar with subtotal and checkout link
- Empty state with link to browse products

### Lesson

Client-side state management is not "worse" than server-side. It is a different tool for a different problem. The cart is a temporary, user-specific, frequently-changing piece of state — perfect for client-side storage. Making it server-side would add complexity without meaningful benefit.

---

## Phase 6 — Checkout & Orders

### What Was Built

The checkout flow: shipping form → order creation → order history → order detail.

### Checkout Page (`app/(shop)/checkout/page.tsx`)

A client component that:
1. Reads cart items from Zustand
2. Shows an order summary (items, quantities, prices, total)
3. Presents a shipping address form (name, phone, address, city, postal code)
4. On submit, sends `POST /api/orders` with cart items and address
5. On success, clears the cart and redirects to the order detail page

### Order API Routes

**`POST /api/orders`** — Create an order:
1. Requires authentication (checks JWT session)
2. Validates that all products exist and have sufficient stock
3. Calculates total from actual product prices (never trust client-side prices)
4. Creates the order document in MongoDB
5. Decrements stock for each product
6. Returns the created order

**`GET /api/orders`** — List customer's orders:
- Returns orders sorted by newest first
- Populates product names and images for display
- Only returns orders belonging to the current user

**`GET /api/orders/[id]`** — Single order detail:
- Returns one order with full item details
- Verifies the order belongs to the current user

### Order Pages

**Order History** (`app/(shop)/orders/page.tsx`)
- Fetches all orders for the current user
- Displays order ID, date, item count, total, and status badge
- Links to order detail page

**Order Detail** (`app/(shop)/orders/[id]/page.tsx`)
- Shows full order information: items, prices, quantities
- Shipping address
- Order summary with total
- Status badge with color coding

### Security Pattern: Price Verification

The checkout never trusts the prices sent by the client:

```ts
// Client sends: { product: "abc", quantity: 2 }
// Server fetches the actual product: { price: 1500 }
// Server uses product.price, NOT client-sent price
```

This prevents tampering — a user cannot change the price in the browser and pay less.

### Lesson

The checkout flow is the most security-sensitive part of an e-commerce application. Every piece of data from the client is untrusted. Product prices, stock levels, and user identity must all be verified server-side. The server is the single source of truth.

---

## Phase 7 — Admin Dashboard Shell

### What Was Built

An admin panel with role-based access control, sidebar navigation, and a dashboard with real-time statistics.

### Admin Route Protection

The `proxy.ts` now checks two things for admin routes:
1. **Authentication** — Is the user logged in? (JWT cookie exists)
2. **Authorization** — Is the user an admin? (`role === "admin"`)

```ts
// proxy.ts
if (isAdminRoute && !payload) {
  return NextResponse.redirect(new URL("/login", request.nextUrl));
}
if (isAdminRoute && payload && payload.role !== "admin") {
  return NextResponse.redirect(new URL("/", request.nextUrl));
}
```

This is **defense in depth** — even if someone tries to access `/admin/dashboard` directly, the proxy blocks them before the page loads. The API routes also verify the admin role independently.

### Admin Layout (`app/(admin)/layout.tsx`)

The admin layout uses a dedicated `AdminSidebar` component with:
- Active state highlighting (current page gets a colored background)
- Links to all admin sections (Dashboard, Products, Categories, Suppliers, Orders, Customers)
- "Back to Store" link and Logout button
- Responsive design with a fixed-width sidebar

### Dashboard Stats API (`app/api/admin/stats/route.ts`)

Returns four metrics:
- **Total Orders** — `Order.countDocuments()`
- **Total Products** — `Product.countDocuments()`
- **Total Customers** — `User.countDocuments({ role: "customer" })`
- **Total Revenue** — MongoDB aggregation pipeline summing `totalAmount` for non-cancelled orders
- **Recent Orders** — Last 5 orders with customer names

All queries run in parallel with `Promise.all()` for performance.

### Admin Seed Script (`scripts/seed-admin.ts`)

Admin accounts are not created through public registration. The seed script:
1. Connects to MongoDB
2. Checks if admin already exists (by email)
3. If not, creates one with a hashed password
4. Run via: `npm run seed admin`

Default credentials: `admin@localcommerce.com` / `admin123`

### Lesson

Authorization is not just about hiding buttons. A user who knows the URL can navigate directly to any page. The real protection happens on the server — in the proxy (for pages) and in API routes (for data). Never rely solely on the UI to enforce access control.

---

## Phase 8 — Admin Product Management

### What Was Built

Full CRUD for products: list with search/pagination, create form with image upload, edit form, and delete with confirmation.

### Admin Product API Routes

**`GET /api/admin/products`** — List all products (including inactive):
- Supports search, category filter, and pagination
- Populates category and supplier names
- Requires admin role

**`POST /api/admin/products`** — Create a product:
- Validates required fields (name, slug, description, price, category, supplier)
- Checks slug uniqueness
- Stores images as Cloudinary URLs

**`GET /api/admin/products/[id]`** — Get a single product (for edit form)

**`PUT /api/admin/products/[id]`** — Update a product:
- Checks slug uniqueness if slug is being changed
- Uses `findByIdAndUpdate` with validators

**`DELETE /api/admin/products/[id]`** — Delete a product:
- Permanent deletion (not soft delete)
- Confirmed by user before executing

### Image Upload (`POST /api/admin/upload`)

Uploads images to Cloudinary using streaming:

```ts
const stream = cloudinary.uploader.upload_stream(
  { folder: "local-commerce", resource_type: "image" },
  (error, result) => { ... }
);
stream.end(buffer);
```

The file is read from a `FormData` request, converted to a Buffer, and streamed to Cloudinary. The returned `secure_url` is stored in the product's `images` array.

### Product Form Component (`components/admin/product-form.tsx`)

A shared component used by both create and edit pages:

- **Auto-generates slug** from product name
- **Loads categories and suppliers** from API on mount
- **Image upload** with preview and remove capability
- **Category/supplier selection** via dropdowns
- **Stock management** with numeric input
- **Active toggle** to show/hide product in store

The form adapts its behavior based on the `mode` prop (`"create"` or `"edit"`).

### Products List Page

- Table view with columns: Product, Category, Supplier, Price, Stock, Status, Actions
- Search input filters by name/description
- Pagination with Previous/Next buttons
- Delete button with confirmation dialog
- Edit link navigates to the product form

### Lesson

Image upload is one of the few features that requires a different approach on client and server. The client reads the file and sends it as `FormData`. The server receives the `FormData`, extracts the file buffer, and streams it to a third-party service (Cloudinary). This separation keeps the upload logic clean and testable.

---

## What's Next

**Phase 9 — Admin Supplier & Category Management** will add:
- Supplier CRUD (list, create, edit, activate/deactivate)
- Category CRUD (list, create, edit, delete)
- Both with admin-only API routes

---

## Summary for Students

1. **Plan before coding.** Write down what you are building and why.
2. **Start simple.** Remove defaults. Add only what you need.
3. **Organize by feature**, not by file type.
4. **Validate input** at every boundary (client and server).
5. **Secure passwords** with bcrypt. Never store plain text.
6. **Use sessions** to remember logged-in users.
7. **Protect routes** with proxy/middleware.
8. **Build incrementally.** One phase at a time.
9. **Commit working code** at the end of each phase.
10. **Document your decisions.** Future you will thank present you.
