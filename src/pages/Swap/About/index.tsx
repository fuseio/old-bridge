import { get } from 'lodash'
import { ArrowUpRight, Plus } from 'react-feather'
import { Card, Flex, Text } from 'rebass/styled-components'

import { useWeb3 } from '../../../hooks'
import { addTokenToWallet } from '../../../utils'
import { Hidden } from '../../../wrappers/Hidden'
import { IconButton } from '../../../wrappers/IconButton'
import useNativeCurrency from '../../../hooks/useNativeCurrency'
import { ComponentLoader } from '../../../wrappers/ComponentLoader'
import MultiCurrencyLogo from '../../../components/MultiCurrencyLogo'
import { useTokenMetadata } from '../../../hooks/metadata/useTokenMetadata'

import { ReactComponent as Telegram } from '../../../assets/svg/telegram-nobg.svg'

function addEllipses(str, maxLength) {
  if (!str) return str
  if (str?.length <= maxLength) return str
  return str?.slice(0, maxLength - 3) + '...'
}

const About = ({
  token0 = {
    symbol: 'FUSE',
  },
}: any) => {
  const { metadata, loading } = useTokenMetadata(token0)
  const { library } = useWeb3()

  return (
    <Card>
      <Flex flexDirection={'column'} sx={{ gap: 2 }}>
        <ComponentLoader width={150} loading={loading}>
          <Text fontSize={2} fontWeight={700}>
            About {get(metadata, 'name', '')}
          </Text>
        </ComponentLoader>
        <ComponentLoader height={120} width={'100%'} loading={loading}>
          {get(metadata, 'description', '').length !== 0 && (
            <Text pt={3} minHeight={60} fontSize={1}>
              <div
                style={{ lineHeight: 1.4 }}
                dangerouslySetInnerHTML={{ __html: get(metadata, 'description', '') }}
              ></div>
            </Text>
          )}
          {token0?.symbol !== 'FUSE' && (
            <Flex pt={3} sx={{ gap: 2 }} flexDirection={'column'}>
              <Text opacity={0.7} fontSize={0}>
                Contract
              </Text>
              <Flex sx={{ gap: 2 }} alignItems={'center'}>
                <MultiCurrencyLogo size={'18'} tokenAddresses={[token0?.address]} />
                <Flex sx={{ gap: 1 }} flexDirection={'column'}>
                  <Text fontSize={0}>{token0?.name}</Text>
                  <Hidden desktop>
                    <Text fontSize={0}>{addEllipses(token0?.address, 30)}</Text>
                  </Hidden>
                  <Hidden mobile tablet>
                    <Text fontSize={0}>{token0?.address}</Text>
                  </Hidden>
                </Flex>
              </Flex>
            </Flex>
          )}
        </ComponentLoader>
        <Flex pt={3} flexDirection={['column', 'column', 'row']} sx={{ gap: 2 }}>
          <Flex sx={{ gap: 2 }}>
            {get(metadata, 'links.website', '').length !== 0 && (
              <IconButton Icon={ArrowUpRight} to={get(metadata, 'links.website', '')} content="Website" />
            )}
            {get(metadata, 'links.twitter_username', '').length !== 0 && (
              <IconButton to={'https://twitter.com/' + get(metadata, 'links.twitter_username', '')} content="Twitter" />
            )}
          </Flex>
          <Flex sx={{ gap: 2 }}>
            {get(metadata, 'links.telegram', '').length !== 0 && (
              <IconButton to={get(metadata, 'links.telegram', '')} Icon={Telegram} content="Telegram" />
            )}

            {token0?.symbol !== useNativeCurrency().symbol && library && (
              <IconButton
                onClick={() => {
                  addTokenToWallet(token0, library)
                }}
                Icon={Plus}
                content={'Add Token'}
              />
            )}
          </Flex>
        </Flex>
      </Flex>
    </Card>
  )
}
export default About
