import connectWallet from "../utils/connect-wallet"

describe('Swap', () => {
  describe('base functionality', () => {
    beforeEach(() => {
      cy.visit('/swap')

      connectWallet()
    })

    it('can enter an amount into input', () => {
      cy.get('#swap-currency-input .token-amount-input')
        .type('0.001', { delay: 300 })
        .should('have.value', '0.001')
    })

    it('zero swap amount', () => {
      cy.get('#swap-currency-input .token-amount-input')
        .type('0.0', { delay: 200 })
        .should('have.value', '0.0')
    })

    it('invalid swap amount', () => {
      cy.get('#swap-currency-input .token-amount-input')
        .type('\\', { delay: 200 })
        .should('have.value', '')
    })

    it('can enter an amount into output', () => {
      cy.get('#swap-currency-output .token-amount-input')
        .type('0.001', { delay: 200 })
        .should('have.value', '0.001')
    })

    it('zero output amount', () => {
      cy.get('#swap-currency-output .token-amount-input')
        .type('0.0', { delay: 200 })
        .should('have.value', '0.0')
    })

    it('can swap FUSE for USDC', () => {
      cy.get('#swap-currency-output .open-currency-select-button').click()
      cy.get('.token-item-0x28C3d1cD466Ba22f6cae51b1a4692a831696391A').click({ force: true })
      cy.get('#swap-currency-input .token-amount-input').should('be.visible')
      cy.get('#swap-currency-input .token-amount-input').type('0.001', { force: true, delay: 200 })
      cy.get('#swap-currency-output .token-amount-input').should('not.equal', '')
      cy.get('#swap-button').should('not.be.disabled')
    })
  })
})
