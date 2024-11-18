import { useSelector } from 'react-redux'
import { Box, Button, Flex, Image, Text } from 'rebass/styled-components'

import Table from '../../../components/Table'
import { PAIR_VERSION } from '../../../state/pool/updater'
import { appendV2, calculateGasMargin, formatFeeAmount, formatSignificant } from '../../../utils'
import MultiCurrencyLogo from '../../../components/MultiCurrencyLogo'

import BoostedRewardsBolt from '../../../assets/svg/pool/boosted-rewards-bolt.svg'
import Card from '../../../collections/Card'
import { useCallback, useEffect, useState } from 'react'
import { formatUnits } from 'ethers/lib/utils'
import { useWeb3 } from '../../../hooks'
import { useTransactionAdder } from '../../../state/transactions/hooks'
import { useMerklDistributorContract } from '../../../hooks/useContract'
import { claimUserMerklRewards } from '../../../hooks/useMerklApi'

const textFontSize = ['10px', '12px', '14px']

const getMyPositionsColumn = () => {
  const column = [
    {
      Header: () => (
        <Text textAlign={'left'} fontSize={textFontSize}>
          Name
        </Text>
      ),
      id: 'name',
      width: [10 / 16, 13 / 16],
      accessor: ({ token0, token1, version, feeTier }) => {
        const multiLogos = (
          <>
            <Box display={['none', 'block']}>
              <MultiCurrencyLogo size={'30'} tokenAddresses={[token0?.id || '', token1?.id || '']} />
            </Box>
            <Box display={['block', 'none']}>
              <MultiCurrencyLogo size={'21'} tokenAddresses={[token0?.id || '', token1?.id || '']} />
            </Box>
          </>
        )

        const token0Name = appendV2(token0?.id, token0?.symbol)
        const token1Name = appendV2(token1?.id, token1?.symbol)

        const nameDesktop = (
          <Text fontSize={textFontSize}>
            {token0Name}
            <Text as="span" color={'gray100'}>
              {' '}
              /{' '}
            </Text>
            {token1Name}
          </Text>
        )

        const nameMobile =
          token0Name.length > 6 || token1Name.length > 6 ? (
            <>
              <Text fontSize={textFontSize}>
                {token0Name}
                <Text fontSize={textFontSize} as="span" color={'gray100'}>
                  {' '}
                  /{' '}
                </Text>
              </Text>

              <Text fontSize={textFontSize}>{token1Name} </Text>
            </>
          ) : (
            <Text fontSize={textFontSize}>
              {token0Name}
              <Text as="span" color={'gray100'}>
                {' '}
                /{' '}
              </Text>
              {token1Name}
            </Text>
          )

        const name = (
          <>
            <Box display={['none', 'block']} sx={{ textAlign: 'center' }}>
              {nameDesktop}
            </Box>
            <Box display={['block', 'none']} sx={{ textAlign: 'center' }}>
              {nameMobile}
            </Box>
          </>
        )

        const versionTag = (
          <Box
            px={2}
            py={1}
            fontSize={textFontSize}
            sx={{ borderRadius: '5px' }}
            bg={version === PAIR_VERSION.V3 ? 'green100' : 'gray70'}
            color={version === PAIR_VERSION.V3 ? 'green900' : 'primary'}
          >
            {version === PAIR_VERSION.V3 ? 'V3' : 'V2'}
          </Box>
        )

        const feePercentage = version === PAIR_VERSION.V3 && (
          <Box sx={{ borderRadius: '5px' }} fontSize={textFontSize} px={2} py={1} bg="gray70" color={'primary'}>
            {formatFeeAmount(feeTier)}%
          </Box>
        )

        return (
          <Flex sx={{ gap: ['5px', '8px'] }} alignItems={'center'}>
            {multiLogos}
            {name}
            {versionTag}
            {feePercentage}
            <Image
              src={BoostedRewardsBolt}
              sx={{
                height: ['20px'],
              }}
            />
          </Flex>
        )
      },
    },
    {
      Header: () => (
        <Text pl={3} textAlign={['left', 'center']} fontSize={textFontSize}>
          Rewards
        </Text>
      ),
      // Build our expander column
      id: 'expander', // Make sure it has an ID
      width: [6 / 16, 3 / 16],
      accessor: ({ unclaimed, decimals, token }) => {
        return (
          <>
            <Box pl={3} fontSize={textFontSize} display={['none', 'block']} sx={{ textAlign: ['left', 'center'] }}>
              {formatSignificant({ value: formatUnits(unclaimed, decimals) })} {token}
            </Box>
            <Box pl={3} fontSize={textFontSize} display={['block', 'none']} sx={{ textAlign: ['left', 'center'] }}>
              {formatSignificant({ value: formatUnits(unclaimed, decimals) })} {token}
            </Box>
          </>
        )
      },
    },
  ]

  return column
}

