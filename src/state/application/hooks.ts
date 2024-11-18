import { useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useWeb3 } from '../../hooks'
import { AppState } from '../index'
import {
  addPopup,
  PopupContent,
  removePopup,
  toggleClaimModal,
  toggleLendingModal,
  toggleNavMenu,
  toggleSettingsMenu,
  toggleWalletModal,
} from './actions'

export enum ERROR {
  TRANSACTION_REJECTED = 'Transaction Rejected By User',
}

export function useBlockNumber(): number | undefined {
  const { chainId } = useWeb3()

  return useSelector((state: AppState) => state.application.blockNumber[chainId ?? -1])
}

export function useWalletModalOpen(): boolean {
  return useSelector((state: AppState) => state.application.walletModalOpen)
}

export function useWalletModalToggle(): () => void {
  const dispatch = useDispatch()
  return useCallback(() => dispatch(toggleWalletModal()), [dispatch])
}

export function useSettingsMenuOpen(): boolean {
  return useSelector((state: AppState) => state.application.settingsMenuOpen)
}

export function useToggleSettingsMenu(): () => void {
  const dispatch = useDispatch()
  return useCallback(() => dispatch(toggleSettingsMenu()), [dispatch])
}

export function useNavMenuOpen(): boolean {
  return useSelector((state: AppState) => state.application.navMenuOpen)
}

export function useToggleNavMenu(): () => void {
  const dispatch = useDispatch()
  return useCallback(() => dispatch(toggleNavMenu()), [dispatch])
}

export function useClaimModalOpen(): boolean {
  return useSelector((state: AppState) => state.application.claimModalOpen)
}

export function useToggleClaimModal(): () => void {
  const dispatch = useDispatch()
  return useCallback(() => dispatch(toggleClaimModal()), [dispatch])
}

export function useLendingModalOpen(): boolean {
  return useSelector((state: AppState) => state.application.lendingModalOpen)
}

export function useToggleLendingModal(): () => void {
  const dispatch = useDispatch()
  return useCallback(() => dispatch(toggleLendingModal()), [dispatch])
}

// returns a function that allows adding a popup
export function useAddPopup(): (content: PopupContent, key?: string) => void {
  const dispatch = useDispatch()

  return useCallback(
    (content: PopupContent, key?: string) => {
      dispatch(addPopup({ content, key }))
    },
    [dispatch]
  )
}

// returns a function that allows removing a popup via its key
export function useRemovePopup(): (key: string) => void {
  const dispatch = useDispatch()
  return useCallback(
    (key: string) => {
      dispatch(removePopup({ key }))
    },
    [dispatch]
  )
}

// get the list of active popups
export function useActivePopups(): AppState['application']['popupList'] {
  const list = useSelector((state: AppState) => state.application.popupList)
  return useMemo(() => list.filter((item) => item.show), [list])
}
