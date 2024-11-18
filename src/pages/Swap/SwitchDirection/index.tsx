import { RefreshCw } from 'react-feather'
import { Box, Flex } from 'rebass/styled-components'

const SwitchDirection = ({ onClick, forwardOnly }: any) => {
  return (
    <Box sx={{ position: 'relative' }}>
      <Flex
        mx="auto"
        justifyContent={'center'}
        alignItems={'center'}
        onClick={onClick}
        bg="white"
        sx={{
          cursor: 'pointer',
          border: '0.1px solid #E8E8E8',
          zIndex: 2,
          borderRadius: '9999px',
          width: '30px',
          height: '30px',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        {forwardOnly ? <RefreshCw size={16} strokeWidth={2} /> : <RefreshCw size={16} strokeWidth={2} />}
      </Flex>

      <Box height={'1px'} backgroundColor={'#E8E8E8'} />
    </Box>
  )
}
export default SwitchDirection
