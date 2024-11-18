import { Box, Flex } from 'rebass/styled-components'

export const IconDivider = ({ Icon, noBorder, onClick }: any) => {
  return (
    <Box sx={{ position: 'relative' }}>
      {Icon && (
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
          <Icon />
        </Flex>
      )}

      <Box height={'1px'} backgroundColor={noBorder ? 'transparent' : '#E8E8E8'}></Box>
    </Box>
  )
}
