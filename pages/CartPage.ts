import { Locator, Page } from "@playwright/test";

export class CartPage {
  private readonly page: Page;

  // Locators
  private readonly cartHeading: Locator;
  private readonly totalRow: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators with selectors shared by OpenCart 2.x and 4.x
    this.cartHeading = page
      .locator("#content")
      .getByRole("heading", { name: /^Shopping Cart/ });
    // 4.x renders "Total", 2.x renders "Total:" - accept both.
    this.totalRow = page
      .getByRole("row")
      .filter({ has: page.getByText(/^Total:?$/) });
  }

  /**
   * Verifies that the shopping cart page is displayed.
   * @returns Promise<boolean> - true when the cart heading is visible
   */
  async isCartPageExists(): Promise<boolean> {
    try {
      await this.cartHeading.waitFor({ state: "visible", timeout: 15_000 });
      return true;
    } catch (error) {
      console.log(`Shopping cart page not displayed: ${error}`);
      return false;
    }
  }

  /**
   * Verifies that a product appears as a row in the cart.
   * @param productName - Product name to find
   * @returns Promise<boolean> - true when the product row is visible
   */
  async isProductInCart(productName: string): Promise<boolean> {
    try {
      await this.getProductRow(productName).waitFor({ state: "visible", timeout: 15_000 });
      return true;
    } catch (error) {
      console.log(`Product not found in cart: ${error}`);
      return false;
    }
  }

  /**
   * Reads the quantity displayed for a product in the cart.
   * @param productName - Product name in the cart
   * @returns Promise<string> - Current cart quantity
   */
  async getProductQuantity(productName: string): Promise<string> {
    return this.getProductRow(productName).getByRole("textbox").first().inputValue();
  }

  /**
   * Reads the unit price displayed for a product in the cart.
   * @param productName - Product name in the cart
   * @returns Promise<string> - Product unit price
   */
  async getProductPrice(productName: string): Promise<string> {
    // Unit price is the second-to-last cell in both OpenCart 2.x and 4.x
    // (2.x inserts a Model column that 4.x keeps inside the product cell).
    const cells = this.getProductRow(productName).getByRole("cell");
    const cellCount = await cells.count();
    return (await cells.nth(cellCount - 2).innerText()).trim();
  }

  /**
   * Reads the cart's grand total.
   * @returns Promise<string> - Cart total amount
   */
  async getCartTotal(): Promise<string> {
    return (await this.totalRow.getByRole("cell").last().innerText()).trim();
  }

  private getProductRow(productName: string): Locator {
    return this.page
      .getByRole("row")
      .filter({ has: this.page.getByRole("link", { name: productName, exact: true }) })
      .first();
  }
}
