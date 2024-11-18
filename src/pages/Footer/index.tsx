import { Box, Button, Flex, Image, Text } from 'rebass/styled-components'

import Links from './Links'
import Subscribe from './Subscribe'
import Social from './Social'
import { VOLT } from '../../constants'
import { getAppleDownloadLink, getDownloadLink, getGoogleDownloadLink } from '../../utils'
import { VOLTAGE_FINANCE_LOGOS_URL } from '../../constants/lists'

import LogoIcon from '../../assets/svg/voltage-black.svg'
import AppStore from '../../assets/svg/app-store.svg'
import PlayStore from '../../assets/svg/play-store.svg'
import Telegram from '../../assets/svg/logos/telegram-dark.svg'
import Twitter from '../../assets/svg/logos/twitter-dark.svg'
import Medium from '../../assets/svg/logos/medium-dark.svg'
import Github from '../../assets/svg/logos/github-dark.svg'
import Discord from '../../assets/svg/logos/discord-dark.svg'
import Zealy from '../../assets/svg/logos/zealy-dark.svg'
import Docs from '../../assets/svg/logos/docs-dark.svg'

const Footer = ({ maxWidth = 1200 }: { maxWidth?: number }) => {
  return (
    <Box variant={'border'} as="footer">
      <Box px={3} py={[5, '80px']}>
        <Box maxWidth={maxWidth} mx="auto">
          <Flex
            sx={{
              flexDirection: ['column', 'row'],
              alignItems: 'flex start',
              justifyContent: 'space-between',
              gap: [4, 2],
            }}
          >
            <Flex
              sx={{
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '24px'
              }}
            >
              <Image width={125} src={LogoIcon} />
              <Flex
                sx={{
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <Button
                  variant='grayPrimary'
                  onClick={() => {
                    window.open(getDownloadLink(), '_blank')
                  }}
                >
                  Download now
                </Button>
                <Social href={getAppleDownloadLink()} src={AppStore} alt="Download from App Store" />
                <Social href={getGoogleDownloadLink()} src={PlayStore} alt="Download from Play Store" />
              </Flex>
              <Text as="p">
                © Voltage, Inc. 2024. All rights reserved.
              </Text>
            </Flex>
            <Flex flexDirection={['column', 'row']}>
              <Links
                columns={[
                  {
                    header: 'Resources',
                    data: [
                      {
                        name: 'Getting Started',
                        src: 'https://docs.voltage.finance/voltage/welcome/introduction',
                      },
                      {
                        name: 'Voltage Docs',
                        src: 'https://docs.voltage.finance/voltage/welcome/introduction',
                      },

                      {
                        name: 'Voltage Medium',
                        src: 'https://medium.com/@voltage.finance',
                      },
                      {
                        name: 'Brand Kit',
                        target: '_self',
                        src: 'https://dex-brand-kit.s3.eu-central-1.amazonaws.com/dex-brand-kit.zip',
                      },
                    ],
                  },
                  {
                    header: 'Developers',
                    data: [
                      {
                        name: 'The Volt app',
                        src: getDownloadLink(),
                      },
                      {
                        name: 'Add Volt Token',
                        onClick: async () => {
                          const tokenImage = `${VOLTAGE_FINANCE_LOGOS_URL}/0x34Ef2Cc892a88415e9f02b91BfA9c91fC0bE6bD4/logo.png`
                          try {
                            // wasAdded is a boolean. Like any RPC method, an error may be thrown.
                            const wasAdded = await window?.ethereum?.request({
                              method: 'wallet_watchAsset',
                              params: {
                                type: 'ERC20', // Initially only supports ERC20, but eventually more!
                                options: {
                                  address: VOLT?.address, // The address that the token is at.
                                  symbol: VOLT?.symbol, // A ticker symbol or shorthand, up to 5 chars.
                                  decimals: VOLT?.decimals, // The number of decimals in the token
                                  image: tokenImage, // A string url of the token logo
                                },
                              },
                            })

                            if (wasAdded) {
                              console.log('Thanks for your interest!')
                            } else {
                              console.log('Your loss!')
                            }
                          } catch (error) {
                            console.log(error)
                          }
                        },
                      },
                      {
                        name: 'Add Fuse RPC',
                        onClick: async () => {
                          try {
                            // wasAdded is a boolean. Like any RPC method, an error may be thrown.
                            const wasAdded = await window?.ethereum?.request({
                              method: 'wallet_addEthereumChain',
                              params: [
                                {
                                  chainId: '0x7a',
                                  chainName: 'Fuse Network',
                                  nativeCurrency: {
                                    name: 'Fuse',
                                    symbol: 'FUSE',
                                    decimals: 18,
                                  },
                                  rpcUrls: ['https://rpc.fuse.io/'],
                                  blockExplorerUrls: ['https://explorer.fuse.io/'],
                                },
                              ],
                            })

                            if (wasAdded) {
                              console.log('Thanks for your interest!')
                            } else {
                              console.log('Your loss!')
                            }
                          } catch (error) {
                            console.log(error)
                          }
                        },
                      },
                    ],
                  },
                  {
                    header: 'Support',
                    data: [
                      {
                        name: 'Contact Us',
                        src: 'https://mfvy5ryymkn.typeform.com/to/mhq6q5Xp',
                      },
                      {
                        name: 'Report an Issue',
                        src: 'https://forms.monday.com/forms/145ea41ff7c62f2fd14deb99908a7221?r=use1',
                      },
                    ],
                  },
                  {
                    header: 'Legal',
                    data: [
                      {
                        name: 'Privacy Policy',
                        src: 'https://docs.voltage.finance/voltage/volt-app/privacy-policy',
                      },
                      {
                        name: 'Terms and Conditions',
                        src: 'https://docs.voltage.finance/voltage/volt-app/terms-of-service',
                      },
                    ],
                  },
                ]}
              />
            </Flex>
          </Flex>
          <Flex
            sx={{
              flexDirection: ['column', 'row'],
              justifyContent: 'space-between',
              alignItems: 'center',
              mt: [4, 5],
              pt: [4, 5],
              gap: [4, 2]
            }}
            variant={'border'}
          >
            <Flex
              sx={{
                alignItems: 'center',
                gap: 4
              }}
            >
              <Text as="p">
                Join us at
              </Text>
              <Flex
                sx={{
                  alignItems: 'center',
                  gap: 3
                }}
              >
                <Social href="https://t.me/voltage_finance" src={Telegram} alt="Telegram" />
                <Social href="https://twitter.com/voltfinance" src={Twitter} alt="Twitter" />
                <Social href="https://medium.com/@voltage.finance" src={Medium} alt="Medium" />
                <Social href="https://github.com/voltfinance/" src={Github} alt="Github" />
                <Social href="https://discord.com/invite/dttGGSWSEk" src={Discord} alt="Discord" />
                <Social href="https://zealy.io/c/voltagefinance" src={Zealy} alt="Zealy" />
                <Social href="https://docs.voltage.finance/voltage/welcome/introduction" src={Docs} alt="Docs" />
              </Flex>
            </Flex>
            <Box maxWidth={[350, '100%']} width={['100%', 1 / 3]}>
              <Subscribe />
            </Box>
          </Flex>
        </Box>
      </Box>
    </Box>
  )
}
export default Footer
