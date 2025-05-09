describe('Clerk Login Page', () => {
    beforeEach(() => {
      cy.visit('/');
    });
  
    it('should render login form with Clerk fields', () => {
        cy.get('form').should('exist');
    
        cy.get('input[type="text"]').first().should('exist');      // Username/email field
        cy.get('input[type="password"]').should('exist');          // Password field
        cy.get('button').contains('Login').should('exist');        // Login button
      });
    
      it('should show error with invalid credentials', () => {
        cy.get('input[type="text"]').first().type('wrong@example.com');
        cy.get('input[type="password"]').type('wrongpassword');
    
        cy.get('button').contains('Login').click();
    
        // Wait and expect error
        cy.get('.text-red-400', { timeout: 8000 }).should('exist');
      });
    
      it('should allow successful staff login and redirect', () => {
        cy.get('input[type="text"]').first().type('aloka0777');
        cy.get('input[type="password"]').type('Aloka@0777');
    
        cy.get('button').contains('Login').click();
    
        // After login, should redirect based on role (e.g., /admin or /user)
        cy.url().should('match', /\/(office_staff|user|dashboard)/); 
      });
    });