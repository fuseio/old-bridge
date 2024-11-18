import { diffTokenLists } from '@fuseio/token-lists'
import { useCallback, useMemo } from 'react'
import { Minus, Plus } from 'react-feather'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import { Box, Button, Flex, Text } from 'rebass/styled-components'
import styled from 'styled-components'
import useAnalytics from '../../hooks/useAnalytics'
import { AppDispatch } from '../../state'
import { acceptListUpdate } from '../../state/lists/actions'
import listVersionLabel from '../../utils/listVersionLabel'

export const Item = styled('li')`
  cursor: pointer;
  color: ${({ theme }) => theme.secondary4};
  font-size: 14px;
  font-weight: 500;
`
export default function ListUpdatePopup({ toastId, content }: { toastId: string; content: any }) {
  const {
    listUpdate: { listUrl, oldList, newList, auto, listType },
  } = content

  const removeThisPopup = useCallback(() => toast.dismiss(toastId), [toastId])
  const dispatch = useDispatch<AppDispatch>()
  const { sendEvent } = useAnalytics()

  const handleAcceptUpdate = useCallback(() => {
    if (auto) return
    dispatch(acceptListUpdate({ url: listUrl, listType }))
    removeThisPopup()
  }, [auto, sendEvent, listUrl, dispatch, listType, removeThisPopup])

  const {
    added: tokensAdded,
    changed: tokensChanged,
    removed: tokensRemoved,
  } = useMemo(() => {
    return diffTokenLists(oldList.tokens, newList.tokens)
  }, [newList.tokens, oldList.tokens])
  const numTokensChanged = useMemo(
    () =>
      Object.keys(tokensChanged).reduce((memo, chainId: any) => memo + Object.keys(tokensChanged[chainId]).length, 0),
    [tokensChanged]
  )
  return (
    <Box>
      {auto ? (
        <Text fontSize={2}>
          The token list &quot;{oldList.name}&quot; has been updated to{' '}
          <strong>{listVersionLabel(newList.version)}</strong>.
        </Text>
      ) : (
        <Flex flexDirection="column">
          <Box>
            <Text fontSize={2}>
              An update is available for the token list &quot;{oldList.name}&quot; ({listVersionLabel(oldList.version)}{' '}
              to {listVersionLabel(newList.version)}).
            </Text>
            <Flex sx={{ gap: 1 }} flexDirection={'column'} py={2}>
              {tokensAdded.map((token, i) => (
                <Flex color="primary" key={i} justifyContent={'space-between'} alignItems={'center'}>
                  <Text fontWeight={600} key={i} fontSize={0}>
                    {token?.symbol}
                  </Text>
                  <Plus size={14} />
                </Flex>
              ))}

              {tokensRemoved.map((token, i) => (
                <Flex color="white" key={i} justifyContent={'space-between'} alignItems={'center'}>
                  <Text fontWeight={600} key={i} fontSize={0}>
                    {token?.symbol}
                  </Text>
                  <Minus size={14} />
                </Flex>
              ))}

              {numTokensChanged > 0 && <Text fontSize={0}>{numTokensChanged} tokens updated</Text>}
            </Flex>
          </Box>
          <Flex sx={{ gap: 2 }}>
            <Button bg="primary" color="background" variant="tertiary" onClick={handleAcceptUpdate} width={'auto'}>
              Accept
            </Button>

            <Button onClick={removeThisPopup} variant="tertiary" width={'auto'}>
              Dismiss
            </Button>
          </Flex>
        </Flex>
      )}
    </Box>
  )
}
