/**
 * Test Case: Product Search Flow
 *
 * Tags: @master @sanity @regression @web
 *
 * Steps:
 * 1) Open the application
 * 2) Enter a known product name in the main search field
 * 3) Submit the search
 * 4) Verify the search results page and the expected product
 */

// using custom fixtures
import { test, expect } from "../../fixtures/pageFixtures";
import { Helper } from "../../utils/helper";

test("Product search flow test @master @sanity @regression @web", async ({
  homePage,
  searchResultsPage,
}) => {
  const { productName } = Helper.getProductDetails();

  await test.step("1) Open the storefront", async () => {
    expect(await homePage.isHomePageExists()).toBeTruthy();
  });

  await test.step("2) Search for the known product", async () => {
    await homePage.searchForProduct(productName);
  });

  await test.step("3) Verify the search results page is displayed", async () => {
    expect(await searchResultsPage.isProductDisplayed(productName)).toBeTruthy();
  });

  console.log("✅ Product search flow completed successfully.");
});
