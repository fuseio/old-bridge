import { useEffect, useState } from 'react'
import { Currency, Token } from '@voltage-finance/sdk-core'

import tokenMetadataList from './tokenList.json'

export const useTokenMetadata = (token: Token | Currency) => {
  const [metadata, setMetaData] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const handleTokenMetadata = () => {
      setLoading(true)

      const tokenMetadata = tokenMetadataList.find(({ symbol }) => symbol.toLowerCase() === token?.symbol.toLowerCase())

      if (tokenMetadata) {
        setMetaData(tokenMetadata)
      } else {
        setMetaData({})
      }

      setLoading(false)
    }

    handleTokenMetadata()
  }, [token])

  return { metadata, loading }
}
