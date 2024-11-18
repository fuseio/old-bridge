import { Box } from 'rebass/styled-components'

const PROGRESS_BAR_HEIGHT = 6

export const ProgressBar = ({ current = 0, goal = 2000 }: { current: number; goal: number }) => {
  const progress = (current / goal) * 100

  return (
    <Box width={'100%'} height={PROGRESS_BAR_HEIGHT} bg="gray" sx={{ borderRadius: '10px' }}>
      <Box
        height={PROGRESS_BAR_HEIGHT}
        width={`${progress}%`}
        bg="highlight"
        sx={{ borderRadius: '10px', transition: 'width 0.2s ease-in' }}
      ></Box>
    </Box>
  )
}
