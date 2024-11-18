import { get } from 'lodash'
import { useDispatch } from 'react-redux'
import { useEffect, useMemo } from 'react'
import { Token } from '@voltage-finance/sdk-core'
import { formatUnits, getAddress } from 'ethers/lib/utils'

import { useWeb3 } from '../../hooks'
import { LAUNCH_DESCRIPTIONS } from './constant'
import { sparkProvider } from '../../connectors'
import { ChainId } from '../../constants/chains'
import { useFusePrice } from '../../graphql/hooks'
import { useBlockNumber } from '../application/hooks'
import { ERC20_ABI } from '../../constants/abis/erc20'
import { addLaunch } from '../../state/launch/actions'
import { useMultiCallV2 } from '../../hooks/useMultiCallV2'
import LAUNCH_ABI from '../../constants/abis/launchpad.json'

export enum LaunchStatus {
  Upcoming = 'Upcoming',
  Live = 'Live',
  Finalized = 'Finalized',
}

export const useTokenV2 = (address) => {
  const { chainId } = useWeb3()
  const results = useMultiCallV2(
    address
      ? [
          {
            reference: address,
            contractAddress: address,
            abi: ERC20_ABI,
            calls: [
              {
                reference: 'decimals',
                methodName: 'decimals',
                methodParameters: [],
              },
              {
                reference: 'name',
                methodName: 'name',
                methodParameters: [],
              },
              {
                reference: 'symbol',
                methodName: 'symbol',
                methodParameters: [],
              },
            ],
          },
        ]
      : [],
    chainId === ChainId.SPARK
      ? {
          multicallCustomContractAddress: '0xD38a6D91f9278a44161Ec6A02F7821d6b6f9Ec96',
          ethersProvider: sparkProvider,
        }
      : {},
    [address]
  )
  const decimals = get(results, '[0].result[0]')
  const name = get(results, '[1].result[0]')
  const symbol = get(results, '[2].result[0]')

  return useMemo(() => {
    if (decimals && name && symbol && address) {
      return new Token(122, address, decimals, symbol, name)
    }
  }, [results, address])
}

