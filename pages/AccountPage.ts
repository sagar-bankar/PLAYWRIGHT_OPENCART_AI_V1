import { Locator, Page } from "@playwright/test";

export class AccountPage {
  private readonly page: Page;

  // Locators
  private readonly accountHeading: Locator;
  private readonly accountMenuButton: Locator;
  private readonly logoutLink: Locator;
  private readonly logoutHeading: Locator;
  private readonly continueLink: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators with CSS selectors
    // Scoped to #content so the footer heading with the same text is ignored
    // (and so it works whether the dashboard heading is h1 or h2).
    this.accountHeading = page
      .locator("#content")
      .getByRole("heading", { name: "My Account", exact: true });
    this.accountMenuButton = page.locator("#top .dropdown-toggle").nth(1);
    this.logoutLink = page
      .locator('#top a[href*="route=account/logout"]')
      .first();
    this.logoutHeading = page
      .locator("#content")
      .getByRole("heading", { name: "Account Logout", exact: true });
    this.continueLink = page
      .locator("#content")
      .getByRole("link", { name: "Continue", exact: true });
  }

  /**
   * Verifies that the authenticated account dashboard is displayed.
   * @returns Promise<boolean> - true when the account heading is visible
   */
  async isMyAccountPageExists(): Promise<boolean> {
    try {
      await this.accountHeading.waitFor({ state: "visible", timeout: 20_000 });
      return true;
    } catch (error) {
      console.log(`My Account page not displayed: ${error}`);
      return false;
    }
  }

  /**
   * Logs out through the customer account menu.
   */
  async logout(): Promise<void> {
    await this.accountMenuButton.click();
    await this.logoutLink.click();
  }

  /**
   * Verifies that the logout confirmation page is displayed.
   * @returns Promise<boolean> - true when the logout heading is visible
   */
  async isLogoutPageExists(): Promise<boolean> {
    try {
      await this.logoutHeading.waitFor({ state: "visible", timeout: 15_000 });
      return true;
    } catch (error) {
      console.log(`Logout page not displayed: ${error}`);
      return false;
    }
  }

  /**
   * Continues from the logout confirmation page back to the storefront.
   */
  async clickContinueAfterLogout(): Promise<void> {
    await this.continueLink.click();
    await this.page.waitForLoadState("domcontentloaded");
  }
}
