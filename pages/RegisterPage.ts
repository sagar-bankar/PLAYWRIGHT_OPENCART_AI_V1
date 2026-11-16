import { Locator, Page } from "@playwright/test";

export type CustomerRegistrationData = {
  firstName: string;
  lastName: string;
  email: string;
  telephone?: string;
  password: string;
};

export class RegisterPage {
  private readonly page: Page;

  // Locators
  private readonly pageHeading: Locator;
  private readonly firstNameField: Locator;
  private readonly lastNameField: Locator;
  private readonly emailField: Locator;
  private readonly telephoneField: Locator;
  private readonly passwordField: Locator;
  private readonly confirmPasswordField: Locator;
  private readonly privacyPolicyCheckbox: Locator;
  private readonly continueButton: Locator;
  private readonly accountCreatedHeading: Locator;
  private readonly successContinueLink: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators by field name so they work across OpenCart versions.
    // OpenCart 2.x adds Telephone, Password Confirm and customer-group fields
    // that OpenCart 4.x does not expose on the same form.
    this.pageHeading = page
      .locator("#content")
      .getByRole("heading", { name: "Register Account", exact: true });
    this.firstNameField = page.locator('input[name="firstname"]');
    this.lastNameField = page.locator('input[name="lastname"]');
    this.emailField = page.locator('input[name="email"]');
    this.telephoneField = page.locator('input[name="telephone"]');
    this.passwordField = page.locator('input[name="password"]');
    this.confirmPasswordField = page.locator('input[name="confirm"]');
    this.privacyPolicyCheckbox = page.locator('input[name="agree"]');
    this.continueButton = page.getByRole("button", { name: "Continue", exact: true });
    this.accountCreatedHeading = page
      .locator("#content")
      .getByRole("heading", { name: "Your Account Has Been Created!", exact: true });
    this.successContinueLink = page
      .locator("#content")
      .getByRole("link", { name: "Continue", exact: true });
  }

  /**
   * Verifies that the registration form is displayed.
   * @returns Promise<boolean> - true when the registration heading is visible
   */
  async isRegistrationPageExists(): Promise<boolean> {
    try {
      await this.pageHeading.waitFor({ state: "visible", timeout: 15_000 });
      return true;
    } catch (error) {
      console.log(`Registration page not displayed: ${error}`);
      return false;
    }
  }

  /**
   * Completes and submits the customer registration form.
   * @param customer - Dynamically generated customer registration details
   */
  async registerCustomer(customer: CustomerRegistrationData): Promise<void> {
    await this.firstNameField.fill(customer.firstName);
    await this.lastNameField.fill(customer.lastName);
    await this.emailField.fill(customer.email);
    await this.passwordField.fill(customer.password);

    if (await this.telephoneField.isVisible()) {
      await this.telephoneField.fill(customer.telephone ?? "1234567890");
    }

    if (await this.confirmPasswordField.isVisible()) {
      await this.confirmPasswordField.fill(customer.password);
    }

    await this.privacyPolicyCheckbox.check();
    await this.continueButton.click();
    await this.accountCreatedHeading.waitFor({ state: "visible" });
  }

  /**
   * Verifies that OpenCart displayed its account-created confirmation.
   * @returns Promise<boolean> - true when the account-created heading is visible
   */
  async isAccountCreated(): Promise<boolean> {
    try {
      await this.accountCreatedHeading.waitFor({ state: "visible", timeout: 15_000 });
      return true;
    } catch (error) {
      console.log(`Account-created confirmation not displayed: ${error}`);
      return false;
    }
  }

  /**
   * Continues from the account-created confirmation to the account dashboard.
   */
  async clickContinueToAccount(): Promise<void> {
    await this.successContinueLink.click();
    await this.page.waitForLoadState("domcontentloaded");
  }
}
