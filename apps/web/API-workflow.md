# API Layer — Implementation Guide

> A generic, reusable guideline for building a consistent, type-safe API layer using
> **TanStack Query (React Query)** + **Ky (`lib/ky.ts`)** + **TypeScript**.
> Follow this guide across every project to guarantee the same folder structure,
> naming conventions, and patterns every time.
> find my Ky client in `lib/ky.ts`

---

## Core Philosophy

The API layer is split into **two strict layers**. Neither layer bleeds into the other,
and neither layer touches UI, routing, or business logic.

| Layer          | Folder                | Purpose                                                  |
| -------------- | --------------------- | -------------------------------------------------------- |
| **Query List** | `src/api/query-list/` | Pure API definitions — TypeScript interfaces + api calls |
| **API Hooks**  | `src/api/api-hooks/`  | React Query hooks that wrap and expose Layer 1           |

---

## Folder Structure

```
src/
└── api/
    ├── query-list/          # Layer 1
    │   ├── <module>.query.ts
    │   └── admin/
    │       └── <module>-query.ts
    │
    └── api-hooks/           # Layer 2
        ├── <module>.api-hook.ts
        └── admin/
            └── <module>.api-hooks.ts
```

### File Naming Rules

| Scope  | Query List file           | Hook file                     |
| ------ | ------------------------- | ----------------------------- |
| Public | `<module>.query.ts`       | `<module>.api-hook.ts`        |
| Admin  | `admin/<module>-query.ts` | `admin/<module>.api-hooks.ts` |

---

## Layer 1 — Query List

### Rules

- Only import `api` from `@/lib/ky` and utility helpers. **No React. No hooks., universal**
- Define all TypeScript interfaces in this file and export them.
- Export a single API object (named `<module>Api`) with one method per endpoint.
- Handle `FormData` construction here, never in hooks.
- Use `searchParams` for query string filters, never string concatenation.

### Interface Naming Convention

| Interface              | Purpose                                             |
| ---------------------- | --------------------------------------------------- |
| `<Entity>`             | Core data model                                     |
| `<Entity>Response`     | API response wrapper (`success`, `message`, `data`) |
| `<Entity>ListResponse` | Paginated list response                             |
| `Create<Entity>Data`   | POST request payload                                |
| `Update<Entity>Data`   | PATCH / PUT request payload                         |
| `<Entity>Filters`      | Optional query parameters                           |

### Example

```typescript
import { api } from "@/lib/ky";

export interface Product {
  /* fields */
}
export interface ProductResponse {
  success: boolean;
  message: string;
  data: Product;
}
export interface CreateProductData {
  /* required fields */
}
export interface ProductFilters {
  page?: number;
  category?: string;
}

export const productApi = {
  getAll: (filters?: ProductFilters) =>
    api.get("products/", { searchParams: filters as any }).json<ProductResponse>(),
  getById: (id: number | string) => api.get(`products/${id}/`).json<ProductResponse>(),
  create: (data: CreateProductData) =>
    api.post("products/", { json: data }).json<ProductResponse>(),
  update: (id: number | string, data: Partial<CreateProductData>) =>
    api.patch(`products/${id}/`, { json: data }).json<ProductResponse>(),
  remove: (id: number | string) => api.delete(`products/${id}/`).json<void>(),
};
```

---

## Layer 2 — API Hooks

### Rules

- Only import from `@tanstack/react-query`, `$fetch$`, toast library, error helper, and Layer 1 files.
- **Never** import from `src/app`, `src/components`, or any UI layer.
- Define a `*_KEYS` constant at the **top** of every hook file — never inline.
- Use `useQuery` for GET requests, `useMutation` for POST / PATCH / PUT / DELETE.
- Always use `select` to unwrap the Axios response before returning data.
- Always show a toast on success and on error for mutations.
- Always invalidate the relevant cache keys after a successful mutation.

### Query Key Shape

```typescript
const PRODUCT_KEYS = {
  all: () => ["products"] as const,
  lists: () => ["products", "list"] as const,
  detail: (id: number | string) => ["products", "detail", id] as const,
};
```

> **Admin keys** must be prefixed with `'admin'` to avoid cache collisions:
> `['admin', 'products']`

### useQuery — Reads (GET)

```typescript
// List
export const useProducts = (filters?: ProductFilters) => {
  return useQuery({
    queryKey: PRODUCT_KEYS.lists(),
    queryFn: () => productApi.getAll(filters),
    select: (response) => response.data,
  });
};

// Single item — only fetch when id is available
export const useProduct = (id?: number | string) => {
  return useQuery({
    queryKey: PRODUCT_KEYS.detail(id ?? "unknown"),
    queryFn: () => productApi.getById(id!),
    enabled: !!id,
    select: (response) => response.data,
  });
};
```

### useMutation — Writes (POST / PATCH / DELETE)

```typescript
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductData) => productApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.all() });
      toast.success("Created successfully");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Failed to create"));
    },
  });
};
```

> For **PATCH/PUT**, pass both `id` and `data` as a single object in `mutationFn`.
> For **DELETE**, pass only the `id`. Invalidate the same keys as POST.

---

## Implementation Workflow

When adding a new API module, always follow these steps **in order**:

### 1. Create the Query List file

- Define all interfaces for the module.
- Export the API object with one method per endpoint.
- No logic beyond HTTP calls and payload construction.

### 2. Create the API Hook file

- Declare `*_KEYS` at the top.
- Write `useQuery` hooks for every GET endpoint.
- Write `useMutation` hooks for every write endpoint.
- Wire up toast feedback and cache invalidation.

### 3. Hand off

Your job ends at `src/api/`. Component integration is handled separately.

---

## Boundaries — What Belongs Here vs. Not

| Belongs in `src/api/`              | Does NOT belong here          |
| ---------------------------------- | ----------------------------- |
| TypeScript interfaces for API data | UI components or layouts      |
| $fetch endpoint methods            | Navigation / routing logic    |
| Query keys                         | Form validation schemas       |
| React Query hooks                  | Global state management       |
| Toast notifications for mutations  | Business rules / calculations |
| Cache invalidation                 | Auth redirect logic           |

---

## Quick Reference

| Need                         | Solution                                            |
| ---------------------------- | --------------------------------------------------- |
| Fetch a list                 | `useQuery` + `lists()` key                          |
| Fetch one item (optional id) | `useQuery` + `enabled: !!id`                        |
| Fetch with filters           | Include filters object in `queryKey`                |
| Create                       | `useMutation` + invalidate `all()`                  |
| Update                       | `useMutation` + invalidate `all()` and `detail(id)` |
| Delete                       | `useMutation` + invalidate `all()`                  |
| Unwrap $fetch data           | `select: (r) => r.data`                             |
| Unwrap nested response       | `select: (r) => r.data.data`                        |
| Error message from API       | `getApiErrorMessage(error, 'fallback')`             |

---