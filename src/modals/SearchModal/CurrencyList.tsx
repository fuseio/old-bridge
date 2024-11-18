import { Currency, Token } from '@voltage-finance/sdk-core'
import { Box, Flex, Link, Text } from 'rebass/styled-components'
import styled from 'styled-components'
import CurrencyLogo from '../../components/Logo/CurrencyLogo'
import Loader from '../../components/Loaders/default'
import { MouseoverTooltip } from '../../components/Tooltip'
import { BNB, FUSE } from '../../data/Currency'
import { useChain, useWeb3 } from '../../hooks'
import { useIsUserAddedToken } from '../../hooks/Tokens'
import { useSelectedBridgeTokenList, useSelectedSwapTokenList, WrappedTokenInfo } from '../../state/lists/hooks'
import { useAddUserToken, useRemoveUserAddedToken } from '../../state/user/hooks'
import { useCurrencyBalance } from '../../state/wallet/hooks'
import { formatSignificant, getCurrencySymbol, isTokenOnList } from '../../utils'

const currencyKey = (currency: Currency) => currency.isToken ? currency.address : currency.symbol

const Tag = styled.div`
  background-color: ${({ theme }) => theme.bg3};
  color: ${({ theme }) => theme.text2};
  font-size: 14px;
  border-radius: 4px;
  padding: 0.25rem 0.3rem 0.25rem 0.3rem;
  max-width: 6rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  justify-self: flex-end;
  margin-right: 4px;
`

const TagContainer = styled.div`
  display: flex;
  justify-content: flex-end;
`

function TokenTags({ currency }: { currency: Currency }) {
  if (!(currency instanceof WrappedTokenInfo)) {
    return <span />
  }

  const tags = currency.tags
  if (!tags || tags.length === 0) return <span />

  const tag = tags[0]

  return (
    <TagContainer>
      <MouseoverTooltip text={tag.description}>
        <Tag key={tag.id}>{tag.name}</Tag>
      </MouseoverTooltip>
      {tags.length > 1 ? (
        <MouseoverTooltip
          text={tags
            .slice(1)
            .map(({ name, description }) => `${name}: ${description}`)
            .join('; \n')}
        >
          <Tag>...</Tag>
        </MouseoverTooltip>
      ) : null}
    </TagContainer>
  )
}

function CurrencyRow({
  currency,
  onSelect,
  isSelected,
  listType,
}: {
  currency: Currency
  onSelect: () => void
  isSelected: boolean
  otherSelected: boolean
  listType: CurrencyListType
  isBnbList?: boolean
}) {
  const { account, chainId } = useWeb3()
  const useSelectedTokenList = listType === 'Swap' ? useSelectedSwapTokenList : useSelectedBridgeTokenList
  const selectedTokenList = useSelectedTokenList()
  const isOnSelectedList = isTokenOnList(selectedTokenList, currency)
  const customAdded = useIsUserAddedToken(currency)
  const balance = useCurrencyBalance(account ?? undefined, currency)

  const removeToken = useRemoveUserAddedToken()
  const addToken = useAddUserToken()

  // only show add or remove buttons if not on selected list
  return (
    <Flex
      className={`token-item-${currencyKey(currency)}`}
      px={2}
      py={2}
      my={2}
      onClick={() => (isSelected ? null : onSelect())}
      sx={{
        borderRadius: 'default',
        ':hover': {
          background: '#F7F7F8',
          transition: 'background 300ms ease-in-out',
        },
      }}
      justifyContent={'space-between'}
      width={'100%'}
    >
      <Flex sx={{ gap: 3 }} alignItems={'center'}>
        <CurrencyLogo currency={currency} size={'32px'} />

        <Flex flexDirection={'column'}>
          <Text fontWeight={500}>{currency?.name}</Text>

          <Flex alignItems={'center'} fontSize={0} pt={1} fontWeight={400} sx={{ gap: 2 }} flexDirection={'row'}>
            <Text>{getCurrencySymbol(currency, chainId)}</Text>
            {!isOnSelectedList && customAdded ? (
              <Flex sx={{ gap: 1 }} alignItems={'center'}>
                <Text>Added by user</Text>
                <Link
                  onClick={(event) => {
                    event.stopPropagation()
                    if (chainId && currency instanceof Token) removeToken(chainId, currency.address)
                  }}
                >
                  (Remove)
                </Link>
              </Flex>
            ) : null}
            {!isOnSelectedList && !customAdded ? (
              <Flex sx={{ gap: 1 }} alignItems={'center'}>
                <Text>Found by address</Text>
                <Link
                  onClick={(event) => {
                    event.stopPropagation()
                    if (currency instanceof Token) addToken(currency)
                  }}
                >
                  (Add)
                </Link>
              </Flex>
            ) : null}
            {/* {isDeprecated ? <Text fontWeight={500}>Click to Migrate</Text> : null} */}
          </Flex>
        </Flex>
      </Flex>

      <TokenTags currency={currency} />
      {balance && parseFloat(balance?.toSignificant(4)) !== 0 && (
        <Flex alignItems={'end'} flexDirection={'column'}>
          <Text fontSize={0} color="blk50" fontWeight={500}>
            Balance
          </Text>
          {balance ? (
            <Text>
              {formatSignificant({
                value: balance?.toSignificant(18),
              })}
            </Text>
          ) : account ? (
            <Loader />
          ) : null}
        </Flex>
      )}
    </Flex>
  )
}

export default function CurrencyList({
  currencies,
  selectedCurrency,
  onCurrencySelect,
  otherCurrency,
  showETH,
  listType,
}: any) {
  const { isBsc } = useChain()

  const currencyList = showETH ? [isBsc ? BNB : FUSE, ...currencies] : currencies

  return (
    <Box sx={{ overflow: 'scroll', overflowX: 'hidden' }} height={420}>
      {currencyList.map((currency: Currency) => {
        const isSelected = Boolean(selectedCurrency && selectedCurrency.equals(currency))
        const otherSelected = Boolean(otherCurrency && otherCurrency.equals(currency))

        return (
          <Box px={2} sx={{ cursor: 'pointer' }} key={currencyKey(currency)}>
            <CurrencyRow
              currency={currency}
              isSelected={isSelected}
              onSelect={() => onCurrencySelect(currency)}
              otherSelected={otherSelected}
              listType={listType}
            />
          </Box>
        )
      })}
    </Box>
  )
}
