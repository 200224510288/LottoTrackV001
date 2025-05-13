describe("Agent Page Tests", () => {
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

    // Navigate to Agents page
    cy.contains("Agents").click();
    cy.url().should("include", "/list/agents");
  });

  it("loads the agent list and displays table", () => {
    cy.get("h1").contains("All Agents");
    cy.get("table").should("exist");
    cy.get("tr").its("length").should("be.gte", 1);
  });

 it("opens the create agent modal", () => {
  cy.get('[data-cy="open-create-modal"]').click();
  cy.get("form").within(() => {
    cy.contains("Create a new Agent"); 
  });
});

  it("opens the update agent modal", () => {
    cy.get('[data-cy="open-update-modal"]').first().click();
  });

it("opens the delete agent modal", () => {
  cy.get('[data-cy="open-delete-modal"]').first().click();
});


});