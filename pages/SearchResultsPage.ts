import { Locator, Page } from "@playwright/test";

export class SearchResultsPage {
  private readonly page: Page;

  // Locators
  private readonly resultsHeading: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators with selectors shared by OpenCart 2.x and 4.x
    this.resultsHeading = page
      .locator("#content")
      .getByRole("heading", {
        name: "Products meeting the search criteria",
        exact: true,
      });
  }

  /**
   * Verifies that the expected product appears in search results.
   * @param productName - Product name to find
   * @returns Promise<boolean> - true when the product heading is visible
   */
  async isProductDisplayed(productName: string): Promise<boolean> {
    const productHeading = this.page
      .locator("#content")
      .getByRole("heading", { name: productName, exact: true })
      .first();

    try {
      await this.resultsHeading.waitFor({ state: "visible", timeout: 15_000 });
      await productHeading.waitFor({ state: "visible", timeout: 15_000 });
      return true;
    } catch (error) {
      console.log(`Search results not displayed: ${error}`);
      return false;
    }
  }

  /**
   * Opens a product from the search results.
   * @param productName - Product name to open
   */
  async openProduct(productName: string): Promise<void> {
    await this.page
      .locator("#content")
      .getByRole("link", { name: productName, exact: true })
      .first()
      .click();
  }
}
