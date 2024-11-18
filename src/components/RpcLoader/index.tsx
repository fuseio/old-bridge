import { useSelector } from 'react-redux'
import { Flex, Text } from 'rebass/styled-components'
import { CHAIN_MAP } from '../../constants/chains'
import { useWeb3 } from '../../hooks'
import { useBlockNumber } from '../../state/application/hooks'
import Loader from '../Loaders/default'
import LoaderIcon from '../Loaders/icon'

export const RpcLoader = () => {
  const application = useSelector((state: any) => state?.application)
  const { chainId } = useWeb3()
  const blockNumber = useBlockNumber()

  const getBlockNumberText = (chainId) => {
    if (application?.connected === 'CONNECTED') {
      if (!chainId || chainId === 122) {
        return (
          <Text style={{ cursor: 'pointer', opacity: 0.7 }} fontSize={0}>
            <a style={{ textDecoration: 'none' }} href={'https://explorer.fuse.io/'} target="_blank" rel="noreferrer">
              {blockNumber}
            </a>
          </Text>
        )
      } else {
        return (
          <Text style={{ cursor: 'pointer', opacity: 0.7 }} fontSize={0}>
            <a style={{ textDecoration: 'none' }} href={CHAIN_MAP[chainId]?.explorer} target="_blank" rel="noreferrer">
              {blockNumber}
            </a>
          </Text>
        )
      }
    }
    if (application?.connected === 'LOADING') {
      return <div></div>
    }
    if (application?.connected === 'ERROR') {
      return (
        <Text color="error" style={{ cursor: 'pointer', opacity: 0.7 }} fontSize={0}>
          Failed to Load - Check Network
        </Text>
      )
    }
  }
  return (
    <Flex
      alignItems={'center'}
      style={{ gap: '8px', position: 'fixed', bottom: '16px', right: '16px', color: 'white' }}
    >
      {getBlockNumberText(chainId)}

      {application?.connected === 'LOADING' && <Loader size={10} />}
      {application?.connected === 'ERROR' && <LoaderIcon size={10} color="error" />}
      {application?.connected === 'CONNECTED' && <LoaderIcon size={10} color="success" />}
    </Flex>
  )
}
