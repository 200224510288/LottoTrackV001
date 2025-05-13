describe("Lottery Page Tests", () => {
  const adminEmail = "admin";
  const adminPassword = "admin";

  beforeEach(() => {
    cy.viewport(1280, 720);
    cy.visit("/");

    // Log in as admin
    cy.get('input[type="text"]').first().type(adminEmail);
    cy.get('input[type="password"]').type(adminPassword);
    cy.get("button").contains("Login").click();

    // Wait for dashboard to load
    cy.url().should("include", "/admin");

    // Navigate to Lottery page
    cy.contains("View Orders").click();
    cy.url().should("include", "/list/orders");
  });

  it("loads the Order list and displays table", () => {
    cy.get("h1").contains("All Orders");
    cy.get("table").should("exist");
    cy.get("tr").its("length").should("be.gte", 1);
  });

  it("opens the update order modal", () => {
    cy.get('[data-cy="open-order-update-modal"]').first().click();

    // Check if modal opened using correct casing
    cy.contains("h3", "Order Progress").should("exist");
  });

it("opens the delete order modal", () => {
  cy.get('[data-cy="open-delete-modal"]').first().click();
});

});
