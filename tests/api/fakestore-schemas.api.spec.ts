import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';
import { Routes } from '../../api/endpoints/routes';
import Ajv from 'ajv';
import { readSchema, routeWithId, PRODUCT_ID, USER_ID, CART_ID } from './fakestore-api-support';

dotenv.config();
const BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;

test.describe('FakeStore API Tests', () => {
  test.describe('Response schema validation', () => {
    test('GET - Validate product response schema @master @regression @api', async ({ request }) => {
      const response = await request.get(`${BASE_URL}${routeWithId(Routes.GET_PRODUCT_BY_ID, PRODUCT_ID)}`);
      expect(response.status(), 'Product schema request should return HTTP 200').toBe(200);
      const product = await response.json();
      const validate = new Ajv().compile(readSchema('product_api_schema.json'));
      const valid = validate(product);
      expect(valid, `Product response schema errors: ${JSON.stringify(validate.errors)}`).toBe(true);
    });

    test('GET - Validate user response schema @master @regression @api', async ({ request }) => {
      const response = await request.get(`${BASE_URL}${routeWithId(Routes.GET_USER_BY_ID, USER_ID)}`);
      expect(response.status(), 'User schema request should return HTTP 200').toBe(200);
      const user = await response.json();
      const validate = new Ajv().compile(readSchema('user_api_schema.json'));
      const valid = validate(user);
      expect(valid, `User response schema errors: ${JSON.stringify(validate.errors)}`).toBe(true);
    });

    test('GET - Validate cart response schema @master @regression @api', async ({ request }) => {
      const response = await request.get(`${BASE_URL}${routeWithId(Routes.GET_CART_BY_ID, CART_ID)}`);
      expect(response.status(), 'Cart schema request should return HTTP 200').toBe(200);
      const cart = await response.json();
      const validate = new Ajv().compile(readSchema('cart_api_schema.json'));
      const valid = validate(cart);
      expect(valid, `Cart response schema errors: ${JSON.stringify(validate.errors)}`).toBe(true);
    });
  });
});
