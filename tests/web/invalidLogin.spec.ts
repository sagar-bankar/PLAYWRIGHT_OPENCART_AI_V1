/**
 * Test Case: Invalid Login Flow
 *
 * Tags: @master @regression @web
 *
 * Steps:
 * 1) Open the application
 * 2) Navigate to My Account -> Login
 * 3) Enter an invalid email and/or password
 * 4) Submit the login form
 * 5) Verify the expected warning is displayed
 * 6) Verify the customer is not authenticated
 */

// using custom fixtures
import { test, expect } from "../../fixtures/pageFixtures";
import { RandomDataUtil } from "../../utils/dataGenerator";

test("Invalid login flow test @master @regression @web", async ({
  page,
  homePage,
  loginPage,
}) => {
  const invalidEmail = RandomDataUtil.getUniqueEmail();
  const invalidPassword = RandomDataUtil.getPassword(10);

  await test.step("1) Open the storefront", async () => {
    expect(await homePage.isHomePageExists()).toBeTruthy();
  });

  await test.step("2) Navigate to My Account -> Login", async () => {
    await homePage.navigateToLogin();
    expect(await loginPage.isLoginPageExists()).toBeTruthy();
  });

  await test.step("3) Submit invalid customer credentials", async () => {
    await loginPage.login(invalidEmail, invalidPassword);
  });

  await test.step("4) Verify the expected login warning is displayed", async () => {
    expect(await loginPage.isLoginErrorDisplayed()).toBeTruthy();
    expect(await loginPage.getLoginErrorMessage()).toContain(
      "Warning: No match for E-Mail Address and/or Password.",
    );
  });

  await test.step("5) Verify the customer is not authenticated", async () => {
    expect(page.url()).toContain("route=account/login");
  });

  console.log("✅ Invalid login flow completed successfully.");
});
