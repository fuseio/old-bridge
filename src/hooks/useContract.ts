import { useMemo } from 'react'
import { Contract } from '@ethersproject/contracts'
import { ChainId, NONFUNGIBLE_POSITION_MANAGER_ADDRESSES } from '@voltage-finance/sdk-core'
import IVoltagePairABI from '@voltage-finance/core/build/IVoltagePair.json'
import NonfungiblePositionManagerJson from '@voltage-finance/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json'
import VoltageInterfaceMulticallJson from '@voltage-finance/v3-periphery/artifacts/contracts/lens/VoltageInterfaceMulticall.sol/VoltageInterfaceMulticall.json'

import { useWeb3 } from './index'
import { getContract } from '../utils'
import { MERKL_DISTRIBUTOR_ADDRESS } from './useMerklApi'
import { ERC20_BYTES32_ABI } from '../constants/abis/erc20'
import { MIGRATOR_ABI, MIGRATOR_ADDRESS } from '../constants/abis/migrator'
import { MULTICALL_ABI, MULTICALL_NETWORKS, MULTICALL_V3_NETWORKS } from '../constants/multicall'
import { FEE_DISTRIBUTOR_ADDRESS, MASTERCHEF_V4_ADDRESS, VEVOLT_ADDRESS } from '../constants/addresses'
import {
  BLOCK_REWARD_CONTRACT_ADDRESS,
  COMPOUND_LENS_ADDRESS,
  COMPTROLLER_ADDRESS,
  CONSENSUS_CONTRACT_ADDRESS,
  FUSD_ADDRESS,
  FUSD_ADDRESS_V3,
  MASTERCHEF_V3_ADDRESS,
  MERKLE_DISTRIBUTOR_ADDRESS,
  S_FUSE_LIQUID_STAKING_ADDRESS,
  TOKEN_MIGRATOR_ADDRESS,
  VOLT_ROLL_ADDRESS,
  XVOLT_ADDRESS,
  ZAP_ADDRESS,
} from '../constants'

import ZAP_ABI from '../constants/abis/zap.json'
import XVOLT_ABI from '../constants/abis/xVolt.json'
import ERC20_ABI from '../constants/abis/erc20.json'
import MASSET_ABI from '../constants/abis/masset.json'
import VESTING_ABI from '../constants/abis/vesting.json'
import PEG_SWAP_ABI from '../constants/abis/pegSwap.json'
import ENS_ABI from '../constants/abis/ens-registrar.json'
import UNISOCKS_ABI from '../constants/abis/unisocks.json'
import VEVOLT_ABI from '../constants/abis/voteEscrow.json'
import VOLT_ROLL_ABI from '../constants/abis/voltRoll.json'
import CONSENSUS_ABI from '../constants/abis/consenus.json'
import COMPTROLLER_ABI from '../constants/abis/comptroller.json'
import SFUSE_ABI from '../constants/abis/liquidsFuseStaking.json'
import BLOCK_REWARD_ABI from '../constants/abis/blockReward.json'
import STABLESWAP_ABI from '../constants/abis/swap-flash-loan.json'
import COMPOUND_LENS_ABI from '../constants/abis/compoundLens.json'
import MASTER_CHEF_V4_ABI from '../constants/abis/masterChefV4.json'
import FEE_DISTRIBUTOR_ABI from '../constants/abis/feeDistributor.json'
import MERKL_DISTRIBUTOR_ABI from '../constants/abis/merklDistributor.json'
import MERKLE_DISTRIBUTOR_ABI from '../constants/abis/merkleDistributor.json'
import ENS_PUBLIC_RESOLVER_ABI from '../constants/abis/ens-public-resolver.json'
import BRIDGED_TOKENS_MIGRATOR_ABI from '../constants/abis/bridgedTokenMigrator.json'
import MASTERCHEF_V3_ABI from '../constants/abis/masterChefV3.json'
import REWARDER_ABI from '../constants/abis/rewarder.json'

const { abi: MULTICALL_V3_ABI } = VoltageInterfaceMulticallJson
const { abi: NFT_POSITION_MANAGER_ABI } = NonfungiblePositionManagerJson

// returns null on errors
export function useContract<T extends Contract = Contract>(
  address: string | undefined,
  ABI: any,
  withSignerIfPossible = true
): Contract | null {
  const { library, account } = useWeb3()
  return useMemo(() => {
    if (!address || !ABI || !library) return null
    try {
      return getContract(address, ABI, library, withSignerIfPossible && account ? account : undefined)
    } catch (error) {
      console.error('Failed to get contract', error)
      return null
    }
  }, [address, ABI, library, withSignerIfPossible, account]) as T
}

export function useV2MigratorContract(): Contract | null {
  return useContract(MIGRATOR_ADDRESS, MIGRATOR_ABI, true)
}

export function useTokenContract(tokenAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(tokenAddress, ERC20_ABI, withSignerIfPossible)
}

export function useENSRegistrarContract(withSignerIfPossible?: boolean): Contract | null {
  const { chainId } = useWeb3()
  let address: string | undefined
  if (chainId) {
    switch (chainId) {
      case ChainId.MAINNET:
      case ChainId.GOERLI:
        address = '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e'
        break
    }
  }
  return useContract(address, ENS_ABI, withSignerIfPossible)
}

