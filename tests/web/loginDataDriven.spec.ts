/**
 * Test Case: Login Flow (Data Driven using External File)
 *
 * Tags: @master @regression @web @datadriven
 *
 * Data Source: testdata/opencart_logindata.json
 *
 * For each data row an independent test is generated:
 * 1) Open the OpenCart storefront and navigate to the login page
 * 2) Enter the email and password (blank/whitespace values stay empty)
 * 3) Submit the login form
 * 4) Validate the result against the row's expected value
 */

// using custom fixtures
import { test, expect } from "../../fixtures/pageFixtures";
import { DataProvider } from "../../utils/DataReader";
import { Helper } from "../../utils/helper";

type LoginDataRow = {
  testName?: string;
  TestName?: string;
  email?: string;
  password?: string;
  expected: string;
};

const loginData = DataProvider.readJson(
  "testdata/opencart_logindata.json",
) as LoginDataRow[];

const LOGIN_WARNING = "Warning: No match for E-Mail Address and/or Password.";
const LOGIN_ATTEMPTS_WARNING = "exceeded allowed number of login attempts";

// Rows may reference the active environment's credentials instead of
// hard-coding them, so the same data file works locally and against the demos.
const credentials = Helper.getLoginDetails();

const resolveCredentials = (value: string): string =>
  value
    .replace("${APP_EMAIL}", credentials.email)
    .replace("${APP_PASSWORD}", credentials.password);

for (const [index, row] of loginData.entries()) {
  const testName = row.testName ?? row.TestName ?? `Row ${index + 1}`;

  test(`${testName} [row ${index + 1}] @master @regression @web @datadriven`, async ({
    page,
    homePage,
    loginPage,
    accountPage,
  }) => {
    const email = resolveCredentials((row.email ?? "").trim());
    const password = resolveCredentials((row.password ?? "").trim());

    await test.step("1) Open the storefront and navigate to the login page", async () => {
      expect(await homePage.isHomePageExists()).toBeTruthy();
      await homePage.navigateToLogin();
      expect(await loginPage.isLoginPageExists()).toBeTruthy();
    });

    await test.step("2) Submit the login credentials (blank values stay empty)", async () => {
      await loginPage.login(email, password);
    });

    if (row.expected.toLowerCase() === "success") {
      await test.step("3) Verify login succeeds and My Account is displayed", async () => {
        expect(await accountPage.isMyAccountPageExists()).toBeTruthy();
      });
    } else {
      await test.step("3) Verify login fails with the expected OpenCart warning", async () => {
        expect(await loginPage.isLoginErrorDisplayed()).toBeTruthy();
        const message = await loginPage.getLoginErrorMessage();
        expect(message).toContain("Warning:");
        expect(
          message.includes(LOGIN_WARNING) || message.includes(LOGIN_ATTEMPTS_WARNING),
        ).toBeTruthy();
        expect(page.url()).toContain("route=account/login");
      });
    }

    console.log(`✅ Data-driven login row "${testName}" completed successfully.`);
  });
}
