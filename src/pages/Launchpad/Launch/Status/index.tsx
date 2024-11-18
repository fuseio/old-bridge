import { Box } from 'rebass/styled-components'
import { LaunchStatus } from '../../../../state/launch/updater'

export const Status = ({ status }: { status: LaunchStatus }) => {
  if (status === LaunchStatus.Live) {
    return (
      <Box fontSize={0} py={'6px'} px={'12px'} height={'fit-content'} variant={'badgeSuccess'}>
        {status}
      </Box>
    )
  }
  if (status === LaunchStatus.Upcoming || LaunchStatus.Finalized) {
    return (
      <Box
        fontSize={0}
        sx={{ border: '1px solid  #D4D4D4' }}
        py={'6px'}
        px={'12px'}
        height={'fit-content'}
        variant={'badge'}
      >
        {status}
      </Box>
    )
  }
}
