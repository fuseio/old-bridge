import { Box } from 'rebass/styled-components'

import Landing from './Landing'
import Earn from './Earn'
import Spend from './Spend'
import Fintech from './Fintech'
import Reward from './Reward'
import Pro from './Pro'
import Footer from '../Footer'

export default function HomePage() {
  return (
    <Box as="main">
      <Landing />
      <Earn />
      <Spend />
      <Fintech />
      <Reward />
      <Pro />
      <Footer />
    </Box>
  )
}
