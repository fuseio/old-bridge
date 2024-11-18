import { Box } from 'rebass/styled-components'

import Hero from './Hero'
import Footer from '../Footer'

export default function HomePage() {
  return (
    <Box as="main">
      <Hero />
      <Footer />
    </Box>
  )
}
