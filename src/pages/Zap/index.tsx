import 'react-dropdown/style.css'

import AppBody from '../AppBody'
import ZapActionPanel from '../../components/zap'
import { UNDER_MAINTENANCE } from '../../constants'
import SwitchNetwork from '../../components/SwitchNetwork'
import Maintenance from '../../components/swap/Maintenance'

export default function ZapPage() {
  if (UNDER_MAINTENANCE) {
    return <Maintenance />
  }

  return (
    <AppBody>
      <SwitchNetwork />

      <ZapActionPanel />
    </AppBody>
  )
}
