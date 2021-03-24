describe("Smoke Test", function() {
  it("verifies content from sanity is present", function() {
    cy.visit("/");
    cy.contains("Email");
    cy.contains("Password");
  });

});