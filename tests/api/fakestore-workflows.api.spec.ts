import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';
import { Routes } from '../../api/endpoints/routes';
import { cartData, expectDeleteResponse, productData, routeWithId, updatedProductData, updatedUserData, userData, type Cart, type Product, type User } from './fakestore-api-support';

dotenv.config();
const BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;

test.describe('FakeStore API Tests', () => {
  test.describe('CRUD workflows', () => {
    test('POST, PUT, DELETE - Product CRUD workflow @master @regression @api', async ({ request }) => {
      const createResponse = await request.post(`${BASE_URL}${Routes.CREATE_PRODUCT}`, { data: productData });
      expect(createResponse.status(), 'Workflow product creation should return HTTP 201').toBe(201);
      const created = await createResponse.json() as Product;
      expect(created.id, 'Workflow should capture the created product id').toEqual(expect.any(Number));

      const updateResponse = await request.put(`${BASE_URL}${routeWithId(Routes.UPDATE_PRODUCT, created.id)}`, {
        data: updatedProductData,
      });
      expect(updateResponse.status(), 'Workflow product update should return HTTP 200').toBe(200);
      const updated = await updateResponse.json() as Product;
      expect(updated.id, 'Workflow should update the created product').toBe(created.id);
      expect(updated.title, 'Workflow update should return the new title').toBe(updatedProductData.title);

      const deleteResponse = await request.delete(`${BASE_URL}${routeWithId(Routes.DELETE_PRODUCT, created.id)}`);
      expect(deleteResponse.status(), 'Workflow product deletion should return HTTP 200').toBe(200);
      await expectDeleteResponse(deleteResponse, created.id, 'Workflow deletion response should identify the product when returned');
    });

    test('POST, PUT, DELETE - User CRUD workflow @master @regression @api', async ({ request }) => {
      const createResponse = await request.post(`${BASE_URL}${Routes.CREATE_USER}`, { data: userData });
      expect(createResponse.status(), 'Workflow user creation should return HTTP 201').toBe(201);
      const created = await createResponse.json() as User;
      expect(created.id, 'Workflow should capture the created user id').toEqual(expect.any(Number));
      expect(Object.keys(created), 'FakeStore create-user response should return its documented id field').toEqual(['id']);

      const updateResponse = await request.put(`${BASE_URL}${routeWithId(Routes.UPDATE_USER, created.id)}`, {
        data: updatedUserData,
      });
      expect(updateResponse.status(), 'Workflow user update should return HTTP 200').toBe(200);
      const updated = await updateResponse.json() as User;
      expect(updated.username, 'Workflow update should return the new username').toBe(updatedUserData.username);

      const deleteResponse = await request.delete(`${BASE_URL}${routeWithId(Routes.DELETE_USER, created.id)}`);
      expect(deleteResponse.status(), 'Workflow user deletion should return HTTP 200').toBe(200);
      await expectDeleteResponse(deleteResponse, created.id, 'Workflow deletion response should identify the user when returned');
    });

    test('POST, PUT, DELETE - Cart CRUD workflow @master @regression @api', async ({ request }) => {
      const createResponse = await request.post(`${BASE_URL}${Routes.CREATE_CART}`, { data: cartData });
      expect(createResponse.status(), 'Workflow cart creation should return HTTP 201').toBe(201);
      const created = await createResponse.json() as Cart;
      expect(created.id, 'Workflow should capture the created cart id').toEqual(expect.any(Number));
      expect(created.userId, 'Created cart should use the submitted user id').toBe(cartData.userId);
      expect(created.products, 'Created cart should contain the submitted product').toEqual(cartData.products);

      const updatedCart = {
        ...cartData,
        products: [{ ...cartData.products[0], quantity: cartData.products[0].quantity + 1 }],
      };
      const updateResponse = await request.put(`${BASE_URL}${routeWithId(Routes.UPDATE_CART, created.id)}`, {
        data: updatedCart,
      });
      expect(updateResponse.status(), 'Workflow cart update should return HTTP 200').toBe(200);
      const updated = await updateResponse.json() as Cart;
      expect(updated.id, 'Workflow should update the created cart').toBe(created.id);
      expect(updated.products[0].quantity, 'Workflow should return the changed product quantity').toBe(updatedCart.products[0].quantity);

      const deleteResponse = await request.delete(`${BASE_URL}${routeWithId(Routes.DELETE_CART, created.id)}`);
      expect(deleteResponse.status(), 'Workflow cart deletion should return HTTP 200').toBe(200);
      await expectDeleteResponse(deleteResponse, created.id, 'Workflow deletion response should identify the cart when returned');
    });
  });
});
