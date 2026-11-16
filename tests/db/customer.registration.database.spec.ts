import type { RowDataPacket } from "mysql2";
import dotenv from "dotenv";
import { test, expect } from "../../fixtures/pageFixtures";
import { RandomDataUtil } from "../../utils/dataGenerator";
import { executeQuery } from "../../utils/dbClient";

dotenv.config();

const storefrontUrl = process.env.WEB_APP_URL;
if (!storefrontUrl) {
  throw new Error("WEB_APP_URL must be configured in .env to run the customer registration test.");
}

const adminUrl = new URL("admin/index.php", storefrontUrl).toString();
const ENABLED_CUSTOMER_STATUS = 1;

type CustomerRow = RowDataPacket & {
  firstname: string;
  lastname: string;
  email: string;
  status: number;
  date_added?: string | Date;
};
type ColumnRow = RowDataPacket & { Field: string };

test("Register customer and verify UI, admin, and database records @master @regression @db @end-to-end", async ({
  homePage,
  registerPage,
  adminPage,
}) => {
  test.setTimeout(60_000);
  const customer = {
    firstName: RandomDataUtil.getFirstName(),
    lastName: RandomDataUtil.getLastName(),
    email: RandomDataUtil.getUniqueEmail().toLowerCase(),
    // The current registration page has no telephone input, so it cannot be submitted.
    telephone: RandomDataUtil.getPhoneNumber(),
    password: RandomDataUtil.getPassword(12),
  };
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminUsername) {
    throw new Error("ADMIN_USERNAME must be configured in .env.");
  }
  if (!adminPassword) {
    throw new Error("ADMIN_PASSWORD must be configured in .env.");
  }

  const [columnRows] = await executeQuery("SHOW COLUMNS FROM oc_customer");
  const availableColumns = (columnRows as ColumnRow[]).map((column) => column.Field);
  for (const requiredColumn of ["firstname", "lastname", "email", "status"]) {
    expect(availableColumns, `oc_customer should include the ${requiredColumn} column.`).toContain(requiredColumn);
  }
  const hasDateAdded = availableColumns.includes("date_added");

  let customerRegistrationAttempted = false;
  try {
    await test.step("1) Register a new customer through the storefront", async () => {
      await homePage.navigateToRegister();
      expect(await registerPage.isRegistrationPageExists(), "The registration form should be displayed.").toBeTruthy();

      customerRegistrationAttempted = true;
      await registerPage.registerCustomer(customer);
      expect(await registerPage.isAccountCreated(), "The account-created confirmation should be displayed.").toBeTruthy();
    });

    await test.step("2) Verify the new customer in the Admin Portal", async () => {
      await adminPage.openAdmin(adminUrl);
      await adminPage.login(adminUsername, adminPassword);
      await adminPage.openCustomerList();
      await adminPage.searchCustomerByEmail(customer.email);

      const customerRows = adminPage.getCustomerRowsByEmail(customer.email);
      await expect(customerRows, "Admin should show exactly one customer with the generated email.").toHaveCount(1);
      const customerRow = customerRows.first();
      await expect(customerRow, "Admin customer name should match the generated first name.").toContainText(customer.firstName);
      await expect(customerRow, "Admin customer name should match the generated last name.").toContainText(customer.lastName);
      await expect(customerRow, "Admin customer email should match the generated email.").toContainText(customer.email);
      expect(await adminPage.isCustomerEnabled(customer.email), "Registered customer should be enabled in Admin.").toBe(true);
    });

    await test.step("3) Verify the new customer in MySQL", async () => {
      const selectedColumns = ["firstname", "lastname", "email", "status"];
      if (hasDateAdded) {
        selectedColumns.push("date_added");
      }
      const sql = `SELECT ${selectedColumns.join(", ")} FROM oc_customer WHERE email = ?`;
      const [rows] = await executeQuery(sql, [customer.email]);
      const customers = rows as CustomerRow[];

      expect(customers, "Database should contain exactly one row for the generated email.").toHaveLength(1);
      expect(customers[0].firstname, "Database first name should match the generated value.").toBe(customer.firstName);
      expect(customers[0].lastname, "Database last name should match the generated value.").toBe(customer.lastName);
      expect(customers[0].email, "Database email should match the generated value.").toBe(customer.email);
      expect(customers[0].status, "New customer status should be enabled (1).").toBe(ENABLED_CUSTOMER_STATUS);
      if (hasDateAdded) {
        expect(customers[0].date_added, "date_added should be populated when the column exists.").toBeTruthy();
      }
    });
  } finally {
    if (customerRegistrationAttempted) {
      await executeQuery("DELETE FROM oc_customer WHERE email = ?", [customer.email]);
    }
  }
});
