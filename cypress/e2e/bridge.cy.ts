import connectWallet from "../utils/connect-wallet"

describe('Bridge', () => {
  describe('Fuse', () => {
    beforeEach(() => {
      cy.visit('/')

      connectWallet()
    })

    it('can enter an amount into input', () => {
      cy.get('.token-amount-input')
        .type('0.001', { delay: 200 })
        .should('have.value', '0.001')
    })

    it('zero swap amount', () => {
      cy.get('.token-amount-input')
        .type('0.0', { delay: 200 })
        .should('have.value', '0.0')
    })

    it('invalid swap amount', () => {
      cy.get('.token-amount-input')
        .type('\\', { delay: 200 })
        .should('have.value', '')
    })

    it('can enter an amount into output', () => {
      cy.get('.token-amount-input')
        .type('0.001', { delay: 200 })
        .should('have.value', '0.001')
    })

    it('zero output amount', () => {
      cy.get('.token-amount-input')
        .type('0.0', { delay: 200 })
        .should('have.value', '0.0')
    })

    it('disables transfer to ETH or BSC when token FUSE', () => {
      cy.get('.open-currency-select-button').click()
      cy.get('.token-item-FUSE').click({ force: true })
      cy.get('#bridge-deprecated-banner').should('be.visible')
    })

    it('transfer to ETH or BSC when token ERC20', () => {
      cy.get('#bridge-currency-input .open-currency-select-button').click()
      cy.get('.token-item-0x620fd5fa44BE6af63715Ef4E65DDFA0387aD13F5').click({ force: true })
      cy.get('#bridge-currency-input .token-amount-input').should('be.visible')
      cy.get('#bridge-currency-input .token-amount-input').type('0.001', { force: true, delay: 200 })
      cy.get('#bridge-button').should('not.be.disabled')
    })
  })
})
