import { Flex, Text } from 'rebass/styled-components'
import MultiCurrencyLogo from '../../../components/MultiCurrencyLogo'
import { ComponentLoader } from '../../../wrappers/ComponentLoader'
import { Hidden } from '../../../wrappers/Hidden'

const Title = ({ currencyA, currencyB }: any) => {
  return (
    <ComponentLoader height={50.4} width={200} loading={!currencyA || !currencyB}>
      <Flex alignItems={'center'} sx={{ gap: 2 }}>
        <MultiCurrencyLogo
          tokenAddresses={[
            currencyA?.symbol === 'FUSE' ? currencyA?.symbol : currencyA?.address,
            currencyB?.symbol === 'FUSE' ? currencyB?.symbol : currencyB?.address,
          ]}
        />

        <Flex sx={{ gap: 3 }} alignItems={'end'}>
          <Hidden mobile tablet>
            <Text fontSize={[4, 6]} fontWeight={600}>
              {currencyA?.name === 'VoltToken' ? 'Volt Token' : currencyA?.name || 'FUSE'}
            </Text>
          </Hidden>

          <Hidden desktop>
            <Text fontSize={[4, 6]} fontWeight={600}>
              {currencyA?.symbol || 'FUSE'}
            </Text>
          </Hidden>

          <Text fontSize={[4, 6]} fontWeight={600}>
            - {currencyB?.symbol || 'FUSE'}
          </Text>
        </Flex>
      </Flex>
    </ComponentLoader>
  )
}
export default Title
