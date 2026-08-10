import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { AdminListProductsParams, AdminLoginInput, AdminLoginResponse, AdminStats, AdminUser, Banner, BannerInput, BannerUpdate, BlogPost, BlogPostInput, BlogPostUpdate, Category, CategoryInput, CategoryUpdate, CategoryWithProducts, HealthStatus, Lead, ListBlogPostsParams, ListProductsParams, Page, PageInput, Product, ProductInput, ProductUpdate, Quote, SiteSettings, StatusUpdate, SubmitContactInput, SubmitQuoteInput, SuccessResponse } from './api.schemas';
import { customFetch } from '../custom-fetch';
import type { ErrorType, BodyType } from '../custom-fetch';
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
export declare const getHealthCheckUrl: () => string;
/**
 * @summary Health check
 */
export declare const healthCheck: (options?: Parameters<typeof customFetch>[1]) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListProductsUrl: (params?: ListProductsParams) => string;
/**
 * @summary List products
 */
export declare const listProducts: (params?: ListProductsParams, options?: Parameters<typeof customFetch>[1]) => Promise<Product[]>;
export declare const getListProductsQueryKey: (params?: ListProductsParams) => readonly ["/api/products", ...ListProductsParams[]];
export declare const getListProductsQueryOptions: <TData = Awaited<ReturnType<typeof listProducts>>, TError = ErrorType<unknown>>(params?: ListProductsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listProducts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listProducts>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListProductsQueryResult = NonNullable<Awaited<ReturnType<typeof listProducts>>>;
export type ListProductsQueryError = ErrorType<unknown>;
/**
 * @summary List products
 */
export declare function useListProducts<TData = Awaited<ReturnType<typeof listProducts>>, TError = ErrorType<unknown>>(params?: ListProductsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listProducts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetFeaturedProductsUrl: () => string;
/**
 * @summary Get featured products
 */
export declare const getFeaturedProducts: (options?: Parameters<typeof customFetch>[1]) => Promise<Product[]>;
export declare const getGetFeaturedProductsQueryKey: () => readonly ["/api/products/featured"];
export declare const getGetFeaturedProductsQueryOptions: <TData = Awaited<ReturnType<typeof getFeaturedProducts>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getFeaturedProducts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getFeaturedProducts>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetFeaturedProductsQueryResult = NonNullable<Awaited<ReturnType<typeof getFeaturedProducts>>>;
export type GetFeaturedProductsQueryError = ErrorType<unknown>;
/**
 * @summary Get featured products
 */
export declare function useGetFeaturedProducts<TData = Awaited<ReturnType<typeof getFeaturedProducts>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getFeaturedProducts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetProductUrl: (slug: string) => string;
/**
 * @summary Get product by slug
 */
export declare const getProduct: (slug: string, options?: Parameters<typeof customFetch>[1]) => Promise<Product>;
export declare const getGetProductQueryKey: (slug: string) => readonly [`/api/products/${string}`];
export declare const getGetProductQueryOptions: <TData = Awaited<ReturnType<typeof getProduct>>, TError = ErrorType<void>>(slug: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getProduct>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getProduct>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetProductQueryResult = NonNullable<Awaited<ReturnType<typeof getProduct>>>;
export type GetProductQueryError = ErrorType<void>;
/**
 * @summary Get product by slug
 */
export declare function useGetProduct<TData = Awaited<ReturnType<typeof getProduct>>, TError = ErrorType<void>>(slug: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getProduct>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListCategoriesUrl: () => string;
/**
 * @summary List categories
 */
export declare const listCategories: (options?: Parameters<typeof customFetch>[1]) => Promise<Category[]>;
export declare const getListCategoriesQueryKey: () => readonly ["/api/categories"];
export declare const getListCategoriesQueryOptions: <TData = Awaited<ReturnType<typeof listCategories>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listCategories>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listCategories>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListCategoriesQueryResult = NonNullable<Awaited<ReturnType<typeof listCategories>>>;
export type ListCategoriesQueryError = ErrorType<unknown>;
/**
 * @summary List categories
 */
export declare function useListCategories<TData = Awaited<ReturnType<typeof listCategories>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listCategories>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetCategoryUrl: (slug: string) => string;
/**
 * @summary Get category by slug
 */
export declare const getCategory: (slug: string, options?: Parameters<typeof customFetch>[1]) => Promise<CategoryWithProducts>;
export declare const getGetCategoryQueryKey: (slug: string) => readonly [`/api/categories/${string}`];
export declare const getGetCategoryQueryOptions: <TData = Awaited<ReturnType<typeof getCategory>>, TError = ErrorType<void>>(slug: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCategory>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getCategory>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetCategoryQueryResult = NonNullable<Awaited<ReturnType<typeof getCategory>>>;
export type GetCategoryQueryError = ErrorType<void>;
/**
 * @summary Get category by slug
 */
export declare function useGetCategory<TData = Awaited<ReturnType<typeof getCategory>>, TError = ErrorType<void>>(slug: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCategory>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListBlogPostsUrl: (params?: ListBlogPostsParams) => string;
/**
 * @summary List blog posts
 */
export declare const listBlogPosts: (params?: ListBlogPostsParams, options?: Parameters<typeof customFetch>[1]) => Promise<BlogPost[]>;
export declare const getListBlogPostsQueryKey: (params?: ListBlogPostsParams) => readonly ["/api/blog", ...ListBlogPostsParams[]];
export declare const getListBlogPostsQueryOptions: <TData = Awaited<ReturnType<typeof listBlogPosts>>, TError = ErrorType<unknown>>(params?: ListBlogPostsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listBlogPosts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listBlogPosts>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListBlogPostsQueryResult = NonNullable<Awaited<ReturnType<typeof listBlogPosts>>>;
export type ListBlogPostsQueryError = ErrorType<unknown>;
/**
 * @summary List blog posts
 */
export declare function useListBlogPosts<TData = Awaited<ReturnType<typeof listBlogPosts>>, TError = ErrorType<unknown>>(params?: ListBlogPostsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listBlogPosts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetBlogPostUrl: (slug: string) => string;
/**
 * @summary Get blog post by slug
 */
export declare const getBlogPost: (slug: string, options?: Parameters<typeof customFetch>[1]) => Promise<BlogPost>;
export declare const getGetBlogPostQueryKey: (slug: string) => readonly [`/api/blog/${string}`];
export declare const getGetBlogPostQueryOptions: <TData = Awaited<ReturnType<typeof getBlogPost>>, TError = ErrorType<void>>(slug: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getBlogPost>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getBlogPost>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetBlogPostQueryResult = NonNullable<Awaited<ReturnType<typeof getBlogPost>>>;
export type GetBlogPostQueryError = ErrorType<void>;
/**
 * @summary Get blog post by slug
 */
export declare function useGetBlogPost<TData = Awaited<ReturnType<typeof getBlogPost>>, TError = ErrorType<void>>(slug: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getBlogPost>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetPageUrl: (slug: string) => string;
/**
 * @summary Get page by slug
 */
export declare const getPage: (slug: string, options?: Parameters<typeof customFetch>[1]) => Promise<Page>;
export declare const getGetPageQueryKey: (slug: string) => readonly [`/api/pages/${string}`];
export declare const getGetPageQueryOptions: <TData = Awaited<ReturnType<typeof getPage>>, TError = ErrorType<void>>(slug: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPage>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getPage>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetPageQueryResult = NonNullable<Awaited<ReturnType<typeof getPage>>>;
export type GetPageQueryError = ErrorType<void>;
/**
 * @summary Get page by slug
 */
export declare function useGetPage<TData = Awaited<ReturnType<typeof getPage>>, TError = ErrorType<void>>(slug: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPage>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getSubmitQuoteUrl: () => string;
/**
 * @summary Submit a quote request
 */
export declare const submitQuote: (submitQuoteInput: SubmitQuoteInput, options?: Parameters<typeof customFetch>[1]) => Promise<SuccessResponse>;
export declare const getSubmitQuoteMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof submitQuote>>, TError, {
        data: BodyType<SubmitQuoteInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof submitQuote>>, TError, {
    data: BodyType<SubmitQuoteInput>;
}, TContext>;
export type SubmitQuoteMutationResult = NonNullable<Awaited<ReturnType<typeof submitQuote>>>;
export type SubmitQuoteMutationBody = BodyType<SubmitQuoteInput>;
export type SubmitQuoteMutationError = ErrorType<unknown>;
/**
* @summary Submit a quote request
*/
export declare const useSubmitQuote: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof submitQuote>>, TError, {
        data: BodyType<SubmitQuoteInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof submitQuote>>, TError, {
    data: BodyType<SubmitQuoteInput>;
}, TContext>;
export declare const getSubmitContactUrl: () => string;
/**
 * @summary Submit a contact message
 */
export declare const submitContact: (submitContactInput: SubmitContactInput, options?: Parameters<typeof customFetch>[1]) => Promise<SuccessResponse>;
export declare const getSubmitContactMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof submitContact>>, TError, {
        data: BodyType<SubmitContactInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof submitContact>>, TError, {
    data: BodyType<SubmitContactInput>;
}, TContext>;
export type SubmitContactMutationResult = NonNullable<Awaited<ReturnType<typeof submitContact>>>;
export type SubmitContactMutationBody = BodyType<SubmitContactInput>;
export type SubmitContactMutationError = ErrorType<unknown>;
/**
* @summary Submit a contact message
*/
export declare const useSubmitContact: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof submitContact>>, TError, {
        data: BodyType<SubmitContactInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof submitContact>>, TError, {
    data: BodyType<SubmitContactInput>;
}, TContext>;
export declare const getAdminLoginUrl: () => string;
/**
 * @summary Admin login
 */
export declare const adminLogin: (adminLoginInput: AdminLoginInput, options?: Parameters<typeof customFetch>[1]) => Promise<AdminLoginResponse>;
export declare const getAdminLoginMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminLogin>>, TError, {
        data: BodyType<AdminLoginInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof adminLogin>>, TError, {
    data: BodyType<AdminLoginInput>;
}, TContext>;
export type AdminLoginMutationResult = NonNullable<Awaited<ReturnType<typeof adminLogin>>>;
export type AdminLoginMutationBody = BodyType<AdminLoginInput>;
export type AdminLoginMutationError = ErrorType<void>;
/**
* @summary Admin login
*/
export declare const useAdminLogin: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminLogin>>, TError, {
        data: BodyType<AdminLoginInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof adminLogin>>, TError, {
    data: BodyType<AdminLoginInput>;
}, TContext>;
export declare const getAdminLogoutUrl: () => string;
/**
 * @summary Admin logout
 */
export declare const adminLogout: (options?: Parameters<typeof customFetch>[1]) => Promise<SuccessResponse>;
export declare const getAdminLogoutMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminLogout>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof adminLogout>>, TError, void, TContext>;
export type AdminLogoutMutationResult = NonNullable<Awaited<ReturnType<typeof adminLogout>>>;
export type AdminLogoutMutationError = ErrorType<unknown>;
/**
* @summary Admin logout
*/
export declare const useAdminLogout: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminLogout>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof adminLogout>>, TError, void, TContext>;
export declare const getGetAdminMeUrl: () => string;
/**
 * @summary Get current admin user
 */
export declare const getAdminMe: (options?: Parameters<typeof customFetch>[1]) => Promise<AdminUser>;
export declare const getGetAdminMeQueryKey: () => readonly ["/api/admin/me"];
export declare const getGetAdminMeQueryOptions: <TData = Awaited<ReturnType<typeof getAdminMe>>, TError = ErrorType<void>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAdminMe>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getAdminMe>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetAdminMeQueryResult = NonNullable<Awaited<ReturnType<typeof getAdminMe>>>;
export type GetAdminMeQueryError = ErrorType<void>;
/**
 * @summary Get current admin user
 */
export declare function useGetAdminMe<TData = Awaited<ReturnType<typeof getAdminMe>>, TError = ErrorType<void>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAdminMe>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetAdminStatsUrl: () => string;
/**
 * @summary Get admin dashboard stats
 */
export declare const getAdminStats: (options?: Parameters<typeof customFetch>[1]) => Promise<AdminStats>;
export declare const getGetAdminStatsQueryKey: () => readonly ["/api/admin/stats"];
export declare const getGetAdminStatsQueryOptions: <TData = Awaited<ReturnType<typeof getAdminStats>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAdminStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getAdminStats>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetAdminStatsQueryResult = NonNullable<Awaited<ReturnType<typeof getAdminStats>>>;
export type GetAdminStatsQueryError = ErrorType<unknown>;
/**
 * @summary Get admin dashboard stats
 */
export declare function useGetAdminStats<TData = Awaited<ReturnType<typeof getAdminStats>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAdminStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListLeadsUrl: () => string;
/**
 * @summary List all leads
 */
export declare const listLeads: (options?: Parameters<typeof customFetch>[1]) => Promise<Lead[]>;
export declare const getListLeadsQueryKey: () => readonly ["/api/admin/leads"];
export declare const getListLeadsQueryOptions: <TData = Awaited<ReturnType<typeof listLeads>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listLeads>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listLeads>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListLeadsQueryResult = NonNullable<Awaited<ReturnType<typeof listLeads>>>;
export type ListLeadsQueryError = ErrorType<unknown>;
/**
 * @summary List all leads
 */
export declare function useListLeads<TData = Awaited<ReturnType<typeof listLeads>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listLeads>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListQuotesUrl: () => string;
/**
 * @summary List all quotes
 */
export declare const listQuotes: (options?: Parameters<typeof customFetch>[1]) => Promise<Quote[]>;
export declare const getListQuotesQueryKey: () => readonly ["/api/admin/quotes"];
export declare const getListQuotesQueryOptions: <TData = Awaited<ReturnType<typeof listQuotes>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listQuotes>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listQuotes>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListQuotesQueryResult = NonNullable<Awaited<ReturnType<typeof listQuotes>>>;
export type ListQuotesQueryError = ErrorType<unknown>;
/**
 * @summary List all quotes
 */
export declare function useListQuotes<TData = Awaited<ReturnType<typeof listQuotes>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listQuotes>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getAdminListPagesUrl: () => string;
/**
 * @summary List all pages (admin)
 */
export declare const adminListPages: (options?: Parameters<typeof customFetch>[1]) => Promise<Page[]>;
export declare const getAdminListPagesQueryKey: () => readonly ["/api/admin/pages"];
export declare const getAdminListPagesQueryOptions: <TData = Awaited<ReturnType<typeof adminListPages>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof adminListPages>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof adminListPages>>, TError, TData> & {
    queryKey: QueryKey;
};
export type AdminListPagesQueryResult = NonNullable<Awaited<ReturnType<typeof adminListPages>>>;
export type AdminListPagesQueryError = ErrorType<unknown>;
/**
 * @summary List all pages (admin)
 */
export declare function useAdminListPages<TData = Awaited<ReturnType<typeof adminListPages>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof adminListPages>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreatePageUrl: () => string;
/**
 * @summary Create a page
 */
export declare const createPage: (pageInput: PageInput, options?: Parameters<typeof customFetch>[1]) => Promise<Page>;
export declare const getCreatePageMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createPage>>, TError, {
        data: BodyType<PageInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createPage>>, TError, {
    data: BodyType<PageInput>;
}, TContext>;
export type CreatePageMutationResult = NonNullable<Awaited<ReturnType<typeof createPage>>>;
export type CreatePageMutationBody = BodyType<PageInput>;
export type CreatePageMutationError = ErrorType<unknown>;
/**
* @summary Create a page
*/
export declare const useCreatePage: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createPage>>, TError, {
        data: BodyType<PageInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createPage>>, TError, {
    data: BodyType<PageInput>;
}, TContext>;
export declare const getUpdatePageUrl: (id: number) => string;
/**
 * @summary Update a page
 */
export declare const updatePage: (id: number, pageInput: PageInput, options?: Parameters<typeof customFetch>[1]) => Promise<Page>;
export declare const getUpdatePageMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updatePage>>, TError, {
        id: number;
        data: BodyType<PageInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updatePage>>, TError, {
    id: number;
    data: BodyType<PageInput>;
}, TContext>;
export type UpdatePageMutationResult = NonNullable<Awaited<ReturnType<typeof updatePage>>>;
export type UpdatePageMutationBody = BodyType<PageInput>;
export type UpdatePageMutationError = ErrorType<unknown>;
/**
* @summary Update a page
*/
export declare const useUpdatePage: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updatePage>>, TError, {
        id: number;
        data: BodyType<PageInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updatePage>>, TError, {
    id: number;
    data: BodyType<PageInput>;
}, TContext>;
export declare const getAdminListBannersUrl: () => string;
/**
 * @summary List all banners (admin)
 */
export declare const adminListBanners: (options?: Parameters<typeof customFetch>[1]) => Promise<Banner[]>;
export declare const getAdminListBannersQueryKey: () => readonly ["/api/admin/banners"];
export declare const getAdminListBannersQueryOptions: <TData = Awaited<ReturnType<typeof adminListBanners>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof adminListBanners>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof adminListBanners>>, TError, TData> & {
    queryKey: QueryKey;
};
export type AdminListBannersQueryResult = NonNullable<Awaited<ReturnType<typeof adminListBanners>>>;
export type AdminListBannersQueryError = ErrorType<unknown>;
/**
 * @summary List all banners (admin)
 */
export declare function useAdminListBanners<TData = Awaited<ReturnType<typeof adminListBanners>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof adminListBanners>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateBannerUrl: () => string;
/**
 * @summary Create a banner
 */
export declare const createBanner: (bannerInput: BannerInput, options?: Parameters<typeof customFetch>[1]) => Promise<Banner>;
export declare const getCreateBannerMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createBanner>>, TError, {
        data: BodyType<BannerInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createBanner>>, TError, {
    data: BodyType<BannerInput>;
}, TContext>;
export type CreateBannerMutationResult = NonNullable<Awaited<ReturnType<typeof createBanner>>>;
export type CreateBannerMutationBody = BodyType<BannerInput>;
export type CreateBannerMutationError = ErrorType<unknown>;
/**
* @summary Create a banner
*/
export declare const useCreateBanner: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createBanner>>, TError, {
        data: BodyType<BannerInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createBanner>>, TError, {
    data: BodyType<BannerInput>;
}, TContext>;
export declare const getUpdateBannerUrl: (id: number) => string;
/**
 * @summary Update a banner
 */
export declare const updateBanner: (id: number, bannerUpdate: BannerUpdate, options?: Parameters<typeof customFetch>[1]) => Promise<Banner>;
export declare const getUpdateBannerMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateBanner>>, TError, {
        id: number;
        data: BodyType<BannerUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateBanner>>, TError, {
    id: number;
    data: BodyType<BannerUpdate>;
}, TContext>;
export type UpdateBannerMutationResult = NonNullable<Awaited<ReturnType<typeof updateBanner>>>;
export type UpdateBannerMutationBody = BodyType<BannerUpdate>;
export type UpdateBannerMutationError = ErrorType<unknown>;
/**
* @summary Update a banner
*/
export declare const useUpdateBanner: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateBanner>>, TError, {
        id: number;
        data: BodyType<BannerUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateBanner>>, TError, {
    id: number;
    data: BodyType<BannerUpdate>;
}, TContext>;
export declare const getDeleteBannerUrl: (id: number) => string;
/**
 * @summary Delete a banner
 */
export declare const deleteBanner: (id: number, options?: Parameters<typeof customFetch>[1]) => Promise<SuccessResponse>;
export declare const getDeleteBannerMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteBanner>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteBanner>>, TError, {
    id: number;
}, TContext>;
export type DeleteBannerMutationResult = NonNullable<Awaited<ReturnType<typeof deleteBanner>>>;
export type DeleteBannerMutationError = ErrorType<unknown>;
/**
* @summary Delete a banner
*/
export declare const useDeleteBanner: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteBanner>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteBanner>>, TError, {
    id: number;
}, TContext>;
export declare const getAdminListBlogPostsUrl: () => string;
/**
 * @summary List all blog posts (admin)
 */
export declare const adminListBlogPosts: (options?: Parameters<typeof customFetch>[1]) => Promise<BlogPost[]>;
export declare const getAdminListBlogPostsQueryKey: () => readonly ["/api/admin/blog"];
export declare const getAdminListBlogPostsQueryOptions: <TData = Awaited<ReturnType<typeof adminListBlogPosts>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof adminListBlogPosts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof adminListBlogPosts>>, TError, TData> & {
    queryKey: QueryKey;
};
export type AdminListBlogPostsQueryResult = NonNullable<Awaited<ReturnType<typeof adminListBlogPosts>>>;
export type AdminListBlogPostsQueryError = ErrorType<unknown>;
/**
 * @summary List all blog posts (admin)
 */
export declare function useAdminListBlogPosts<TData = Awaited<ReturnType<typeof adminListBlogPosts>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof adminListBlogPosts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateBlogPostUrl: () => string;
/**
 * @summary Create a blog post
 */
export declare const createBlogPost: (blogPostInput: BlogPostInput, options?: Parameters<typeof customFetch>[1]) => Promise<BlogPost>;
export declare const getCreateBlogPostMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createBlogPost>>, TError, {
        data: BodyType<BlogPostInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createBlogPost>>, TError, {
    data: BodyType<BlogPostInput>;
}, TContext>;
export type CreateBlogPostMutationResult = NonNullable<Awaited<ReturnType<typeof createBlogPost>>>;
export type CreateBlogPostMutationBody = BodyType<BlogPostInput>;
export type CreateBlogPostMutationError = ErrorType<unknown>;
/**
* @summary Create a blog post
*/
export declare const useCreateBlogPost: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createBlogPost>>, TError, {
        data: BodyType<BlogPostInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createBlogPost>>, TError, {
    data: BodyType<BlogPostInput>;
}, TContext>;
export declare const getUpdateBlogPostUrl: (id: number) => string;
/**
 * @summary Update a blog post
 */
export declare const updateBlogPost: (id: number, blogPostUpdate: BlogPostUpdate, options?: Parameters<typeof customFetch>[1]) => Promise<BlogPost>;
export declare const getUpdateBlogPostMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateBlogPost>>, TError, {
        id: number;
        data: BodyType<BlogPostUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateBlogPost>>, TError, {
    id: number;
    data: BodyType<BlogPostUpdate>;
}, TContext>;
export type UpdateBlogPostMutationResult = NonNullable<Awaited<ReturnType<typeof updateBlogPost>>>;
export type UpdateBlogPostMutationBody = BodyType<BlogPostUpdate>;
export type UpdateBlogPostMutationError = ErrorType<unknown>;
/**
* @summary Update a blog post
*/
export declare const useUpdateBlogPost: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateBlogPost>>, TError, {
        id: number;
        data: BodyType<BlogPostUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateBlogPost>>, TError, {
    id: number;
    data: BodyType<BlogPostUpdate>;
}, TContext>;
export declare const getDeleteBlogPostUrl: (id: number) => string;
/**
 * @summary Delete a blog post
 */
export declare const deleteBlogPost: (id: number, options?: Parameters<typeof customFetch>[1]) => Promise<SuccessResponse>;
export declare const getDeleteBlogPostMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteBlogPost>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteBlogPost>>, TError, {
    id: number;
}, TContext>;
export type DeleteBlogPostMutationResult = NonNullable<Awaited<ReturnType<typeof deleteBlogPost>>>;
export type DeleteBlogPostMutationError = ErrorType<unknown>;
/**
* @summary Delete a blog post
*/
export declare const useDeleteBlogPost: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteBlogPost>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteBlogPost>>, TError, {
    id: number;
}, TContext>;
export declare const getAdminListCategoriesUrl: () => string;
/**
 * @summary List all categories (admin)
 */
export declare const adminListCategories: (options?: Parameters<typeof customFetch>[1]) => Promise<Category[]>;
export declare const getAdminListCategoriesQueryKey: () => readonly ["/api/admin/categories"];
export declare const getAdminListCategoriesQueryOptions: <TData = Awaited<ReturnType<typeof adminListCategories>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof adminListCategories>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof adminListCategories>>, TError, TData> & {
    queryKey: QueryKey;
};
export type AdminListCategoriesQueryResult = NonNullable<Awaited<ReturnType<typeof adminListCategories>>>;
export type AdminListCategoriesQueryError = ErrorType<unknown>;
/**
 * @summary List all categories (admin)
 */
export declare function useAdminListCategories<TData = Awaited<ReturnType<typeof adminListCategories>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof adminListCategories>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateCategoryUrl: () => string;
/**
 * @summary Create a category
 */
export declare const createCategory: (categoryInput: CategoryInput, options?: Parameters<typeof customFetch>[1]) => Promise<Category>;
export declare const getCreateCategoryMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createCategory>>, TError, {
        data: BodyType<CategoryInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createCategory>>, TError, {
    data: BodyType<CategoryInput>;
}, TContext>;
export type CreateCategoryMutationResult = NonNullable<Awaited<ReturnType<typeof createCategory>>>;
export type CreateCategoryMutationBody = BodyType<CategoryInput>;
export type CreateCategoryMutationError = ErrorType<unknown>;
/**
* @summary Create a category
*/
export declare const useCreateCategory: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createCategory>>, TError, {
        data: BodyType<CategoryInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createCategory>>, TError, {
    data: BodyType<CategoryInput>;
}, TContext>;
export declare const getUpdateCategoryUrl: (id: number) => string;
/**
 * @summary Update a category
 */
export declare const updateCategory: (id: number, categoryUpdate: CategoryUpdate, options?: Parameters<typeof customFetch>[1]) => Promise<Category>;
export declare const getUpdateCategoryMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateCategory>>, TError, {
        id: number;
        data: BodyType<CategoryUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateCategory>>, TError, {
    id: number;
    data: BodyType<CategoryUpdate>;
}, TContext>;
export type UpdateCategoryMutationResult = NonNullable<Awaited<ReturnType<typeof updateCategory>>>;
export type UpdateCategoryMutationBody = BodyType<CategoryUpdate>;
export type UpdateCategoryMutationError = ErrorType<unknown>;
/**
* @summary Update a category
*/
export declare const useUpdateCategory: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateCategory>>, TError, {
        id: number;
        data: BodyType<CategoryUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateCategory>>, TError, {
    id: number;
    data: BodyType<CategoryUpdate>;
}, TContext>;
export declare const getDeleteCategoryUrl: (id: number) => string;
/**
 * @summary Delete a category
 */
export declare const deleteCategory: (id: number, options?: Parameters<typeof customFetch>[1]) => Promise<SuccessResponse>;
export declare const getDeleteCategoryMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteCategory>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteCategory>>, TError, {
    id: number;
}, TContext>;
export type DeleteCategoryMutationResult = NonNullable<Awaited<ReturnType<typeof deleteCategory>>>;
export type DeleteCategoryMutationError = ErrorType<unknown>;
/**
* @summary Delete a category
*/
export declare const useDeleteCategory: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteCategory>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteCategory>>, TError, {
    id: number;
}, TContext>;
export declare const getAdminListProductsUrl: (params?: AdminListProductsParams) => string;
/**
 * @summary List all products (admin)
 */
export declare const adminListProducts: (params?: AdminListProductsParams, options?: Parameters<typeof customFetch>[1]) => Promise<Product[]>;
export declare const getAdminListProductsQueryKey: (params?: AdminListProductsParams) => readonly ["/api/admin/products", ...AdminListProductsParams[]];
export declare const getAdminListProductsQueryOptions: <TData = Awaited<ReturnType<typeof adminListProducts>>, TError = ErrorType<unknown>>(params?: AdminListProductsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof adminListProducts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof adminListProducts>>, TError, TData> & {
    queryKey: QueryKey;
};
export type AdminListProductsQueryResult = NonNullable<Awaited<ReturnType<typeof adminListProducts>>>;
export type AdminListProductsQueryError = ErrorType<unknown>;
/**
 * @summary List all products (admin)
 */
export declare function useAdminListProducts<TData = Awaited<ReturnType<typeof adminListProducts>>, TError = ErrorType<unknown>>(params?: AdminListProductsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof adminListProducts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateProductUrl: () => string;
/**
 * @summary Create a product
 */
export declare const createProduct: (productInput: ProductInput, options?: Parameters<typeof customFetch>[1]) => Promise<Product>;
export declare const getCreateProductMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createProduct>>, TError, {
        data: BodyType<ProductInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createProduct>>, TError, {
    data: BodyType<ProductInput>;
}, TContext>;
export type CreateProductMutationResult = NonNullable<Awaited<ReturnType<typeof createProduct>>>;
export type CreateProductMutationBody = BodyType<ProductInput>;
export type CreateProductMutationError = ErrorType<unknown>;
/**
* @summary Create a product
*/
export declare const useCreateProduct: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createProduct>>, TError, {
        data: BodyType<ProductInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createProduct>>, TError, {
    data: BodyType<ProductInput>;
}, TContext>;
export declare const getGetAdminProductUrl: (id: number) => string;
/**
 * @summary Get product by ID (admin)
 */
export declare const getAdminProduct: (id: number, options?: Parameters<typeof customFetch>[1]) => Promise<Product>;
export declare const getGetAdminProductQueryKey: (id: number) => readonly [`/api/admin/products/${number}`];
export declare const getGetAdminProductQueryOptions: <TData = Awaited<ReturnType<typeof getAdminProduct>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAdminProduct>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getAdminProduct>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetAdminProductQueryResult = NonNullable<Awaited<ReturnType<typeof getAdminProduct>>>;
export type GetAdminProductQueryError = ErrorType<unknown>;
/**
 * @summary Get product by ID (admin)
 */
export declare function useGetAdminProduct<TData = Awaited<ReturnType<typeof getAdminProduct>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAdminProduct>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateProductUrl: (id: number) => string;
/**
 * @summary Update a product
 */
export declare const updateProduct: (id: number, productUpdate: ProductUpdate, options?: Parameters<typeof customFetch>[1]) => Promise<Product>;
export declare const getUpdateProductMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateProduct>>, TError, {
        id: number;
        data: BodyType<ProductUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateProduct>>, TError, {
    id: number;
    data: BodyType<ProductUpdate>;
}, TContext>;
export type UpdateProductMutationResult = NonNullable<Awaited<ReturnType<typeof updateProduct>>>;
export type UpdateProductMutationBody = BodyType<ProductUpdate>;
export type UpdateProductMutationError = ErrorType<unknown>;
/**
* @summary Update a product
*/
export declare const useUpdateProduct: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateProduct>>, TError, {
        id: number;
        data: BodyType<ProductUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateProduct>>, TError, {
    id: number;
    data: BodyType<ProductUpdate>;
}, TContext>;
export declare const getDeleteProductUrl: (id: number) => string;
/**
 * @summary Delete a product
 */
export declare const deleteProduct: (id: number, options?: Parameters<typeof customFetch>[1]) => Promise<SuccessResponse>;
export declare const getDeleteProductMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteProduct>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteProduct>>, TError, {
    id: number;
}, TContext>;
export type DeleteProductMutationResult = NonNullable<Awaited<ReturnType<typeof deleteProduct>>>;
export type DeleteProductMutationError = ErrorType<unknown>;
/**
* @summary Delete a product
*/
export declare const useDeleteProduct: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteProduct>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteProduct>>, TError, {
    id: number;
}, TContext>;
export declare const getUpdateLeadStatusUrl: (id: number) => string;
/**
 * @summary Update lead status
 */
export declare const updateLeadStatus: (id: number, statusUpdate: StatusUpdate, options?: Parameters<typeof customFetch>[1]) => Promise<SuccessResponse>;
export declare const getUpdateLeadStatusMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateLeadStatus>>, TError, {
        id: number;
        data: BodyType<StatusUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateLeadStatus>>, TError, {
    id: number;
    data: BodyType<StatusUpdate>;
}, TContext>;
export type UpdateLeadStatusMutationResult = NonNullable<Awaited<ReturnType<typeof updateLeadStatus>>>;
export type UpdateLeadStatusMutationBody = BodyType<StatusUpdate>;
export type UpdateLeadStatusMutationError = ErrorType<unknown>;
/**
* @summary Update lead status
*/
export declare const useUpdateLeadStatus: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateLeadStatus>>, TError, {
        id: number;
        data: BodyType<StatusUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateLeadStatus>>, TError, {
    id: number;
    data: BodyType<StatusUpdate>;
}, TContext>;
export declare const getUpdateQuoteStatusUrl: (id: number) => string;
/**
 * @summary Update quote status
 */
export declare const updateQuoteStatus: (id: number, statusUpdate: StatusUpdate, options?: Parameters<typeof customFetch>[1]) => Promise<SuccessResponse>;
export declare const getUpdateQuoteStatusMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateQuoteStatus>>, TError, {
        id: number;
        data: BodyType<StatusUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateQuoteStatus>>, TError, {
    id: number;
    data: BodyType<StatusUpdate>;
}, TContext>;
export type UpdateQuoteStatusMutationResult = NonNullable<Awaited<ReturnType<typeof updateQuoteStatus>>>;
export type UpdateQuoteStatusMutationBody = BodyType<StatusUpdate>;
export type UpdateQuoteStatusMutationError = ErrorType<unknown>;
/**
* @summary Update quote status
*/
export declare const useUpdateQuoteStatus: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateQuoteStatus>>, TError, {
        id: number;
        data: BodyType<StatusUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateQuoteStatus>>, TError, {
    id: number;
    data: BodyType<StatusUpdate>;
}, TContext>;
export declare const getGetAdminSettingsUrl: () => string;
/**
 * @summary Get site settings
 */
export declare const getAdminSettings: (options?: Parameters<typeof customFetch>[1]) => Promise<SiteSettings>;
export declare const getGetAdminSettingsQueryKey: () => readonly ["/api/admin/settings"];
export declare const getGetAdminSettingsQueryOptions: <TData = Awaited<ReturnType<typeof getAdminSettings>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAdminSettings>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getAdminSettings>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetAdminSettingsQueryResult = NonNullable<Awaited<ReturnType<typeof getAdminSettings>>>;
export type GetAdminSettingsQueryError = ErrorType<unknown>;
/**
 * @summary Get site settings
 */
export declare function useGetAdminSettings<TData = Awaited<ReturnType<typeof getAdminSettings>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAdminSettings>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateSettingsUrl: () => string;
/**
 * @summary Update site settings
 */
export declare const updateSettings: (siteSettings: SiteSettings, options?: Parameters<typeof customFetch>[1]) => Promise<SiteSettings>;
export declare const getUpdateSettingsMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateSettings>>, TError, {
        data: BodyType<SiteSettings>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateSettings>>, TError, {
    data: BodyType<SiteSettings>;
}, TContext>;
export type UpdateSettingsMutationResult = NonNullable<Awaited<ReturnType<typeof updateSettings>>>;
export type UpdateSettingsMutationBody = BodyType<SiteSettings>;
export type UpdateSettingsMutationError = ErrorType<unknown>;
/**
* @summary Update site settings
*/
export declare const useUpdateSettings: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateSettings>>, TError, {
        data: BodyType<SiteSettings>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateSettings>>, TError, {
    data: BodyType<SiteSettings>;
}, TContext>;
export {};
//# sourceMappingURL=api.d.ts.map