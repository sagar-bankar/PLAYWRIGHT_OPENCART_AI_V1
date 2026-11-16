import { Locator, Page } from "@playwright/test";

export class HomePage {
  private readonly page: Page;

  // Locators
  private readonly accountMenuButton: Locator;
  private readonly registerLink: Locator;
  private readonly loginLink: Locator;
  private readonly logoutLink: Locator;
  private readonly searchField: Locator;
  private readonly searchButton: Locator;
  private readonly shoppingCartLink: Locator;
  private readonly storeLogo: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators with selectors that work across OpenCart 2.x and 4.x
    this.accountMenuButton = page.locator("#top .dropdown-toggle").nth(1);
    // Navigate by target route: 2.x adds Font Awesome glyphs to some link
    // names, which breaks exact accessible-name matching.
    this.registerLink = page
      .locator('#top a[href*="route=account/register"]')
      .first();
    this.loginLink = page
      .locator('#top a[href*="route=account/login"]')
      .first();
    this.logoutLink = page
      .locator('#top a[href*="route=account/logout"]')
      .first();
    this.searchField = page.locator('input[name="search"]').first();
    // OpenCart 4.x wraps the header search in a form; OpenCart 2.x uses a
    // plain #search container with a JS-driven button.
    this.searchButton = page
      .locator('#search button, form[action*="common/search.redirect"] button')
      .first();
    this.shoppingCartLink = page
      .locator('#top a[href*="route=checkout/cart"]')
      .first();
    this.storeLogo = page.locator("#logo a, header a:has(img)").first();
  }

  /**
   * Verifies that the storefront is displayed.
   * @returns Promise<boolean> - true when the store logo is visible
   */
  async isHomePageExists(): Promise<boolean> {
    try {
      await this.storeLogo.waitFor({ state: "visible", timeout: 15_000 });
      return true;
    } catch (error) {
      console.log(`Storefront not displayed: ${error}`);
      return false;
    }
  }

  /**
   * Opens the customer account menu.
   */
  async openAccountMenu(): Promise<void> {
    await this.accountMenuButton.click();
  }

  /**
   * Navigates to customer registration.
   */
  async navigateToRegister(): Promise<void> {
    await this.openAccountMenu();
    await this.registerLink.click();
  }

  /**
   * Navigates to customer login.
   */
  async navigateToLogin(): Promise<void> {
    await this.openAccountMenu();
    await this.loginLink.click();
  }

  /**
   * Verifies that the authenticated navigation exposes a Logout option.
   * @returns Promise<boolean> - true when the top-menu Logout link is present and visible
   */
  async isLogoutOptionVisible(): Promise<boolean> {
    return this.logoutLink.isVisible();
  }

  /**
   * Verifies that the guest navigation exposes a Login option.
   * @returns Promise<boolean> - true when the top-menu Login link is present and visible
   */
  async isLoginOptionVisible(): Promise<boolean> {
    return this.loginLink.isVisible();
  }

  /**
   * Searches for a product from the storefront header.
   * @param productName - Product name to search for
   */
  async searchForProduct(productName: string): Promise<void> {
    await this.searchField.fill(productName);
    await this.searchButton.click();

    await this.page.waitForURL(/route=product\/search/, { timeout: 15_000 }).catch(() => {
      // Some themes trigger the search through JavaScript; fall back below.
    });
    await this.page.waitForLoadState("domcontentloaded");

    const currentUrl = new URL(this.page.url());

    if (currentUrl.searchParams.get("route") !== "product/search") {
      currentUrl.searchParams.set("route", "product/search");
      currentUrl.searchParams.set("search", productName);
      await this.page.goto(currentUrl.toString());
    }
  }

  /**
   * Opens the shopping cart.
   */
  async openShoppingCart(): Promise<void> {
    await this.shoppingCartLink.click();
  }
}
