import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { Card, Flex, Text } from 'rebass/styled-components'

import { useTokenPriceV2 } from '../../../../hooks/useUSDPrice'

const Price = () => {
  const params = useParams()
  const launches = useSelector((state: any) => state.launch.launches)

  const { saleTokenReserve, projectToken, tokensToDistribute, saleToken } = launches.find(
    (launch: any) => launch.contractAddress === (params as any).id
  )

  const [price, setPrice] = useState(0.0)
  const usdPrice = useTokenPriceV2(saleToken?.address)

  useEffect(() => {
    if (usdPrice !== 0 && saleTokenReserve !== 0 && tokensToDistribute !== 0) {
      setPrice((saleTokenReserve * usdPrice) / tokensToDistribute)
    }
  }, [usdPrice, saleTokenReserve])

  return (
    <Card width={'100%'} height={'100%'}>
      <Flex pb={2} px={[0, 0, 2]} pt={[0, 0, 2]} sx={{ gap: 2 }} flexDirection={'column'}>
        <Text fontSize={2} color="blk50">
          Price {projectToken?.symbol && `per ${projectToken?.symbol}`}
        </Text>
        <Text pt={1} fontWeight={600} fontSize={[5, 6]}>
          $0.025
        </Text>
      </Flex>
    </Card>
  )
}
export default Price
