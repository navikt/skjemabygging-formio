describe("Smoke Test", function() {
  it("visits the front page", function() {
    cy.visit("/");
    cy.contains("Email");
    cy.contains("Password");
  });

});