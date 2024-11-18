import FAQ from './FAQ'
import Wallet from './Wallet'
import Landing from './Landing'
import AppBody from '../AppBody'
import Leverage from './Leverage'
import Testimonials from './Testimonials'

export default function HomePage() {
  return (
    <AppBody pt={0}>
      <Landing />
      <Wallet />
      <Leverage />
      <Testimonials />
      <FAQ />
    </AppBody>
  )
}
