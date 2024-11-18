import { gql } from '@apollo/client'
import { useEffect, useMemo, useState } from 'react'
import { Currency, CurrencyAmount } from '@voltage-finance/sdk-core'

import { voltageSubgraphClient, voltageSubgraphV3Client } from '../graphql/client'
import { getFusePrice } from '../graphql/queries'

async function getEthTokenV2Price(address: string) {
  if (!address) return 0

  const response = await voltageSubgraphClient.query({
    query: gql`
        {
            token(id: "${address.toLowerCase()}") {
                derivedETH
            }
        }
    `,
  })

  return response?.data ? response?.data?.token?.derivedETH : 0
}

async function getTokenPriceV2(address: string) {
  if (!address) return 0

  const fusePrice = await getFusePrice()
  const tokenFusePrice = await getEthTokenV2Price(address)

  return fusePrice * tokenFusePrice
}

export async function getTokenPriceV3(address: string) {
  if (!address) return 0

  const response = await voltageSubgraphV3Client.query({
    query: gql`
        {
            token(id: "${address.toLowerCase()}") {
                derivedUSD
            }
        }
    `,
  })

  return response?.data ? Number(response?.data?.token?.derivedUSD) : 0
}

export function useTokenPriceV2(address: string): number {
  const [tokenPrice, setTokenPrice] = useState(0)

  useEffect(() => {
    async function fetchData() {
      let tokenPrice = await getTokenPriceV3(address)
      if (!tokenPrice || isNaN(tokenPrice)) {
        tokenPrice = await getTokenPriceV2(address)
      }

      if (typeof tokenPrice === 'number') {
        if (tokenPrice === 0) {
          setTokenPrice(0)
        } else {
          setTokenPrice(tokenPrice)
        }
      }
    }

    fetchData()
  }, [address])

  return tokenPrice
}

export default function useCurrencyAmountUSD(currencyAmount?: CurrencyAmount<Currency>) {
  const [usdPrice, setUsdPrice] = useState(0)

  const tokenAddress = useMemo(() => currencyAmount?.currency?.wrapped?.address, [currencyAmount?.currency?.wrapped])
  const amount = useMemo(() => (currencyAmount ? Number(currencyAmount.toSignificant()) : 0), [currencyAmount])

  useEffect(() => {
    async function fetchData() {
      let tokenPrice = await getTokenPriceV3(tokenAddress)
      if (!tokenPrice || isNaN(tokenPrice)) {
        tokenPrice = await getTokenPriceV2(tokenAddress)
      }

      if (typeof tokenPrice === 'number' && typeof amount === 'number') {
        if (tokenPrice === 0 && amount === 0) {
          setUsdPrice(0)
        } else {
          setUsdPrice(tokenPrice * amount)
        }
      }
    }

    fetchData()
  }, [amount, tokenAddress])

  return usdPrice
}