export const useLaunch = (contractAddress: string) => {
  if (!contractAddress) return
  const { account, chainId } = useWeb3()

  const dispatch = useDispatch()
  const blockNumber = useBlockNumber()

  const user = [
    {
      reference: 'getUserBuyAmount',
      methodName: 'getUserBuyAmount',
      methodParameters: [account],
    },
    {
      reference: 'usersInfo',
      methodName: 'usersInfo',
      methodParameters: [account],
    },
    {
      reference: 'getUserAllocation',
      methodName: 'getUserAllocation',
      methodParameters: [account],
    },
  ]

  const results = useMultiCallV2(
    [
      {
        reference: getAddress(contractAddress),
        contractAddress: getAddress(contractAddress),
        abi: LAUNCH_ABI,
        calls: [
          {
            reference: 'hasEnded',
            methodName: 'hasEnded',
            methodParameters: [],
          },
          {
            reference: 'hasStarted',
            methodName: 'hasStarted',
            methodParameters: [],
          },
          {
            reference: 'startTime',
            methodName: 'startTime',
            methodParameters: [],
          },
          {
            reference: 'endTime',
            methodName: 'endTime',
            methodParameters: [],
          },
          {
            reference: 'projectToken',
            methodName: 'projectToken',
            methodParameters: [],
          },
          {
            reference: 'saleToken',
            methodName: 'saleToken',
            methodParameters: [],
          },
          {
            reference: 'snapshotTime',
            methodName: 'snapshotTime',
            methodParameters: [],
          },
          {
            reference: 'minSaleTokenReserve',
            methodName: 'minSaleTokenReserve',
            methodParameters: [],
          },
          {
            reference: 'maxSaleTokenReserve',
            methodName: 'maxSaleTokenReserve',
            methodParameters: [],
          },
          {
            reference: 'vestingDays',
            methodName: 'vestingDays',
            methodParameters: [],
          },
          {
            reference: 'projectTokenReserve',
            methodName: 'projectTokenReserve',
            methodParameters: [],
          },
          {
            reference: 'saleTokenReserve',
            methodName: 'saleTokenReserve',
            methodParameters: [],
          },
          {
            reference: 'tokensToDistribute',
            methodName: 'tokensToDistribute',
            methodParameters: [],
          },
          ...(account ? user : []),
        ],
      },
    ],
    chainId === ChainId.SPARK
      ? {
          multicallCustomContractAddress: '0xD38a6D91f9278a44161Ec6A02F7821d6b6f9Ec96',
          ethersProvider: sparkProvider,
        }
      : {},
    [blockNumber]
  )

  const hasEnded = get(results, '[0].result[0]')
  const hasStarted = get(results, '[1].result[0]')
  const startTime = get(results, '[2].result[0]')
  const endTime = get(results, '[3].result[0]')
  const projectToken = get(results, '[4].result[0]')
  const saleToken = get(results, '[5].result[0]')
  const snapshotTime = get(results, '[6].result[0]')
  const minSaleTokenReserve = get(results, '[7].result[0]')
  const maxSaleTokenReserve = get(results, '[8].result[0]')
  const vestingDays = get(results, '[9].result[0]')
  const projectTokenReserve = get(results, '[10].result[0]')
  const saleTokenReserve = get(results, '[11].result[0]')
  const tokensToDistribute = get(results, '[12].result[0]')
  const allocation = get(results, '[13].result[0]')
  const balance = get(results, '[14].result[0]')
  const hasClaimed = get(results, '[14].result[1]')
  const claimable = get(results, '[15].result[0]')

  const status = hasEnded ? LaunchStatus.Finalized : hasStarted ? LaunchStatus.Live : LaunchStatus.Upcoming

  const projectTokenAttr = useTokenV2(projectToken)
  const saleTokenAttr = useTokenV2(saleToken)

  const MIN_SALE_TOKEN_RESERVE = 30000
  const MAX_SALE_TOKEN_RESERVE = 50000
  const fusePrice = useFusePrice()
  const launch = useMemo(() => {
    return {
      contractAddress,
      status,
      hasEnded,
      hasStarted,
      startTime: startTime ? Number(startTime) : 0,
      endTime: endTime ? Number(endTime) : 0,
      snapshotTime: snapshotTime ? Number(snapshotTime) : 0,
      tokensToDistribute: tokensToDistribute ? formatUnits(tokensToDistribute, projectTokenAttr?.decimals) : 0,
      vestingDays: vestingDays ? Number(vestingDays) : 0,
      projectToken: projectTokenAttr,
      saleToken: saleTokenAttr,
      minSaleTokenReserve: saleTokenAttr && minSaleTokenReserve ? MIN_SALE_TOKEN_RESERVE : 0,
      saleTokenReserve:
        saleTokenAttr && saleTokenReserve
          ? parseFloat(formatUnits(saleTokenReserve, saleTokenAttr?.decimals)) * fusePrice
          : 0,
      maxSaleTokenReserve: saleTokenAttr && maxSaleTokenReserve ? MAX_SALE_TOKEN_RESERVE : 0,
      projectTokenReserve:
        projectTokenAttr && projectTokenReserve ? formatUnits(projectTokenReserve, projectTokenAttr?.decimals) : 0,
      user: {
        balance: balance ? formatUnits(balance, saleTokenAttr?.decimals) : 0,
        hasClaimed: hasClaimed,
        allocation: allocation ? formatUnits(allocation, saleTokenAttr?.decimals) : 0,
        claimable: claimable ? formatUnits(claimable, projectTokenAttr?.decimals) : 0,
      },

      content: {
        description: LAUNCH_DESCRIPTIONS[contractAddress]?.content,
        banner: LAUNCH_DESCRIPTIONS[contractAddress]?.banner,
      },
    }
  }, [
    contractAddress,
    status,
    hasEnded,
    hasStarted,
    startTime,
    endTime,
    snapshotTime,
    tokensToDistribute,
    projectTokenAttr,
    vestingDays,
    saleTokenAttr,
    minSaleTokenReserve,
    saleTokenReserve,
    fusePrice,
    maxSaleTokenReserve,
    projectTokenReserve,
    balance,
    allocation,
    hasClaimed,
    claimable,
  ])

  useEffect(() => {
    if (launch) {
      dispatch(addLaunch(launch))
    }
  }, [launch])
}

export default function Updater(): null {
  useLaunch('0x4a0ee18c54798b7c3d7e3d6919959f159359bbbe')

  return null
}
