describe('Clerk Login Page', () => {
    beforeEach(() => {
      cy.visit('/');
      cy.viewport(1280, 720); 
    });
  
    it('should render login form with Clerk fields', () => {
        cy.get('form').should('exist');
    
        cy.get('input[type="text"]').first().should('exist');      
        cy.get('input[type="password"]').should('exist');         
        cy.get('button').contains('Login').should('exist');     
      });
    
      it('should show error with invalid credentials', () => {
        cy.get('input[type="text"]').first().type('wrong@example.com');
        cy.get('input[type="password"]').type('wrongpassword');
    
        cy.get('button').contains('Login').click();
    
        // Wait and expect error
        cy.get('.text-red-400', { timeout: 8000 }).should('exist');
      });
    
      it('should allow successful admin login and redirect', () => {
        cy.get('input[type="text"]').first().type('admin');
        cy.get('input[type="password"]').type('admin');
    
        cy.get('button').contains('Login').click();
    
        // After login, should redirect based on role (e.g., /admin or /user)
        cy.url().should('match', /\/(admin|user|dashboard)/); 
      });
    });