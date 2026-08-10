import { z } from "zod";
export declare const CreateCustomerBody: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    phone: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    company: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    password: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    email: string;
    phone?: string | null | undefined;
    company?: string | null | undefined;
    password?: string | undefined;
}, {
    name: string;
    email: string;
    phone?: string | null | undefined;
    company?: string | null | undefined;
    password?: string | undefined;
}>;
export declare const UpdateCustomerBody: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    company: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    password: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    email?: string | undefined;
    phone?: string | null | undefined;
    company?: string | null | undefined;
    password?: string | undefined;
}, {
    name?: string | undefined;
    email?: string | undefined;
    phone?: string | null | undefined;
    company?: string | null | undefined;
    password?: string | undefined;
}>;
export declare const UpdateCustomerParams: z.ZodObject<{
    id: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    id: number;
}, {
    id: number;
}>;
export declare const DeleteCustomerParams: z.ZodObject<{
    id: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    id: number;
}, {
    id: number;
}>;
export declare const PortalLoginBody: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const CreateOrderBody: z.ZodObject<{
    customerId: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    status: z.ZodOptional<z.ZodString>;
    items: z.ZodOptional<z.ZodArray<z.ZodAny, "many">>;
    total: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    notes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    status?: string | undefined;
    customerId?: number | null | undefined;
    items?: any[] | undefined;
    total?: string | null | undefined;
    notes?: string | null | undefined;
}, {
    status?: string | undefined;
    customerId?: number | null | undefined;
    items?: any[] | undefined;
    total?: string | null | undefined;
    notes?: string | null | undefined;
}>;
export declare const UpdateOrderBody: z.ZodObject<{
    customerId: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
    status: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    items: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodAny, "many">>>;
    total: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    notes: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
}, "strip", z.ZodTypeAny, {
    status?: string | undefined;
    customerId?: number | null | undefined;
    items?: any[] | undefined;
    total?: string | null | undefined;
    notes?: string | null | undefined;
}, {
    status?: string | undefined;
    customerId?: number | null | undefined;
    items?: any[] | undefined;
    total?: string | null | undefined;
    notes?: string | null | undefined;
}>;
export declare const UpdateOrderParams: z.ZodObject<{
    id: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    id: number;
}, {
    id: number;
}>;
export declare const CreateInvoiceBody: z.ZodObject<{
    orderId: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    customerId: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    items: z.ZodOptional<z.ZodArray<z.ZodAny, "many">>;
    total: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    status: z.ZodOptional<z.ZodString>;
    dueDate: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    status?: string | undefined;
    customerId?: number | null | undefined;
    items?: any[] | undefined;
    total?: string | null | undefined;
    orderId?: number | null | undefined;
    dueDate?: string | null | undefined;
}, {
    status?: string | undefined;
    customerId?: number | null | undefined;
    items?: any[] | undefined;
    total?: string | null | undefined;
    orderId?: number | null | undefined;
    dueDate?: string | null | undefined;
}>;
export declare const UpdateInvoiceBody: z.ZodObject<{
    orderId: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
    customerId: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
    items: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodAny, "many">>>;
    total: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    status: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    dueDate: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
}, "strip", z.ZodTypeAny, {
    status?: string | undefined;
    customerId?: number | null | undefined;
    items?: any[] | undefined;
    total?: string | null | undefined;
    orderId?: number | null | undefined;
    dueDate?: string | null | undefined;
}, {
    status?: string | undefined;
    customerId?: number | null | undefined;
    items?: any[] | undefined;
    total?: string | null | undefined;
    orderId?: number | null | undefined;
    dueDate?: string | null | undefined;
}>;
export declare const UpdateInvoiceParams: z.ZodObject<{
    id: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    id: number;
}, {
    id: number;
}>;
export declare const CreateUserBody: z.ZodObject<{
    username: z.ZodString;
    email: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    role: z.ZodOptional<z.ZodString>;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    password: string;
    username: string;
    email?: string | null | undefined;
    role?: string | undefined;
}, {
    password: string;
    username: string;
    email?: string | null | undefined;
    role?: string | undefined;
}>;
export declare const UpdateUserBody: z.ZodObject<{
    username: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    role: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    password: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email?: string | null | undefined;
    password?: string | undefined;
    username?: string | undefined;
    role?: string | undefined;
}, {
    email?: string | null | undefined;
    password?: string | undefined;
    username?: string | undefined;
    role?: string | undefined;
}>;
export declare const UpdateUserParams: z.ZodObject<{
    id: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    id: number;
}, {
    id: number;
}>;
export declare const DeleteUserParams: z.ZodObject<{
    id: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    id: number;
}, {
    id: number;
}>;
export declare const DeleteMediaParams: z.ZodObject<{
    filename: z.ZodString;
}, "strip", z.ZodTypeAny, {
    filename: string;
}, {
    filename: string;
}>;
//# sourceMappingURL=extra-validators.d.ts.map