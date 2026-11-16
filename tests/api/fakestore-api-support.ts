import { expect, type APIResponse } from '@playwright/test';
import path from 'path';
import { Routes } from '../../api/endpoints/routes';
import { DataProvider } from '../../utils/DataReader';

export const PRODUCT_ID = 1;
export const USER_ID = 1;
export const CART_ID = 1;
export const RESULT_LIMIT = 3;
export const START_DATE = '1970-01-01';
export const END_DATE = '2999-12-31';

export type SortOrder = 'asc' | 'desc';
export type Product = {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating?: { rate: number; count: number };
};
export type User = {
  id: number;
  username: string;
  password: string;
  email: string;
  name: { firstname: string; lastname: string };
  address?: unknown;
  phone?: string;
};
export type CartProduct = { productId: number; quantity: number };
export type Cart = {
  id: number;
  userId: number;
  date: string;
  products: CartProduct[];
};

export const productData = {
  title: 'Playwright API test product',
  price: 19.99,
  description: 'Deterministic product data for FakeStore API tests',
  image: 'https://example.com/playwright-api-product.png',
  category: 'electronics',
};
export const updatedProductData = { ...productData, title: 'Updated Playwright API test product' };
export const userData = {
  email: 'playwright.api.user@example.com',
  username: 'playwright_api_user',
  password: 'PlaywrightApiTest123!',
  name: { firstname: 'Playwright', lastname: 'ApiTest' },
  address: {
    city: 'Test City',
    street: 'Test Street',
    number: 1,
    zipcode: '12345',
    geolocation: { lat: '0', long: '0' },
  },
  phone: '555-0100',
};
export const updatedUserData = {
  ...userData,
  username: 'updated_playwright_api_user',
  name: { firstname: 'Updated', lastname: 'ApiTest' },
};
export const cartData = {
  userId: USER_ID,
  date: '2020-03-02',
  products: [{ productId: 1, quantity: 1 }],
};

export function routeWithId(route: string, id: number): string {
  return route.replace('{id}', String(id));
}

export function expectProductContract(product: Product, expectedId?: number): void {
  expect(product.id, 'Product id should be a number').toEqual(expect.any(Number));
  if (expectedId !== undefined) {
    expect(product.id, 'Returned product id should match the requested id').toBe(expectedId);
  }
  expect(product.title, 'Product title should be a non-empty string').toEqual(expect.any(String));
  expect(product.title.length, 'Product title should not be empty').toBeGreaterThan(0);
  expect(product.price, 'Product price should be numeric').toEqual(expect.any(Number));
  expect(product.category, 'Product category should be a non-empty string').toEqual(expect.any(String));
  expect(product.image, 'Product image should be a non-empty string').toEqual(expect.any(String));
  expect(product.image.length, 'Product image should not be empty').toBeGreaterThan(0);
}

export function expectSortedIds(ids: number[], order: SortOrder, description: string): void {
  const sortedIds = [...ids].sort((left, right) => order === 'asc' ? left - right : right - left);
  expect(ids, description).toEqual(sortedIds);
}

export function readSchema(fileName: string): object {
  return DataProvider.readJson(path.resolve(__dirname, '../../api/schemas', fileName));
}

export async function expectDeleteResponse(response: APIResponse, id: number, description: string): Promise<void> {
  const responseText = await response.text();
  if (!responseText.trim()) {
    return;
  }

  const body: unknown = JSON.parse(responseText);
  if (body !== null && typeof body === 'object' && 'id' in body) {
    expect((body as { id: number }).id, description).toBe(id);
  }
}
