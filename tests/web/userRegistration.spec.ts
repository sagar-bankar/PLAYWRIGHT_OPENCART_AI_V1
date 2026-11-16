/**
 * Test Case: User Registration Flow
 *
 * Tags: @master @sanity @regression @web
 *
 * Steps:
 * 1) Open the application
 * 2) Navigate to My Account -> Register
 * 3) Verify the registration page is displayed
 * 4) Submit valid registration details using a unique email
 * 5) Verify the account-created confirmation
 * 6) Continue to the authenticated My Account area
 */

// using custom fixtures
import { test, expect } from "../../fixtures/pageFixtures";
import { RandomDataUtil } from "../../utils/dataGenerator";

test("User registration flow test @master @sanity @regression @web", async ({
  homePage,
  registerPage,
  accountPage,
}) => {
  const customer = {
    firstName: RandomDataUtil.getFirstName(),
    lastName: RandomDataUtil.getLastName(),
    email: RandomDataUtil.getUniqueEmail(),
    telephone: RandomDataUtil.getPhoneNumber(),
    password: RandomDataUtil.getPassword(12),
  };

  await test.step("1) Open the storefront", async () => {
    expect(await homePage.isHomePageExists()).toBeTruthy();
  });

  await test.step("2) Navigate to My Account -> Register", async () => {
    await homePage.navigateToRegister();
  });

  await test.step("3) Verify the registration page is displayed", async () => {
    expect(await registerPage.isRegistrationPageExists()).toBeTruthy();
  });

  await test.step("4) Submit valid registration details", async () => {
    await registerPage.registerCustomer(customer);
  });

  await test.step("5) Verify the account-created confirmation", async () => {
    expect(await registerPage.isAccountCreated()).toBeTruthy();
  });

  await test.step("6) Verify the new account is available through account navigation", async () => {
    await registerPage.clickContinueToAccount();
    expect(await accountPage.isMyAccountPageExists()).toBeTruthy();
  });

  console.log("✅ User registration flow completed successfully.");
});
