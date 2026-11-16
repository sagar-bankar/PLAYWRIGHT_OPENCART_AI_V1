import { Locator, Page } from "@playwright/test";

export class LoginPage {
  private readonly page: Page;
  private readonly emailField: Locator;
  private readonly passwordField: Locator;
  private readonly loginButton: Locator;
  private readonly errorAlert: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators with CSS selectors
    this.emailField = page.getByRole("textbox", { name: "E-Mail Address" });
    this.passwordField = page.getByRole("textbox", { name: "Password" });
    this.loginButton = page.getByRole("button", { name: "Login", exact: true });
    this.errorAlert = page.locator(".alert-danger").first();
  }

  /**
   * Verifies that the customer login page is displayed.
   * @returns Promise<boolean> - true when the email field is visible
   */
  async isLoginPageExists(): Promise<boolean> {
    try {
      await this.emailField.waitFor({ state: "visible", timeout: 15_000 });
      return true;
    } catch (error) {
      console.log(`Login page not displayed: ${error}`);
      return false;
    }
  }

  /**
   * Submits the customer login form.
   * @param email - Registered customer email
   * @param password - Registered customer password
   */
  async login(email: string, password: string): Promise<void> {
    await this.emailField.fill(email);
    await this.passwordField.fill(password);
    await this.loginButton.click();
  }

  /**
   * Waits for OpenCart to display its login warning/error message.
   * @returns Promise<boolean> - true when the warning is visible
   */
  async isLoginErrorDisplayed(): Promise<boolean> {
    try {
      await this.errorAlert.waitFor({ state: "visible", timeout: 20_000 });
      return true;
    } catch (error) {
      console.log(`Login warning not displayed: ${error}`);
      return false;
    }
  }

  /**
   * Reads the login warning/error message displayed by OpenCart.
   * @returns Promise<string> - Trimmed warning text
   */
  async getLoginErrorMessage(): Promise<string> {
    return (await this.errorAlert.first().innerText()).trim();
  }
}
