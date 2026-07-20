# Developer Guide

**Project:** Local Commerce Platform
**Version:** 1.0

---

## 1. Purpose

This document defines the technical guidelines for developing the project.

It is intentionally concise and should help both developers and AI assistants maintain a consistent architecture throughout the project.

The goal is to build a maintainable MVP that can evolve over time without unnecessary complexity.

---

## 2. Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (App Router), TypeScript |
| Styling | Tailwind CSS, shadcn/ui |
| Database | MongoDB Atlas, Mongoose |
| Authentication | Auth.js (subject to change if project requirements evolve) |
| Forms & Validation | React Hook Form, Zod |
| Image Storage | Cloudinary |
| Deployment | Vercel |

---

## 3. Development Principles

Always follow these principles:

- Keep the MVP simple.
- Build features incrementally.
- Prefer composition over duplication.
- Keep components reusable.
- Separate business logic from UI.
- Avoid unnecessary third-party libraries.
- Do not optimize for problems that do not exist yet.

---

## 4. Architecture Rules

### Rule 1

UI components should only be responsible for rendering and user interaction.
Business logic should live outside UI components.

### Rule 2

Database access should be centralized.
Do not perform database operations directly inside UI components.

### Rule 3

Business logic should not depend on MongoDB.
If the database changes in the future, the business logic should require minimal changes.

### Rule 4

Keep modules independent.

Examples:

- Authentication
- Products
- Categories
- Suppliers
- Orders
- Customers

Each module should be as self-contained as possible.

### Rule 5

Prefer reusable components over duplicated code.

### Rule 6

Every feature should have a clear purpose.
If a feature does not support the MVP or business validation, postpone it.

---

## 5. Folder Organization

Organize the project by feature rather than by file type whenever practical.

Typical modules include:

- Authentication
- Products
- Categories
- Suppliers
- Orders
- Customers
- Shared components
- Shared utilities

The exact folder structure may evolve as the project grows.

---

## 6. Coding Standards

- Use TypeScript.
- Prefer server components where appropriate.
- Use client components only when necessary.
- Validate all user input.
- Write readable and maintainable code.
- Keep functions small and focused.
- Avoid deeply nested logic.

---

## 7. Feature Development Process

Every new feature should follow this sequence:

1. Define the requirement.
2. Design the data model (if needed).
3. Build the backend logic.
4. Build the UI.
5. Test the feature.
6. Refactor only if necessary.
7. Move to the next feature.

Do not build multiple major features simultaneously.

---

## 8. Future-Proofing

The architecture should make it reasonably easy to:

- Replace MongoDB with another database.
- Replace authentication providers.
- Replace image storage providers.
- Add new modules.
- Remove modules that are no longer needed.

Future flexibility should come from clean separation of responsibilities, not unnecessary abstraction.

---

## 9. AI Collaboration Guidelines

When assisting with development:

- Focus only on the current feature being implemented.
- Respect the existing architecture.
- Do not introduce unrelated improvements.
- Explain trade-offs before suggesting architectural changes.
- Ask questions if requirements are unclear.
- Prefer simple solutions that can be expanded later.

The project should evolve through many small iterations rather than a few large rewrites.