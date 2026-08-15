import { z } from "zod";

// ── Customers / Portal ────────────────────────────────────────────────────────
export const CreateCustomerBody = z.object({
  name: z.string(),
  email: z.string(),
  phone: z.string().nullable().optional(),
  company: z.string().nullable().optional(),
  password: z.string().optional(),
});
export const UpdateCustomerBody = CreateCustomerBody.partial();
export const UpdateCustomerParams = z.object({ id: z.coerce.number().int() });
export const DeleteCustomerParams = z.object({ id: z.coerce.number().int() });
export const PortalLoginBody = z.object({
  email: z.string(),
  password: z.string(),
});

// ── Orders ────────────────────────────────────────────────────────────────────
export const CreateOrderBody = z.object({
  customerId: z.number().int().nullable().optional(),
  status: z.string().optional(),
  items: z.array(z.any()).optional(),
  total: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});
export const UpdateOrderBody = CreateOrderBody.partial();
export const UpdateOrderParams = z.object({ id: z.coerce.number().int() });

// ── Invoices ──────────────────────────────────────────────────────────────────
export const CreateInvoiceBody = z.object({
  orderId: z.number().int().nullable().optional(),
  customerId: z.number().int().nullable().optional(),
  items: z.array(z.any()).optional(),
  total: z.string().nullable().optional(),
  status: z.string().optional(),
  dueDate: z.string().nullable().optional(),
});
export const UpdateInvoiceBody = CreateInvoiceBody.partial();
export const UpdateInvoiceParams = z.object({ id: z.coerce.number().int() });

// ── Admin Users ───────────────────────────────────────────────────────────────
export const CreateUserBody = z.object({
  username: z.string(),
  email: z.string().nullable().optional(),
  role: z.string().optional(),
  password: z.string(),
});
export const UpdateUserBody = CreateUserBody.partial();
export const UpdateUserParams = z.object({ id: z.coerce.number().int() });
export const DeleteUserParams = z.object({ id: z.coerce.number().int() });

// ── Media ─────────────────────────────────────────────────────────────────────
export const DeleteMediaParams = z.object({ filename: z.string() });
