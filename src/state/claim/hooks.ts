import { Currency, CurrencyAmount } from '@voltage-finance/sdk-core'
import JSBI from 'jsbi'
import { useEffect, useState } from 'react'
import { VOLT } from '../../constants'
import { useWeb3 } from '../../hooks'
import { useMerkleDistributorContract } from '../../hooks/useContract'
import { calculateGasMargin, isAddress } from '../../utils'
import { useSingleCallResult } from '../multicall/hooks'
import { useTransactionAdder } from '../transactions/hooks'

interface UserClaimData {
  index: number
  amount: string
  proof: string[]
}

type LastAddress = string
type ClaimAddressMapping = { [firstAddress: string]: LastAddress }
let FETCH_CLAIM_MAPPING_PROMISE: Promise<ClaimAddressMapping> | null = null
function fetchClaimMapping(): Promise<ClaimAddressMapping> {
  return (
    FETCH_CLAIM_MAPPING_PROMISE ??
    (FETCH_CLAIM_MAPPING_PROMISE = fetch(
      'https://mkrl-drop-data-chunks.s3.eu-central-1.amazonaws.com/chunks/mapping.json'
    )
      .then(res => res.json())
      .catch(error => {
        console.error('Failed to get claims mapping', error)
        FETCH_CLAIM_MAPPING_PROMISE = null
      }))
  )
}

const FETCH_CLAIM_FILE_PROMISES: { [startingAddress: string]: Promise<{ [address: string]: UserClaimData }> } = {}
function fetchClaimFile(key: string): Promise<{ [address: string]: UserClaimData }> {
  return (
    FETCH_CLAIM_FILE_PROMISES[key] ??
    (FETCH_CLAIM_FILE_PROMISES[key] = fetch(
      `https://mkrl-drop-data-chunks.s3.eu-central-1.amazonaws.com/chunks/${key}.json`
    )
      .then(res => res.json())
      .catch(error => {
        console.error(`Failed to get claim file mapping for starting address ${key}`, error)
        delete FETCH_CLAIM_FILE_PROMISES[key]
      }))
  )
}

const FETCH_CLAIM_PROMISES: { [key: string]: Promise<UserClaimData> } = {}
async function fetchClaim(account: string): Promise<UserClaimData | null> {
  const formattedAccount = isAddress(account)
  if (!formattedAccount) return null

  return (
    FETCH_CLAIM_PROMISES[account] ??
    (FETCH_CLAIM_PROMISES[account] = fetchClaimMapping()
      .then(mapping => {
        const sorted = Object.keys(mapping).sort((a, b) => (a.toLowerCase() < b.toLowerCase() ? -1 : 1))

        for (const startingAddress of sorted) {
          const lastAddress = mapping[startingAddress]
          if (startingAddress.toLowerCase() <= formattedAccount.toLowerCase()) {
            if (formattedAccount.toLowerCase() <= lastAddress.toLowerCase()) {
              return startingAddress
            }
          } else {
            throw new Error(`Claim for ${formattedAccount} was not found in partial search`)
          }
        }
        throw new Error(`Claim for ${formattedAccount} was not found after searching all mappings`)
      })
      .then(fetchClaimFile)
      .then(result => {
        if (result[formattedAccount]) return result[formattedAccount]
        throw new Error('Claim fetch failed')
      })
      .catch(error => {
        console.debug('Claim fetch failed', error)
        throw error
      }))
  )
}

export function useUserClaimData(account: string | null | undefined): UserClaimData | null | undefined {
  const [claimInfo, setClaimInfo] = useState<{ [key: string]: UserClaimData }>({})

  useEffect(() => {
    if (!account) return

    fetchClaim(account)
      .then(accountClaimInfo => {
        if (accountClaimInfo) {
          setClaimInfo(claimInfo => {
            return {
              ...claimInfo,
              [account]: accountClaimInfo
            }
          })
        }
      })
      .catch(error => {
        console.error(error)
      })
  }, [account])

  return account ? claimInfo[account] : undefined
}

export function useUserHasAvailableClaim(account: string | null | undefined): boolean {
  const userClaimData = useUserClaimData(account)
  const distributorContract = useMerkleDistributorContract()
  const isClaimedResult = useSingleCallResult(distributorContract, 'isClaimed', [userClaimData?.index])
  return Boolean(userClaimData && !isClaimedResult.loading && isClaimedResult.result?.[0] === false)
}

export function useUserUnclaimedAmount(account: string | null | undefined): CurrencyAmount<Currency> | undefined {
  const userClaimData = useUserClaimData(account)
  const canClaim = useUserHasAvailableClaim(account)

  return !canClaim || !userClaimData
    ? CurrencyAmount.fromRawAmount(VOLT, JSBI.BigInt(0))
    : CurrencyAmount.fromRawAmount(VOLT, JSBI.BigInt(userClaimData.amount))
}

export function useClaimCallback(account: string | null | undefined): () => Promise<string> {
  const { library } = useWeb3()
  const claimData = useUserClaimData(account)

  const unClaimedAmount = useUserUnclaimedAmount(account)
  const addTransaction = useTransactionAdder()
  const distributionContract = useMerkleDistributorContract()

  const claimCallback = async function() {
    if (!claimData || !account || !library || !distributionContract) return

    const args = [claimData.index, account, claimData.amount, claimData.proof]

    const estimatedGasLimit = await distributionContract.estimateGas['claim'](...args, {})
    const response = await distributionContract.claim(...args, {
      value: null,
      gasLimit: calculateGasMargin(estimatedGasLimit)
    })

    addTransaction(response, {
      summary: `Claimed ${unClaimedAmount?.toSignificant(4)} VOLT`
    })

    return response.hash
  }

  return claimCallback
}