export function useENSResolverContract(address: string | undefined, withSignerIfPossible?: boolean): Contract | null {
  return useContract(address, ENS_PUBLIC_RESOLVER_ABI, withSignerIfPossible)
}

export function useBytes32TokenContract(tokenAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(tokenAddress, ERC20_BYTES32_ABI, withSignerIfPossible)
}

export function usePairContract(pairAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(pairAddress, IVoltagePairABI.abi, withSignerIfPossible)
}

export function useMulticallContract(): Contract | null {
  const { chainId } = useWeb3()
  return useContract(chainId && MULTICALL_NETWORKS[chainId], MULTICALL_ABI, false)
}

export function useInterfaceMulticall() {
  const { chainId } = useWeb3()
  return useContract(chainId && MULTICALL_V3_NETWORKS[chainId], MULTICALL_V3_ABI, false)
}

export function useSocksController(): Contract | null {
  const { chainId } = useWeb3()
  return useContract(
    chainId === ChainId.MAINNET ? '0x65770b5283117639760beA3F867b69b3697a91dd' : undefined,
    UNISOCKS_ABI,
    false
  )
}

export function useTokenMigrationContract(): Contract | null {
  return useContract(TOKEN_MIGRATOR_ADDRESS, BRIDGED_TOKENS_MIGRATOR_ABI, true)
}

export function usePegSwapContract(pegswapAddress?: string): Contract | null {
  return useContract(pegswapAddress, PEG_SWAP_ABI, true)
}

export function useComptrollerContract(): Contract | null {
  return useContract(COMPTROLLER_ADDRESS, COMPTROLLER_ABI)
}

export function useLensContract(): Contract | null {
  return useContract(COMPOUND_LENS_ADDRESS, COMPOUND_LENS_ABI)
}

export function useMerkleDistributorContract(): Contract | null {
  return useContract(MERKLE_DISTRIBUTOR_ADDRESS, MERKLE_DISTRIBUTOR_ABI)
}

export function useXVoltContract(): Contract | null {
  return useContract(XVOLT_ADDRESS, XVOLT_ABI)
}

export function useVestingContract(vestingAddress?: string, withSignerIfPossible = false): Contract | null {
  return useContract(vestingAddress, VESTING_ABI, withSignerIfPossible)
}

export function useVoltRollContract(): Contract | null {
  return useContract(VOLT_ROLL_ADDRESS, VOLT_ROLL_ABI, true)
}

export function useStableSwapContract(poolAddress?: string): Contract | null {
  return useContract(poolAddress, STABLESWAP_ABI)
}

export function useMassetContract(): Contract | null {
  return useContract(FUSD_ADDRESS, MASSET_ABI)
}

export function useMassetContractV3(): Contract | null {
  return useContract(FUSD_ADDRESS_V3, MASSET_ABI)
}

export function useZapContract(): Contract | null {
  return useContract(ZAP_ADDRESS, ZAP_ABI, true)
}
export function useFuseStakingContract(): Contract | null {
  return useContract(S_FUSE_LIQUID_STAKING_ADDRESS, SFUSE_ABI, true)
}

export function useConsensusContract(): Contract | null {
  return useContract(CONSENSUS_CONTRACT_ADDRESS, CONSENSUS_ABI)
}

export function useBlockRewardContract(): Contract | null {
  return useContract(BLOCK_REWARD_CONTRACT_ADDRESS, BLOCK_REWARD_ABI)
}

export function useVeVoltContract(): Contract | null {
  const { chainId } = useWeb3()
  return useContract(VEVOLT_ADDRESS[chainId], VEVOLT_ABI)
}

export function useFeeDistributorContract(): Contract | null {
  const { chainId } = useWeb3()
  return useContract(FEE_DISTRIBUTOR_ADDRESS[chainId], FEE_DISTRIBUTOR_ABI)
}

export function useV3NFTPositionManagerContract(withSignerIfPossible?: boolean): Contract | null {
  const { chainId } = useWeb3()
  return useContract(NONFUNGIBLE_POSITION_MANAGER_ADDRESSES[chainId], NFT_POSITION_MANAGER_ABI, withSignerIfPossible)
}

export function useMasterChefV4(withSignerIfPossible?: boolean): Contract | null {
  const { chainId } = useWeb3()
  return useContract(MASTERCHEF_V4_ADDRESS[chainId], MASTER_CHEF_V4_ABI, withSignerIfPossible)
}

export function useMerklDistributorContract(): Contract | null {
  const contractAddress = MERKL_DISTRIBUTOR_ADDRESS
  return useContract(contractAddress, MERKL_DISTRIBUTOR_ABI, true)
}

export function useMasterChefV3Contract(withSignerIfPossible?: boolean): Contract | null {
  return useContract(MASTERCHEF_V3_ADDRESS[ChainId.FUSE], MASTERCHEF_V3_ABI, withSignerIfPossible)
}

export function useRewarderContract(address?: string): Contract | null {
  return useContract(address, REWARDER_ABI)
}
