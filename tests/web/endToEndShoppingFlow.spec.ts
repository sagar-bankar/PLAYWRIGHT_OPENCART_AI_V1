import { test, expect } from "../../fixtures/pageFixtures";
import { RandomDataUtil } from "../../utils/dataGenerator";
import { Helper } from "../../utils/helper";

test("End-to-End Shopping Flow @master @sanity @regression @web @end-to-end", async ({
  page,
  homePage,
  registerPage,
  accountPage,
  loginPage,
  searchResultsPage,
  productPage,
  cartPage,
}) => {
  test.slow();

  const customer = {
    firstName: RandomDataUtil.getFirstName(),
    lastName: RandomDataUtil.getLastName(),
    email: RandomDataUtil.getUniqueEmail(),
    telephone: RandomDataUtil.getPhoneNumber(),
    password: RandomDataUtil.getPassword(12),
  };
  const { productName, productQuantity, totalPrice } = Helper.getProductDetails();
  const pageErrors: Error[] = [];

  page.on("pageerror", (error) => pageErrors.push(error));

  await test.step("1) Open the storefront", async () => {
    expect(await homePage.isHomePageExists()).toBeTruthy();
  });

  await test.step("2) Register a new customer", async () => {
    await homePage.navigateToRegister();
    expect(await registerPage.isRegistrationPageExists()).toBeTruthy();
    await registerPage.registerCustomer(customer);
  });

  await test.step("3) Verify successful registration", async () => {
    expect(await registerPage.isAccountCreated()).toBeTruthy();
  });

  await test.step("4) Log out", async () => {
    await accountPage.logout();
    expect(await accountPage.isLogoutPageExists()).toBeTruthy();
  });

  await test.step("5) Log in with the new customer credentials", async () => {
    await homePage.navigateToLogin();
    await loginPage.login(customer.email, customer.password);
  });

  await test.step("6) Verify successful authentication", async () => {
    expect(await accountPage.isMyAccountPageExists()).toBeTruthy();
  });

  await test.step("7) Search for the known product", async () => {
    await homePage.searchForProduct(productName);
    expect(await searchResultsPage.isProductDisplayed(productName)).toBeTruthy();
  });

  await test.step("8) Open the product details page", async () => {
    await searchResultsPage.openProduct(productName);
    expect(await productPage.isProductDetailsDisplayed(productName)).toBeTruthy();
  });

  await test.step("9) Add the product to the cart", async () => {
    await productPage.addToCart(productQuantity);
    expect(await productPage.isAddedToCartMessageDisplayed()).toBeTruthy();
  });

  await test.step("10) Open the shopping cart", async () => {
    await homePage.openShoppingCart();
    expect(await cartPage.isCartPageExists()).toBeTruthy();
  });

  await test.step("11) Verify the correct product is in the cart", async () => {
    expect(await cartPage.isProductInCart(productName)).toBeTruthy();
  });

  await test.step("12) Verify the product quantity", async () => {
    expect(await cartPage.getProductQuantity(productName)).toBe(productQuantity);
  });

  await test.step("13) Verify the product price", async () => {
    expect(await cartPage.getProductPrice(productName)).toBe(totalPrice);
  });

  await test.step("14) Verify the applicable cart total", async () => {
    expect(await cartPage.getCartTotal()).toBe(totalPrice);
  });

  await test.step("15) Verify the journey finishes without page errors", async () => {
    expect(pageErrors).toEqual([]);
  });

  console.log("✅ End-to-End Shopping Flow completed successfully.");
});
