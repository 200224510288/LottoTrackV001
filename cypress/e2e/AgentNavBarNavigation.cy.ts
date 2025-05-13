describe('Agent Navbar Navigation', () => {
  const agentUserName = 'Aloka1234';
  const agentPassword = 'Aloka@0777';      

  beforeEach(() => {
    cy.viewport(1280, 720);
    cy.visit('/');

    // Log in as agent
    cy.get('input[type="text"]').first().type(agentUserName);
    cy.get('input[type="password"]').type(agentPassword);
    cy.get('button').contains('Login').click();

    // Wait for dashboard to load
    cy.url().should('include', '/agent');
  });

  const agentMenuItems = [
    { label: 'Home', href: '/agent' },
    { label: 'My Order', href: '/MyOrder' },
    { label: 'Order History', href: '/OrderHistory' },
  ];

  agentMenuItems.forEach(({ label, href }) => {
    it(`should navigate to "${label}" page`, () => {
      cy.get('a')
        .contains(label)
        .click({ force: true });

      cy.url().should('include', href);

      // Wait after navigation
      cy.wait(8000);
    });
  });
});
