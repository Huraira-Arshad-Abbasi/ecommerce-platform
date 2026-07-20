# MVP Building Strategy

**Project:** Local Commerce Platform
**Purpose:** Step-by-step strategy for building the MVP from zero to complete.
**Status:** Active

---

## Overview

This document defines the exact order of work for building the MVP. Each phase builds on the previous one. No phase starts until the previous phase is complete and working.

The MVP is complete when customers can browse products, place COD orders, view order history, and the admin can manage everything through a dashboard.

---

## Phase 1 — Foundation Setup

**Goal:** Stable development environment where all tools work together.

### What gets built

- Project folder structure organized by feature.
- MongoDB Atlas connection with Mongoose.
- Auth.js configuration with credentials provider (email + password).
- Cloudinary integration for image uploads.
- shadcn/ui installed and configured.
- Shared layout with navigation shell.
- Environment variables documented.
- Linting and formatting rules.

### Folder structure to create

```
src/
  app/
    (auth)/
      login/
      register/
    (shop)/
      products/
      product/[id]
      cart/
      checkout/
    (admin)/
      admin/
        dashboard/
        products/
        categories/
        suppliers/
        orders/
        customers/
    api/
      auth/
      products/
      categories/
      suppliers/
      orders/
  components/
    ui/             (shadcn components)
    shared/         (reusable across features)
    auth/
    shop/
    admin/
  lib/
    db.ts           (Mongoose connection)
    auth.ts         (Auth.js config)
    cloudinary.ts   (Cloudinary config)
    utils.ts        (shared helpers)
  models/
    User.ts
    Product.ts
    Category.ts
    Supplier.ts
    Order.ts
  schemas/
    (Zod validation schemas)
```

### Completion check

- [ ] `npm run dev` starts without errors.
- [ ] MongoDB connects successfully.
- [ ] Auth.js login/register pages render.
- [ ] shadcn components can be added and used.
- [ ] Cloudinary upload works.

---

## Phase 2 — Data Models

**Goal:** Define all database schemas before building any feature.

### Models to create

**User**
- name, email, password (hashed), role (customer/admin), createdAt, updatedAt

**Category**
- name, slug, description, image, isActive, createdAt

**Supplier**
- name, contactPerson, phone, email, address, isActive, createdAt

**Product**
- name, slug, description, price, compareAtPrice, images, category (ref), supplier (ref), stock, isActive, createdAt

**Order**
- customer (ref), items [{ product, quantity, price }], totalAmount, shippingAddress, status, paymentMethod (COD), createdAt

### Rules

- Every model gets its own file in `src/models/`.
- Use Mongoose timestamps option.
- Use refs for relationships, not embedded documents.
- Validate with Zod schemas in `src/schemas/` before hitting the database.

### Completion check

- [ ] All 5 models created.
- [ ] Mongoose indexes defined for search fields.
- [ ] Zod schemas for create/update operations.

---

## Phase 3 — Authentication

**Goal:** Customers can register, login, logout, and access protected routes.

### What gets built

- Register form with validation (React Hook Form + Zod).
- Login form with validation.
- Auth.js session handling.
- Password hashing with bcrypt.
- Middleware to protect customer routes.
- Basic password reset flow.

### Key decisions

- Use Auth.js with credentials provider.
- Store users in MongoDB via Mongoose adapter.
- Session strategy: JWT (simpler for MVP).
- Admin accounts seeded manually, not through public registration.

### Completion check

- [ ] Customer can register.
- [ ] Customer can login.
- [ ] Customer can logout.
- [ ] Protected routes redirect to login.
- [ ] Session persists across page reloads.

---

## Phase 4 — Product Browsing (Customer-Facing)

**Goal:** Customers can discover and view products.

### What gets built

**Homepage**
- Featured products section.
- Category navigation.
- Search bar.

**Product Listing Page**
- Grid of product cards.
- Pagination.
- Category filter (sidebar or top bar).
- Search with query parameter.
- Sort by: newest, price low-high, price high-low.

**Product Detail Page**
- Product images (Cloudinary).
- Name, description, price.
- Stock status.
- Add to cart button.

### API routes

- `GET /api/products` — list with filters, search, pagination.
- `GET /api/products/[id]` — single product.
- `GET /api/categories` — all active categories.

### Completion check

- [ ] Homepage loads with products.
- [ ] Product listing works with filters and search.
- [ ] Product detail page shows all info.
- [ ] Images load from Cloudinary.

---

## Phase 5 — Shopping Cart

**Goal:** Customers can add products and manage their cart.

### What gets built

- Cart state management (Zustand with localStorage persistence).
- Add to cart from product detail page.
- Cart page with item list.
- Update quantity.
- Remove item.
- Cart total calculation.
- Cart item count in navigation.

### Key decisions

- Use Zustand for client-side cart state.
- Persist cart in localStorage (no server-side cart for MVP).
- Sync with database only at checkout.

### Completion check

