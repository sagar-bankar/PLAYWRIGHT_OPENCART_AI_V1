import dotenv from "dotenv";

dotenv.config();

export class Helper {
  static convertPriceToNumber(price: string): number {
    return Number(price.replace(/[^\d.]/g, ""));
  }

  static getProductDetails() {
    return {
      productName: "MacBook",
      productQuantity: "1",
      totalPrice: "$602.00",
    };
  }

  /**
   * Resolves the configured customer credentials for the active environment.
   * The local OpenCart install and the public OpenCart 2.x demo sites use
   * different pre-existing accounts, so credentials are selected by host.
   */
  static getLoginDetails() {
    const appUrl = (process.env.WEB_APP_URL || "").toLowerCase();
    const isLocal = appUrl.includes("localhost") || appUrl.includes("127.0.0.1");

    return isLocal
      ? {
          email: process.env.APP_EMAIL || "qa.automation@xyz.com",
          password: process.env.APP_PASSWORD || "test@123",
        }
      : {
          email: process.env.REMOTE_APP_EMAIL || "pavanol@xyz.com",
          password: process.env.REMOTE_APP_PASSWORD || "test@123",
        };
  }
}
