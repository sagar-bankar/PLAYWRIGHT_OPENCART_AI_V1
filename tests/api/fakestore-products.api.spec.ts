import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';
import { Routes } from '../../api/endpoints/routes';
import { expectDeleteResponse, expectProductContract, expectSortedIds, productData, updatedProductData, routeWithId, RESULT_LIMIT, PRODUCT_ID, type Product } from './fakestore-api-support';

dotenv.config();
const BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;

test.describe('FakeStore API Tests', () => {
  test.describe('Products API', () => {
    test('GET - All products @master @sanity @api', async ({ request }) => {
      const response = await request.get(`${BASE_URL}${Routes.GET_ALL_PRODUCTS}`);
      expect(response.status(), 'GET all products should return HTTP 200').toBe(200);

      const products = await response.json() as Product[];
      expect(Array.isArray(products), 'Products response should be an array').toBe(true);
      expect(products.length, 'Products response should not be empty').toBeGreaterThan(0);
      products.forEach((product) => expectProductContract(product));
    });

    test('GET - Product by id @master @sanity @api', async ({ request }) => {
      const response = await request.get(`${BASE_URL}${routeWithId(Routes.GET_PRODUCT_BY_ID, PRODUCT_ID)}`);
      expect(response.status(), 'GET product by id should return HTTP 200').toBe(200);
      expectProductContract(await response.json() as Product, PRODUCT_ID);
    });

    test('GET - Products with limit @master @regression @api', async ({ request }) => {
      const route = Routes.GET_PRODUCTS_WITH_LIMIT.replace('{limit}', String(RESULT_LIMIT));
      const response = await request.get(`${BASE_URL}${route}`);
      expect(response.status(), 'Limited products request should return HTTP 200').toBe(200);

      const products = await response.json() as Product[];
      expect(Array.isArray(products), 'Limited products response should be an array').toBe(true);
      expect(products.length, 'Products response should match the requested limit').toBe(RESULT_LIMIT);
    });

    for (const order of ['asc', 'desc'] as const) {
      test(`GET - Sort products ${order}ending by id @master @regression @api`, async ({ request }) => {
        const route = Routes.GET_PRODUCTS_SORTED.replace('{order}', order);
        const response = await request.get(`${BASE_URL}${route}`);
        expect(response.status(), `Product ${order} sort should return HTTP 200`).toBe(200);

        const products = await response.json() as Product[];
        expect(Array.isArray(products), 'Sorted products response should be an array').toBe(true);
        expect(products.length, 'Sorted products response should not be empty').toBeGreaterThan(0);
        expectSortedIds(products.map((product) => product.id), order, `Product ids should be sorted ${order}ending`);
      });
    }

    test('GET - All product categories @master @sanity @api', async ({ request }) => {
      const response = await request.get(`${BASE_URL}${Routes.GET_ALL_CATEGORIES}`);
      expect(response.status(), 'GET categories should return HTTP 200').toBe(200);

      const categories = await response.json() as string[];
      expect(Array.isArray(categories), 'Categories response should be an array').toBe(true);
      expect(categories.length, 'Categories response should not be empty').toBeGreaterThan(0);
      categories.forEach((category) => expect(category, 'Category should be a non-empty string').toEqual(expect.any(String)));
    });

    test('GET - Products by category @master @regression @api', async ({ request }) => {
      const category = 'electronics';
      const route = Routes.GET_PRODUCTS_BY_CATEGORY.replace('{category}', encodeURIComponent(category));
      const response = await request.get(`${BASE_URL}${route}`);
      expect(response.status(), 'GET products by category should return HTTP 200').toBe(200);

      const products = await response.json() as Product[];
      expect(Array.isArray(products), 'Category products response should be an array').toBe(true);
      expect(products.length, 'The selected category should have products').toBeGreaterThan(0);
      products.forEach((product) => expect(product.category, 'Every product should belong to the requested category').toBe(category));
    });

    test('POST - Create product @master @regression @api', async ({ request }) => {
      const response = await request.post(`${BASE_URL}${Routes.CREATE_PRODUCT}`, { data: productData });
      expect(response.status(), 'Create product should return HTTP 201').toBe(201);

      const created = await response.json() as Product;
      expect(created.id, 'Created product should include an id').toEqual(expect.any(Number));
      expect(created.title, 'Created product title should match the submitted value').toBe(productData.title);
      expect(created.price, 'Created product price should match the submitted value').toBe(productData.price);
      expect(created.category, 'Created product category should match the submitted value').toBe(productData.category);
      expect(created.image, 'Created product image should match the submitted value').toBe(productData.image);

      const deleteResponse = await request.delete(`${BASE_URL}${routeWithId(Routes.DELETE_PRODUCT, created.id)}`);
      expect(deleteResponse.status(), 'Created product cleanup should return HTTP 200').toBe(200);
      await expectDeleteResponse(deleteResponse, created.id, 'Product cleanup response should identify the deleted product when returned');
    });

    test('PUT - Update product @master @regression @api', async ({ request }) => {
      const response = await request.put(`${BASE_URL}${routeWithId(Routes.UPDATE_PRODUCT, PRODUCT_ID)}`, {
        data: updatedProductData,
      });
      expect(response.status(), 'Update product should return HTTP 200').toBe(200);

      const updated = await response.json() as Product;
      expect(updated.id, 'Updated product id should remain unchanged').toBe(PRODUCT_ID);
      expect(updated.title, 'Product title should reflect the update').toBe(updatedProductData.title);
      expect(updated.price, 'Product price should reflect the update').toBe(updatedProductData.price);
      expect(updated.category, 'Product category should reflect the update').toBe(updatedProductData.category);
    });

    test('DELETE - Product by id @master @regression @api', async ({ request }) => {
      const response = await request.delete(`${BASE_URL}${routeWithId(Routes.DELETE_PRODUCT, PRODUCT_ID)}`);
      expect(response.status(), 'Delete product should return HTTP 200').toBe(200);
      await expectDeleteResponse(response, PRODUCT_ID, 'Delete response should identify the deleted product when returned');
    });
  });
});