- [ ] Add to cart works.
- [ ] Cart page shows all items.
- [ ] Quantity can be updated.
- [ ] Items can be removed.
- [ ] Total updates correctly.
- [ ] Cart persists across page reloads.

---

## Phase 6 — Checkout & Orders

**Goal:** Customers can place orders and view order history.

### What gets built

**Checkout Page**
- Shipping address form (React Hook Form + Zod).
- Order summary (items from cart).
- Cash on Delivery as only payment method.
- Place order button.
- Order confirmation page.

**Order History**
- List of past orders.
- Order detail page.
- Order status display.

### API routes

- `POST /api/orders` — create order.
- `GET /api/orders` — customer's orders.
- `GET /api/orders/[id]` — single order detail.

### Completion check

- [ ] Customer can complete checkout.
- [ ] Order is saved to database.
- [ ] Cart is cleared after order.
- [ ] Order confirmation page shows details.
- [ ] Order history lists all orders.
- [ ] Order detail page shows full info.

---

## Phase 7 — Admin Dashboard Shell

**Goal:** Admin can access a management panel.

### What gets built

- Admin login (separate from customer, or role-based).
- Admin layout with sidebar navigation.
- Dashboard page with basic stats:
  - Total orders.
  - Total products.
  - Total customers.
  - Recent orders.
- Protected admin routes (middleware).

### Key decisions

- Admin is a role on the User model.
- Admin accounts created via seed script, not public registration.
- Admin routes under `/admin` prefix.

### Completion check

- [ ] Admin can login.
- [ ] Dashboard shows stats.
- [ ] Non-admin users cannot access admin routes.
- [ ] Sidebar navigation works.

---

## Phase 8 — Admin Product Management

**Goal:** Admin can manage products without touching the database.

### What gets built

- Products list page (table view).
- Create product form.
- Edit product form.
- Delete product (with confirmation).
- Image upload to Cloudinary.
- Category selection.
- Supplier selection.
- Stock management.

### API routes

- `GET /api/admin/products` — list all products.
- `POST /api/admin/products` — create.
- `PUT /api/admin/products/[id]` — update.
- `DELETE /api/admin/products/[id]` — delete.

### Completion check

- [ ] Admin can view all products.
- [ ] Admin can create a product with images.
- [ ] Admin can edit a product.
- [ ] Admin can delete a product.
- [ ] Images upload to Cloudinary.

---

## Phase 9 — Admin Supplier & Category Management

**Goal:** Admin can manage suppliers and categories.

### What gets built

**Supplier Management**
- Supplier list.
- Add supplier form.
- Edit supplier.
- Activate/deactivate supplier.
- View products by supplier.

**Category Management**
- Category list.
- Add category form.
- Edit category.
- Delete category.

### Completion check

- [ ] Admin can CRUD suppliers.
- [ ] Admin can CRUD categories.
- [ ] Products can be assigned to suppliers and categories.

---

## Phase 10 — Admin Order & Customer Management

**Goal:** Admin can process orders and view customers.

### What gets built

**Order Management**
- Orders list with status filter.
- Order detail view.
- Update order status (pending, confirmed, shipped, delivered, cancelled).
- View customer info per order.

**Customer Management**
- Customers list.
- View customer details.
- View customer's orders.

### Completion check

- [ ] Admin can view all orders.
- [ ] Admin can update order status.
- [ ] Admin can view customer list.
- [ ] Admin can view customer details and their orders.

---

## Phase 11 — Polish & Analytics

**Goal:** Platform is ready for launch.

### What gets built

- Basic analytics on dashboard:
  - Orders per day/week.
  - Revenue summary.
  - Top-selling products.
  - Best-performing categories.
- Responsive design pass (mobile-friendly).
- Error handling and loading states.
- Empty states for all list pages.
- Final testing pass.

### Completion check

- [ ] Dashboard shows useful analytics.
- [ ] All pages work on mobile.
- [ ] Error states handled gracefully.
- [ ] No console errors or warnings.

---

## Build Order Summary

```
Phase 1  → Foundation Setup
Phase 2  → Data Models
Phase 3  → Authentication
Phase 4  → Product Browsing
Phase 5  → Shopping Cart
Phase 6  → Checkout & Orders
Phase 7  → Admin Dashboard Shell
Phase 8  → Admin Product Management
Phase 9  → Admin Supplier & Category Management
Phase 10 → Admin Order & Customer Management
Phase 11 → Polish & Analytics
```

---

## Rules While Building

1. Complete one phase fully before starting the next.
2. Test every feature before moving on.
3. Do not build features not listed in this strategy.
4. Keep code simple — no premature optimization.
5. Commit working code at the end of each phase.
6. If a phase is too large, break it into smaller steps within the phase.
7. Always follow the architecture rules from the Developer Guide.

---

## After MVP

Once all 11 phases are complete and the MVP is working:

1. Deploy to Vercel.
2. Seed real product data.
3. Test the full flow as a real customer.
4. Gather feedback.
5. Decide what to build next based on real usage data.

Do not plan post-MVP features until the MVP is live and being used.
