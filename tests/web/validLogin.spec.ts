/**
 * Test Case: Valid Login Flow
 *
 * Tags: @master @sanity @regression @web
 *
 * Steps:
 * 1) Open the application
 * 2) Navigate to My Account -> Login
 * 3) Verify the login page is displayed
 * 4) Enter valid customer credentials from the configured test data
 * 5) Submit the login form
 * 6) Verify the customer reaches the authenticated My Account area
 */

// using custom fixtures
import { test, expect } from "../../fixtures/pageFixtures";
import { Helper } from "../../utils/helper";

test("Valid login flow test @master @sanity @regression @web", async ({
  homePage,
  loginPage,
  accountPage,
}) => {
  const { email, password } = Helper.getLoginDetails();

  await test.step("1) Open the storefront", async () => {
    expect(await homePage.isHomePageExists()).toBeTruthy();
  });

  await test.step("2) Navigate to My Account -> Login", async () => {
    await homePage.navigateToLogin();
  });

  await test.step("3) Verify the login page is displayed", async () => {
    expect(await loginPage.isLoginPageExists()).toBeTruthy();
  });

  await test.step("4) Submit valid customer credentials", async () => {
    await loginPage.login(email, password);
  });

  await test.step("5) Verify successful authentication and My Account area", async () => {
    expect(await accountPage.isMyAccountPageExists()).toBeTruthy();
  });

  console.log("✅ Valid login flow completed successfully.");
});
