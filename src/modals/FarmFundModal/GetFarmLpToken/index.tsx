import { ChevronLink } from '../../../wrappers/ChevronLink'
import { XVOLT_ADDRESS, FUSD_ADDRESS } from '../../../constants'
import { useHistory } from 'react-router-dom'
const FUSD_V3_ADDRESS = '0xCE86a1cf3cFf48139598De6bf9B1dF2E0f79F86F'
const SFUSE_ADDRESS = '0xb1DD0B683d9A56525cC096fbF5eec6E60FE79871'
const GetFarmLpToken = ({ farm }: { farm: any }) => {
  const history = useHistory()
  return (
    <ChevronLink
      onClick={() => {
        const isDualRewards = farm?.tokens.filter(Boolean).length > 1
        const isStableCoin = farm?.tokens.filter(Boolean).length > 2

        if (farm?.LPToken.toLowerCase() === XVOLT_ADDRESS.toLowerCase()) {
          history.push('/stake/xVOLT')
          return
        }

        if (farm?.LPToken.toLowerCase() === FUSD_ADDRESS.toLowerCase()) {
          history.push('/add/FUSE' + farm?.LPToken)
          return
        }
        if (farm?.LPToken.toLowerCase() === FUSD_V3_ADDRESS.toLowerCase()) {
          history.push('/add/FUSE/' + farm?.LPToken)
          return
        }

        if (farm?.LPToken.toLowerCase() === SFUSE_ADDRESS.toLowerCase()) {
          history.push('/add/FUSE/' + farm?.LPToken)
          return
        }

        if (isStableCoin) {
          history.push('/stablepool/add/0x2a68D7C6Ea986fA06B2665d08b4D08F5e7aF960c')
          return
        }
        if (isDualRewards) {
          history.push(`/add/${farm?.tokens[0]?.id}/${farm?.tokens[1]?.id}`)
        } else {
          history.push(`/add/${farm?.tokens[0]?.id}`)
        }
      }}
      text="Get LP token"
    />
  )
}

export default GetFarmLpToken
