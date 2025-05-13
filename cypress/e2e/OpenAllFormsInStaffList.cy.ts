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
    cy.contains("Office Staff").click();
    cy.url().should("include", "/list/staff");
  });

  it("loads the Office Staff list and displays table", () => {
    cy.get("h1").contains("All Staff");
    cy.get("table").should("exist");
    cy.get("tr").its("length").should("be.gte", 1);
  });

 it("opens the create Office Staff modal", () => {
  cy.get('[data-cy="open-create-modal"]').click();
  cy.get("form").within(() => {
    cy.contains("Create a new Staff"); 
  });
});

  it("opens the update staff modal", () => {
    cy.get('[data-cy="open-update-modal"]').first().click();
  });

it("opens the delete staff modal", () => {
  cy.get('[data-cy="open-delete-modal"]').first().click();
});

});