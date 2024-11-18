import { ChainId } from '@voltage-finance/sdk-core'
import React, { useCallback } from 'react'
import { Text, Flex, Link, Box } from 'rebass/styled-components'
import { useWeb3 } from '../../hooks'
import useENS from '../../hooks/useENS'
import { getExplorerLink, getExplorerLinkText } from '../../utils'
import { Input } from '@rebass/forms/styled-components'
import { InputRow } from '../../wrappers/InputRow'

export default function AddressInputPanel({
  id,
  value,
  onChange,
  chainId,
  readOnly = false
}: {
  id?: string
  // the typed string value
  value: string
  // triggers whenever the typed value changes
  onChange: (value: string) => void
  chainId?: ChainId
  readOnly?: boolean
}) {
  const { chainId: activeChainId } = useWeb3()

  const { address, loading, name } = useENS(value)

  const handleInput = useCallback(
    event => {
      const input = event.target.value
      const withoutSpaces = input.replace(/\s+/g, '')
      onChange(withoutSpaces)
    },
    [onChange]
  )

  const error = Boolean(value.length > 0 && !loading && !address)
  const chain = chainId || activeChainId

  return (
    <Box id={id}>
      <Flex flexDirection={'column'} style={{ gap: '8px' }}>
        <Flex>
          <Text fontSize={1}>Recipient</Text>
          {address && chain && (
            <Link
              pl={1}
              onClick={() => {
                window.open(getExplorerLink(chain, name ?? address, 'address'))
              }}
              fontSize={1}
            >
              ({getExplorerLinkText(chain)})
            </Link>
          )}
        </Flex>
        <InputRow error={error}>
          <Input
            className="recipient-address-input"
            type="text"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            placeholder="Wallet Address or ENS name"
            color={'white'}
            pattern="^(0x[a-fA-F0-9]{40})$"
            onChange={handleInput}
            value={value}
            readOnly={readOnly}
          />
        </InputRow>
      </Flex>
    </Box>
  )
}
