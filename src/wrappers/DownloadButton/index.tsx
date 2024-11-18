import { useState } from 'react'
import QRCode from 'react-qr-code'
import { useHistory } from 'react-router-dom'
import { isDesktop } from 'react-device-detect'
import { isMobile, isTablet } from 'react-device-detect'
import { Image, Box, Card, Flex, Text } from 'rebass/styled-components'

import { preset } from '../../theme/preset'
import { getDownloadLink } from '../../utils'

import AppleSVG from '../../assets/svg/logos/apple.svg'
import GoogleSVG from '../../assets/svg/logos/google.svg'

interface DownloadButtonProps {
  noBorder?: boolean
  onClick?: any
  showQr?: boolean
}

export const DOWNLOAD_LINKS = {
  apple: {
    desktopUrl: ' https://apps.apple.com/us/app/volt-defi/id6444159237',
    mobileUrl: 'https://get.voltage.finance/gBMb',
    text: 'Apple Store',
  },
  google: {
    desktopUrl: 'https://play.google.com/store/apps/details?id=finance.voltage.app',
    mobileUrl: 'https://get.voltage.finance/gBMb',
    text: 'Google Store',
  },
}

export const DownloadButton = ({ noBorder, onClick, showQr = true }: DownloadButtonProps) => {
  const history = useHistory()
  const [hover, setHover] = useState(false)

  return (
    <Box
      width={75}
      height={35.2}
      sx={{
        zIndex: 2,
        position: 'relative',
        cursor: 'pointer',
        border: noBorder ? 'none' : `1px solid ${preset.colors.blk70}`,
        borderRadius: 'default',
        '&:hover': {
          background: 'white',
        },
      }}
      alignItems={'center'}
      onMouseLeave={() => {
        setHover(false)
      }}
      onMouseEnter={() => {
        setHover(true)
      }}
      onClick={() => {
        history.push('/mobile')
      }}
    >
      <Image
        onClick={() => {
          if (onClick) {
            return onClick()
          }

          if (isMobile || isTablet) {
            window.open(DOWNLOAD_LINKS.apple.mobileUrl, '_blank')
          } else {
            window.open(DOWNLOAD_LINKS.apple.desktopUrl, '_blank')
          }
        }}
        size={20}
        sx={{
          position: 'absolute',
          top: '6px',
          left: '12px',
        }}
        src={AppleSVG}
      />

      <Image
        size={18}
        onClick={() => {
          if (onClick) {
            return onClick()
          }

          if (isMobile || isTablet) {
            window.open(DOWNLOAD_LINKS.google.mobileUrl, '_blank')
          } else {
            window.open(DOWNLOAD_LINKS.google.desktopUrl, '_blank')
          }
        }}
        sx={{
          position: 'absolute',
          right: '12px',
          top: '8px',
        }}
        src={GoogleSVG}
      />

      {showQr && hover && isDesktop && (
        <Box sx={{ bg: 'transparent', position: 'absolute', zIndex: 1, paddingTop: 35 }} width={75} height={43}>
          <Card
            onMouseLeave={() => {
              setHover(false)
            }}
            onMouseEnter={() => {
              setHover(true)
            }}
            onClick={() => {
              history.push('/mobile')
            }}
            mt={2}
            sx={{ position: 'absolute', right: '0px', borderRadius: '12px', border: '1px solid #E1E1E1' }}
          >
            <Flex flexDirection={'column'}>
              <QRCode size={162} value={getDownloadLink()} />
              <Text mt={3} textAlign={'center'} fontSize={0} fontWeight={600}>
                Scan QR to Download The Volt App
              </Text>
            </Flex>
          </Card>
        </Box>
      )}
    </Box>
  )
}
