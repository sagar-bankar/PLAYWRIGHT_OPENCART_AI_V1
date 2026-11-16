import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';
import { Routes } from '../../api/endpoints/routes';
import { type User } from './fakestore-api-support';

dotenv.config();
const BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;

test.describe('FakeStore API Tests', () => {
  test.describe('Authentication API', () => {
    test('POST - Login with valid user credentials @master @sanity @api', async ({ request }) => {
      const usersResponse = await request.get(`${BASE_URL}${Routes.GET_ALL_USERS}`);
      expect(usersResponse.status(), 'Users endpoint should provide credentials for a known test user').toBe(200);
      const users = await usersResponse.json() as User[];
      expect(users.length, 'At least one known user should be available').toBeGreaterThan(0);

      const { username, password } = users[0];
      expect(username, 'Known user should include a username').toBeTruthy();
      expect(password, 'Known user should include a password').toBeTruthy();

      const response = await request.post(`${BASE_URL}${Routes.AUTH_LOGIN}`, {
        data: { username, password },
      });
      expect(response.status(), 'Valid login should return HTTP 201').toBe(201);

      const body = await response.json();
      expect(body.token, 'Successful login should return a token').toEqual(expect.any(String));
      expect(body.token.length, 'Authentication token should not be empty').toBeGreaterThan(0);
    });

    test('POST - Reject invalid user credentials @master @regression @api', async ({ request }) => {
      const response = await request.post(`${BASE_URL}${Routes.AUTH_LOGIN}`, {
        data: { username: 'invalid_api_user', password: 'invalid_api_password' },
      });
      expect(response.status(), 'Invalid login should return HTTP 401').toBe(401);

      const body = await response.text();
      expect(body, 'Invalid login should return the documented error').toBe('username or password is incorrect');
    });
  });
});
