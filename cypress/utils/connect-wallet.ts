export default function connectWallet() {
    cy.get('[data-testid="connect-wallet"]').click()
      
    cy.get('onboard-v2').shadow()
        .find('[type="checkbox"]', { includeShadowDom: true })
        .check()
  
    cy.get('onboard-v2').shadow()
        .find('.wallets-container', { includeShadowDom: true })
        .children()
        .first()
        .click()
}
