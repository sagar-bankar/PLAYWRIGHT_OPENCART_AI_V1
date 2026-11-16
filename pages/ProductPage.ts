import { Locator, Page } from "@playwright/test";

export class ProductPage {
  private readonly page: Page;

  // Locators
  private readonly quantityField: Locator;
  private readonly addToCartButton: Locator;
  private readonly addedToCartMessage: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators with selectors shared by OpenCart 2.x and 4.x
    this.quantityField = page.locator('input[name="quantity"]');
    this.addToCartButton = page
      .getByRole("button", { name: "Add to Cart" })
      .first();
    this.addedToCartMessage = page.getByText("Success: You have added", { exact: false });
  }

  /**
   * Verifies that the expected product details page is displayed.
   * @param productName - Expected product name
   * @returns Promise<boolean> - true when the product heading matches
   */
  async isProductDetailsDisplayed(productName: string): Promise<boolean> {
    try {
      await this.page
        .locator("#content")
        .getByRole("heading", { name: productName, exact: true })
        .first()
        .waitFor({ state: "visible", timeout: 15_000 });
      return true;
    } catch (error) {
      console.log(`Product details page not displayed: ${error}`);
      return false;
    }
  }

  /**
   * Sets the product quantity and adds it to the cart.
   * @param quantity - Quantity to add
   */
  async addToCart(quantity: string): Promise<void> {
    await this.quantityField.fill(quantity);
    await this.addToCartButton.click();
    await this.addedToCartMessage.first().waitFor({ state: "visible" });
  }

  /**
   * Verifies that OpenCart confirmed the product was added.
   * @returns Promise<boolean> - true when the success message is visible
   */
  async isAddedToCartMessageDisplayed(): Promise<boolean> {
    try {
      await this.addedToCartMessage.first().waitFor({ state: "visible", timeout: 15_000 });
      return true;
    } catch (error) {
      console.log(`Add-to-cart confirmation not displayed: ${error}`);
      return false;
    }
  }
}