export default function BoostedRewards() {
  const [data, setData] = useState([])
  const { library, account } = useWeb3()
  const myPairColumn = getMyPositionsColumn()
  const addTransaction = useTransactionAdder()
  const { pairs } = useSelector((state: any) => state?.pool)
  const merklDistributorContract = useMerklDistributorContract()
  const merklPairs = useSelector((state) => (state as any).pool.userMerklPairs)

  useEffect(() => {
    const data = merklPairs.map((position) => {
      const pool = pairs.find((pair) => pair.id === position.mainParameter)
      return {
        ...position,
        ...pool,
        token: position.symbol,
      }
    })
    setData(data.filter((d) => d.unclaimed !== '0'))
  }, [merklPairs, pairs])

  const onClaim = useCallback(async () => {
    if (!account || !library || !merklDistributorContract) {
      return
    }

    const data = await claimUserMerklRewards(account)
    const tokens = Object.keys(data).filter((k) => data[k].proof !== undefined || data[k].proof.length !== 0)
    const claims = tokens.map((t) => data[t].accumulated)
    const proofs = tokens.map((t) => data[t].proof)
    const txData = await merklDistributorContract.populateTransaction.claim(
      tokens.map((t) => account),
      tokens,
      claims,
      proofs as string[][]
    )

    const txn = {
      to: merklDistributorContract.address,
      data: txData.data,
      value: 0,
    }

    library
      .getSigner()
      .estimateGas(txn)
      .then((estimate) => {
        const newTxn = {
          ...txn,
          gasLimit: calculateGasMargin(estimate),
        }

        return library
          .getSigner()
          .sendTransaction(newTxn)
          .then((response) => {
            addTransaction(response, {
              summary: 'Claimed boosted rewards',
            })
          })
      })
  }, [account, addTransaction, library])

  if (!data || data?.length === 0) {
    return (
      <Box minHeight={200} fontSize={textFontSize} textAlign={'center'} pt={70}>
        {"You don't have any positions."}
      </Box>
    )
  }

  return (
    <>
      <Card p={['20px', 4]} bg="secondary" mb={[50, 80, 50]}>
        <Flex
          mt={[3, 0]}
          height={'100%'}
          sx={{ gap: [4, 1] }}
          justifyContent={'space-between'}
          flexDirection={['column', 'row']}
        >
          <Flex sx={{ gap: 3 }} justifyContent={'center'} alignItems={['left', 'center']}>
            <Image
              src={BoostedRewardsBolt}
              sx={{
                minHeight: ['49px', '58px'],
              }}
            />

            <Text mb={1} color={'white'} fontWeight={600} fontSize={['22px', '22px']}>
              Boosted Rewards
            </Text>
          </Flex>

          <Flex alignItems={'center'} justifyContent={'center'}>
            <Button
              sx={{
                bg: 'highlight',
                justifyContent: 'center',
                height: ['45px', '53px'],
                width: ['100%', '214px'],
              }}
              onClick={() => onClaim()}
            >
              <Text color={'black'} fontSize={['16px', '16px']}>
                Claim all rewards
              </Text>
            </Button>
          </Flex>
        </Flex>
      </Card>

      <Table columns={myPairColumn} data={data} />
    </>
  )
}
