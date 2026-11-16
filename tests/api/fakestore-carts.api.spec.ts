import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';
import { Routes } from '../../api/endpoints/routes';
import { cartData, CART_ID, END_DATE, expectDeleteResponse, expectSortedIds, routeWithId, RESULT_LIMIT, START_DATE, USER_ID, type Cart } from './fakestore-api-support';

dotenv.config();
const BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;

test.describe('FakeStore API Tests', () => {
  test.describe('Carts API', () => {
    test('GET - All carts @master @sanity @api', async ({ request }) => {
      const response = await request.get(`${BASE_URL}${Routes.GET_ALL_CARTS}`);
      expect(response.status(), 'GET all carts should return HTTP 200').toBe(200);
      const carts = await response.json() as Cart[];
      expect(Array.isArray(carts), 'Carts response should be an array').toBe(true);
      expect(carts.length, 'Carts response should not be empty').toBeGreaterThan(0);
    });

    test('GET - Cart by id @master @sanity @api', async ({ request }) => {
      const response = await request.get(`${BASE_URL}${routeWithId(Routes.GET_CART_BY_ID, CART_ID)}`);
      expect(response.status(), 'GET cart by id should return HTTP 200').toBe(200);
      const cart = await response.json() as Cart;
      expect(cart.id, 'Returned cart id should match the requested id').toBe(CART_ID);
    });

    test('GET - Carts within date range @master @regression @api', async ({ request }) => {
      const route = Routes.GET_CARTS_BY_DATE_RANGE
        .replace('{startdate}', START_DATE)
        .replace('{enddate}', END_DATE);
      const response = await request.get(`${BASE_URL}${route}`);
      expect(response.status(), 'Date-filtered carts request should return HTTP 200').toBe(200);
      const carts = await response.json() as Cart[];
      expect(Array.isArray(carts), 'Date-filtered carts response should be an array').toBe(true);

      const start = Date.parse(`${START_DATE}T00:00:00.000Z`);
      const end = Date.parse(`${END_DATE}T23:59:59.999Z`);
      carts.forEach((cart) => {
        const cartDate = Date.parse(cart.date);
        expect(Number.isNaN(cartDate), 'Cart date should be a valid date').toBe(false);
        expect(cartDate, 'Cart date should not precede the requested start date').toBeGreaterThanOrEqual(start);
        expect(cartDate, 'Cart date should not exceed the requested end date').toBeLessThanOrEqual(end);
      });
    });

    test('GET - Carts for a user @master @regression @api', async ({ request }) => {
      const route = Routes.GET_USER_CART.replace('{userId}', String(USER_ID));
      const response = await request.get(`${BASE_URL}${route}`);
      expect(response.status(), 'GET user carts should return HTTP 200').toBe(200);
      const carts = await response.json() as Cart[];
      expect(Array.isArray(carts), 'User carts response should be an array').toBe(true);
      carts.forEach((cart) => expect(cart.userId, 'Each cart should belong to the requested user').toBe(USER_ID));
    });

    test('GET - Carts with limit @master @regression @api', async ({ request }) => {
      const route = Routes.GET_CARTS_WITH_LIMIT.replace('{limit}', String(RESULT_LIMIT));
      const response = await request.get(`${BASE_URL}${route}`);
      expect(response.status(), 'Limited carts request should return HTTP 200').toBe(200);
      const carts = await response.json() as Cart[];
      expect(Array.isArray(carts), 'Limited carts response should be an array').toBe(true);
      expect(carts.length, 'Carts response should match the requested limit').toBe(RESULT_LIMIT);
    });

    for (const order of ['asc', 'desc'] as const) {
      test(`GET - Sort carts ${order}ending by id @master @regression @api`, async ({ request }) => {
        const route = Routes.GET_CARTS_SORTED.replace('{order}', order);
        const response = await request.get(`${BASE_URL}${route}`);
        expect(response.status(), `Cart ${order} sort should return HTTP 200`).toBe(200);
        const carts = await response.json() as Cart[];
        expect(Array.isArray(carts), 'Sorted carts response should be an array').toBe(true);
        expect(carts.length, 'Sorted carts response should not be empty').toBeGreaterThan(0);
        expectSortedIds(carts.map((cart) => cart.id), order, `Cart ids should be sorted ${order}ending`);
      });
    }

    test('POST - Create cart @master @regression @api', async ({ request }) => {
      const response = await request.post(`${BASE_URL}${Routes.CREATE_CART}`, { data: cartData });
      expect(response.status(), 'Create cart should return HTTP 201').toBe(201);
      const created = await response.json() as Cart;
      expect(created.id, 'Created cart should include an id').toEqual(expect.any(Number));
      expect(created.userId, 'Created cart user id should match the submitted value').toBe(cartData.userId);
      expect(created.products, 'Created cart products should match the submitted values').toEqual(cartData.products);

      const deleteResponse = await request.delete(`${BASE_URL}${routeWithId(Routes.DELETE_CART, created.id)}`);
      expect(deleteResponse.status(), 'Created cart cleanup should return HTTP 200').toBe(200);
    });

    test('PUT - Update cart quantity @master @regression @api', async ({ request }) => {
      const getResponse = await request.get(`${BASE_URL}${routeWithId(Routes.GET_CART_BY_ID, CART_ID)}`);
      expect(getResponse.status(), 'Cart setup request should return HTTP 200').toBe(200);
      const currentCart = await getResponse.json() as Cart;
      expect(currentCart.products.length, 'Existing cart should contain a product to update').toBeGreaterThan(0);

      const updatedCart = {
        ...currentCart,
        products: currentCart.products.map((product, index) => index === 0
          ? { ...product, quantity: product.quantity + 1 }
          : product),
      };
      const response = await request.put(`${BASE_URL}${routeWithId(Routes.UPDATE_CART, CART_ID)}`, {
        data: updatedCart,
      });
      expect(response.status(), 'Update cart should return HTTP 200').toBe(200);
      const updated = await response.json() as Cart;
      expect(updated.id, 'Updated cart id should remain unchanged').toBe(CART_ID);
      expect(updated.products[0].quantity, 'First product quantity should increase by one').toBe(currentCart.products[0].quantity + 1);
    });

    test('DELETE - Cart by id @master @regression @api', async ({ request }) => {
      const response = await request.delete(`${BASE_URL}${routeWithId(Routes.DELETE_CART, CART_ID)}`);
      expect(response.status(), 'Delete cart should return HTTP 200').toBe(200);
      await expectDeleteResponse(response, CART_ID, 'Delete response should identify the deleted cart when returned');
    });
  });
});
