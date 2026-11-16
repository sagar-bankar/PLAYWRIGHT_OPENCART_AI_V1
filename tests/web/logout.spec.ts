/**
 * Test Case: Logout Flow
 *
 * Tags: @master @sanity @regression @web
 *
 * Steps:
 * 1) Open the application and log in with valid customer credentials
 * 2) Verify that authentication succeeds
 * 3) Navigate to the account logout option and click Logout
 * 4) Verify the logout confirmation page
 * 5) Click Continue and verify the redirect to the homepage
 * 6) Verify authenticated account options are no longer available
 */

// using custom fixtures
import { test, expect } from "../../fixtures/pageFixtures";
import { Helper } from "../../utils/helper";

test("Logout flow test @master @sanity @regression @web", async ({
  homePage,
  loginPage,
  accountPage,
}) => {
  const { email, password } = Helper.getLoginDetails();

  await test.step("1) Open the storefront and log in", async () => {
    expect(await homePage.isHomePageExists()).toBeTruthy();
    await homePage.navigateToLogin();
    await loginPage.login(email, password);
  });

  await test.step("2) Verify that authentication succeeds", async () => {
    expect(await accountPage.isMyAccountPageExists()).toBeTruthy();
  });

  await test.step("3) Log out through the account menu", async () => {
    await accountPage.logout();
  });

  await test.step("4) Verify the logout confirmation page", async () => {
    expect(await accountPage.isLogoutPageExists()).toBeTruthy();
  });

  await test.step("5) Continue and verify the redirect to the homepage", async () => {
    await accountPage.clickContinueAfterLogout();
    expect(await homePage.isHomePageExists()).toBeTruthy();
  });

  await test.step("6) Verify authenticated account options are no longer available", async () => {
    expect(await homePage.isLogoutOptionVisible()).toBeFalsy();
    await homePage.openAccountMenu();
    expect(await homePage.isLoginOptionVisible()).toBeTruthy();
  });

  console.log("✅ Logout flow completed successfully.");
});
