describe('Admin Dashboard Navigation', () => {
  const adminEmail = 'admin';
  const adminPassword = 'admin'; 

  beforeEach(() => {
    cy.viewport(1280, 720);
    cy.visit('/');

    // Log in as admin
    cy.get('input[type="text"]').first().type(adminEmail);
    cy.get('input[type="password"]').type(adminPassword);
    cy.get('button').contains('Login').click();

    // Wait for dashboard to load
    cy.url().should('include', '/admin');
  });

  const adminMenuItems = [
    { label: 'Home', href: '/admin' },
    { label: 'View Orders', href: '/list/orders' },
    { label: 'Agents', href: '/list/agents' },
    { label: 'Lotteries', href: '/list/lotteries' },
    { label: 'History', href: '/list/history' },
    { label: 'Stock', href: '/list/stocks' },
    { label: 'Office Staff', href: '/list/staff' },
    { label: 'Profile', href: '/profile' },
  ];

  adminMenuItems.forEach(({ label, href }) => {
    it(`should navigate to "${label}" page`, () => {
      cy.get('button, a')
        .contains(label)
        .click();

      cy.url().should('include', href);
      cy.wait(8000);

    });
  });
});
