import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';
import { Routes } from '../../api/endpoints/routes';
import { expectDeleteResponse, expectSortedIds, routeWithId, RESULT_LIMIT, USER_ID, updatedUserData, userData, type User } from './fakestore-api-support';

dotenv.config();
const BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;

test.describe('FakeStore API Tests', () => {
  test.describe('Users API', () => {
    test('GET - All users @master @sanity @api', async ({ request }) => {
      const response = await request.get(`${BASE_URL}${Routes.GET_ALL_USERS}`);
      expect(response.status(), 'GET all users should return HTTP 200').toBe(200);
      const users = await response.json() as User[];
      expect(Array.isArray(users), 'Users response should be an array').toBe(true);
      expect(users.length, 'Users response should not be empty').toBeGreaterThan(0);
    });

    test('GET - User by id @master @sanity @api', async ({ request }) => {
      const response = await request.get(`${BASE_URL}${routeWithId(Routes.GET_USER_BY_ID, USER_ID)}`);
      expect(response.status(), 'GET user by id should return HTTP 200').toBe(200);
      const user = await response.json() as User;
      expect(user.id, 'Returned user id should match the requested id').toBe(USER_ID);
    });

    test('GET - Users with limit @master @regression @api', async ({ request }) => {
      const route = Routes.GET_USERS_WITH_LIMIT.replace('{limit}', String(RESULT_LIMIT));
      const response = await request.get(`${BASE_URL}${route}`);
      expect(response.status(), 'Limited users request should return HTTP 200').toBe(200);
      const users = await response.json() as User[];
      expect(Array.isArray(users), 'Limited users response should be an array').toBe(true);
      expect(users.length, 'Users response should match the requested limit').toBe(RESULT_LIMIT);
    });

    for (const order of ['asc', 'desc'] as const) {
      test(`GET - Sort users ${order}ending by id @master @regression @api`, async ({ request }) => {
        const route = Routes.GET_USERS_SORTED.replace('{order}', order);
        const response = await request.get(`${BASE_URL}${route}`);
        expect(response.status(), `User ${order} sort should return HTTP 200`).toBe(200);
        const users = await response.json() as User[];
        expect(Array.isArray(users), 'Sorted users response should be an array').toBe(true);
        expect(users.length, 'Sorted users response should not be empty').toBeGreaterThan(0);
        expectSortedIds(users.map((user) => user.id), order, `User ids should be sorted ${order}ending`);
      });
    }

    test('POST - Create user @master @regression @api', async ({ request }) => {
      const response = await request.post(`${BASE_URL}${Routes.CREATE_USER}`, { data: userData });
      expect(response.status(), 'Create user should return HTTP 201').toBe(201);
      const created = await response.json() as User;
      expect(created.id, 'Created user should include an id').toEqual(expect.any(Number));
      expect(Object.keys(created), 'FakeStore create-user response should return its documented id field').toEqual(['id']);

      const deleteResponse = await request.delete(`${BASE_URL}${routeWithId(Routes.DELETE_USER, created.id)}`);
      expect(deleteResponse.status(), 'Created user cleanup should return HTTP 200').toBe(200);
      await expectDeleteResponse(deleteResponse, created.id, 'User cleanup response should identify the deleted user when returned');
    });

    test('PUT - Update user @master @regression @api', async ({ request }) => {
      const response = await request.put(`${BASE_URL}${routeWithId(Routes.UPDATE_USER, USER_ID)}`, {
        data: updatedUserData,
      });
      expect(response.status(), 'Update user should return HTTP 200').toBe(200);
      const updated = await response.json() as User;
      expect(updated.username, 'Username should reflect the update').toBe(updatedUserData.username);
      expect(updated.name, 'Name should reflect the update').toEqual(updatedUserData.name);
    });

    test('DELETE - User by id @master @regression @api', async ({ request }) => {
      const response = await request.delete(`${BASE_URL}${routeWithId(Routes.DELETE_USER, USER_ID)}`);
      expect(response.status(), 'Delete user should return HTTP 200').toBe(200);
      await expectDeleteResponse(response, USER_ID, 'Delete response should identify the deleted user when returned');
    });
  });
});
