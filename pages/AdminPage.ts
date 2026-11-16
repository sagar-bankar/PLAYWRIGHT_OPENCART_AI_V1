import { Locator, Page } from "@playwright/test";

export class AdminPage {
  private readonly page: Page;
  private readonly usernameField: Locator;
  private readonly passwordField: Locator;
  private readonly loginButton: Locator;
  private readonly customersMenu: Locator;
  private readonly customerListLink: Locator;
  private readonly emailFilterField: Locator;
  private readonly filterButton: Locator;
  private readonly customerRows: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameField = page.getByRole("textbox", { name: "Username" });
    this.passwordField = page.getByRole("textbox", { name: "Password" });
    this.loginButton = page.getByRole("button", { name: "Login", exact: true });
    this.customersMenu = page.locator("#menu-customer > a");
    this.customerListLink = page.locator('#menu-customer a[href*="route=customer/customer&"]');
    this.emailFilterField = page.locator("#input-email");
    this.filterButton = page.locator("#button-filter");
    this.customerRows = page.locator("#form-customer tbody tr");
  }

  /** Opens the OpenCart administration login page. */
  async openAdmin(url: string): Promise<void> {
    await this.page.goto(url);
  }

  /** Logs in with the configured administrator credentials. */
  async login(username: string, password: string): Promise<void> {
    await this.usernameField.fill(username);
    await this.passwordField.fill(password);
    await this.loginButton.click();
    try {
      await this.page.waitForURL((url) => url.searchParams.get("route") === "common/dashboard", { timeout: 15_000 });
    } catch (error) {
      const loginError = this.page.locator("#alert .alert-danger");
      if (await loginError.isVisible()) {
        throw new Error(`Admin login failed: ${(await loginError.innerText()).trim()}`);
      }
      throw error;
    }
    await this.page.locator("#menu-dashboard > a").waitFor({ state: "visible" });
  }

  /** Opens the customer list in the administration portal. */
  async openCustomerList(): Promise<void> {
    const securityModal = this.page.locator("#modal-security");
    if (await securityModal.isVisible()) {
      await securityModal.locator(".btn-close").click();
      await securityModal.waitFor({ state: "hidden" });
    }

    await this.customersMenu.click();
    await this.customerListLink.click();
    await this.emailFilterField.waitFor({ state: "visible" });
  }

  /** Filters the customer list by a unique email address. */
  async searchCustomerByEmail(email: string): Promise<void> {
    await this.emailFilterField.fill(email);
    await this.filterButton.click();
    await this.page.waitForLoadState("domcontentloaded");
  }

  /** Returns customer rows matching the requested email address. */
  getCustomerRowsByEmail(email: string): Locator {
    return this.customerRows.filter({ hasText: email });
  }

  async isCustomerEnabled(email: string): Promise<boolean> {
    const customerRow = this.getCustomerRowsByEmail(email).first();
    await customerRow.locator('a[href*="route=customer/customer.form"]').click();
    const statusField = this.page.locator("#input-status");
    await statusField.waitFor({ state: "visible" });
    return statusField.isChecked();
  }
}
