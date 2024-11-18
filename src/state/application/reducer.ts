import { createReducer, nanoid } from '@reduxjs/toolkit'
import {
  addPopup,
  PopupContent,
  removePopup,
  setConnectedStatus,
  toggleClaimModal,
  toggleNavMenu,
  toggleSettingsMenu,
  toggleWalletModal,
  updateBlockNumber,
} from './actions'

type PopupList = Array<{ key: string; show: boolean; content: PopupContent; removeAfterMs: number | null }>

export interface ApplicationState {
  blockNumber: { [chainId: number]: number }
  popupList: PopupList
  walletModalOpen: boolean
  settingsMenuOpen: boolean
  navMenuOpen: boolean
  connected: string
  claimModalOpen: boolean
  lendingModalOpen: boolean
}

const initialState: ApplicationState = {
  blockNumber: {},
  popupList: [],
  walletModalOpen: false,
  settingsMenuOpen: false,
  navMenuOpen: false,
  claimModalOpen: false,
  connected: 'LOADING',
  lendingModalOpen: true,
}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(updateBlockNumber, (state, action) => {
      const { chainId, blockNumber } = action.payload
      if (typeof state.blockNumber[chainId] !== 'number') {
        state.blockNumber[chainId] = blockNumber
      } else {
        state.blockNumber[chainId] = Math.max(blockNumber, state.blockNumber[chainId])
      }
    })
    .addCase(toggleWalletModal, (state) => {
      state.walletModalOpen = !state.walletModalOpen
    })

    .addCase(toggleSettingsMenu, (state) => {
      state.settingsMenuOpen = !state.settingsMenuOpen
    })
    .addCase(toggleNavMenu, (state) => {
      state.navMenuOpen = !state.navMenuOpen
    })
    .addCase(toggleClaimModal, (state) => {
      state.claimModalOpen = !state.claimModalOpen
    })
    .addCase(setConnectedStatus, (state, { payload: { connected } }) => {
      state.connected = connected
    })
    .addCase(addPopup, (state, { payload: { content, key, removeAfterMs = 15000 } }) => {
      state.popupList = (key ? state.popupList.filter((popup) => popup.key !== key) : state.popupList).concat([
        {
          key: key || nanoid(),
          show: true,
          content,
          removeAfterMs,
        },
      ])
    })
    .addCase(removePopup, (state, { payload: { key } }) => {
      state.popupList = state.popupList.filter((p) => p.key !== key)
    })
)
