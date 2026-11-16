/**
 * Test Case: Add Product to Cart
 *
 * Tags: @master @sanity @regression @web
 *
 * Steps:
 * 1) Open the application
 * 2) Search for a known product and open its details page
 * 3) Verify the product details are displayed
 * 4) Set the quantity and add the product to the cart
 * 5) Verify the product-added confirmation message
 * 6) Open the shopping cart and verify the product and quantity
 */

// using custom fixtures
import { test, expect } from "../../fixtures/pageFixtures";
import { Helper } from "../../utils/helper";

test("Add product to cart test @master @sanity @regression @web", async ({
  homePage,
  searchResultsPage,
  productPage,
  cartPage,
}) => {
  const { productName, productQuantity } = Helper.getProductDetails();

  await test.step("1) Open the storefront", async () => {
    expect(await homePage.isHomePageExists()).toBeTruthy();
  });

  await test.step("2) Search for the product and open its details page", async () => {
    await homePage.searchForProduct(productName);
    expect(await searchResultsPage.isProductDisplayed(productName)).toBeTruthy();
    await searchResultsPage.openProduct(productName);
    expect(await productPage.isProductDetailsDisplayed(productName)).toBeTruthy();
  });

  await test.step("3) Add the product to the cart with the required quantity", async () => {
    await productPage.addToCart(productQuantity);
  });

  await test.step("4) Verify the product-added confirmation message", async () => {
    expect(await productPage.isAddedToCartMessageDisplayed()).toBeTruthy();
  });

  await test.step("5) Open the shopping cart", async () => {
    await homePage.openShoppingCart();
    expect(await cartPage.isCartPageExists()).toBeTruthy();
  });

  await test.step("6) Verify the product and quantity in the cart", async () => {
    expect(await cartPage.isProductInCart(productName)).toBeTruthy();
    expect(await cartPage.getProductQuantity(productName)).toBe(productQuantity);
  });

  console.log("✅ Add product to cart flow completed successfully.");
});
