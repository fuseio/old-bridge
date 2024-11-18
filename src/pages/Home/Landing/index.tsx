import { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { Box, Button, Flex, Text, Image } from 'rebass/styled-components'

import { WalletIcon } from '../../../components/Icons'
import { Statistic } from '../../../wrappers/Statistic'
import { useTVL } from '../../../hooks/analytics/useTvl'
import useTotalVolume from '../../../hooks/useTotalVolume'
import { useVoltTokenHolders } from '../../../hooks/useVoltTokenHolders'

import { GetAppButton } from '../../../components/Button/getApp'
import RotatingH1 from './rotatingH1'
import Image3D from './image3D'
import Menu from '../../../components/Menu'
import MobileNav from '../../../components/MobileNav'
import { Hidden } from '../../../wrappers/Hidden'

import LightLeft from '../../../assets/svg/landing/light-left.svg'
import LightRight from '../../../assets/svg/landing/light-right.svg'

// TODO: move these functions to utils
function formatNumber(value: number, upperCase = false): string {
  const suffixes = ['', 'k', 'm', 'b', 't']
  let suffixNum = 0
  let formattedValue = value

  while (formattedValue >= 1000) {
    formattedValue /= 1000
    suffixNum++
  }

  let formattedString = formattedValue.toFixed(2) + suffixes[suffixNum]
  if (upperCase) {
    formattedString = formattedValue.toFixed(2) + suffixes[suffixNum].toUpperCase()
  }
  return `$${formattedString}`
}

function formatNumberWithCommas(value: number): string {
  return new Intl.NumberFormat('en-US').format(value)
}

export default function Landing() {
  const [stats, setStats] = useState(null)

  const v2TVL = useTVL(7, null, 'v2')
  const v3TVL = useTVL(7, null, 'v3')

  const history = useHistory()
  const totalVolumeUSD = useTotalVolume()
  const voltTokenHolders = useVoltTokenHolders()

  useEffect(() => {
    let formattedTotalVolume
    let formattedTotalHolders
    let formattedTotalLiquidity

    if (totalVolumeUSD) {
      formattedTotalVolume = formatNumber(totalVolumeUSD, true)
    }

    if (voltTokenHolders) {
      formattedTotalHolders = formatNumberWithCommas(voltTokenHolders)
    }

    if (v2TVL && v2TVL.length > 0 && v3TVL && v3TVL.length > 0) {
      const totalLiquidityUSDv2 = v2TVL[v2TVL.length - 1]?.totalLiquidityUSD
      const totalLiquidityUSDv3 = v3TVL[v3TVL.length - 1]?.totalLiquidityUSD
      const totalLiquidityUSD = totalLiquidityUSDv2 + totalLiquidityUSDv3

      formattedTotalLiquidity = formatNumber(totalLiquidityUSD, true)
    }

    if (formattedTotalLiquidity && formattedTotalVolume && formattedTotalHolders) {
      setStats({
        formattedTotalVolume: totalVolumeUSD,
        formattedTotalHolders,
        formattedTotalLiquidity,
      })
    }
  }, [v2TVL, v3TVL])

  return (
    <Box
      bg="blk90"
      sx={{
        backgroundImage: ['none', `url('/images/landing/hero-background.png')`],
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        overflow: 'hidden',
      }}
      as="section"
    >
      <Menu />
      <MobileNav />

      <Flex
        sx={{
          position: 'relative',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '48px',
          '*': {
            color: 'white',
          },
        }}
      >
        <Image
          src={LightLeft}
          alt=""
          sx={{
            display: ['none', 'block'],
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 2,
            opacity: 0.8,
          }}
        />
        <Image
          src={LightRight}
          alt=""
          sx={{
            display: ['none', 'block'],
            position: 'absolute',
            top: 0,
            right: 0,
            zIndex: 2,
          }}
        />
        <Flex
          maxWidth={'1200px'}
          mx="auto"
          sx={{
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '48px',
            maxWidth: '1200px',
            mx: 'auto',
            px: 3,
            pt: [5, '100px'],
            zIndex: 3,
          }}
        >
          <Box>
            <Text fontWeight={700} fontSize={['48px', '70px']} maxWidth={'900px'} as="h1">
              A Wallet for your everyday
              <RotatingH1 />
            </Text>
          </Box>
          <Text fontSize={'20px'} color={'white'} fontWeight={500} maxWidth={'400px'} opacity={0.5} as="p">
            The crypto-powered SuperApp replacing your bank.
          </Text>
          <Flex
            sx={{
              gap: '16px',
              flexDirection: ['column', 'row'],
            }}
          >
            <GetAppButton name="Get the App" variant={'greenPrimary'} sx={{ fontSize: 3, py: '12px', px: 4 }} />
            <Button
              variant="greenSecondary"
              sx={{ fontSize: 3, py: '12px', px: 4 }}
              onClick={() => {
                history.push('/swap')
              }}
            >
              <Flex alignItems={'center'} style={{ gap: '10px', color: 'inherit' }}>
                Start Trading
                <WalletIcon />
              </Flex>
            </Button>
          </Flex>
        </Flex>
        <Hidden tablet mobile>
          <Image3D />
        </Hidden>
      </Flex>

      <Flex
        sx={{
          position: 'relative',
          flexDirection: ['column', 'row'],
          alignItems: 'center',
          gap: [4, '40px'],
          justifyContent: ['center', 'space-between'],
          textAlign: ['center', 'left'],
          zIndex: 3,
          color: 'white',
          maxWidth: '800px',
          px: 3,
          pb: [5, '100px'],
          mt: [4, 40],
          mx: 'auto',
          '*': {
            color: 'white',
          },
        }}
      >
        <Statistic amount={22154595} label="Gas Saved" prefix="$" />
        <Statistic amount={6297103} label="Transactions" />
        <Statistic loading={!stats} amount={stats?.formattedTotalVolume ?? 0} label="Total Volume" prefix="$" />
      </Flex>
      <Hidden desktop>
        <Image3D />
      </Hidden>
    </Box>
  )
}
