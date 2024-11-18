import { Flex } from 'rebass/styled-components'

const InfoIcon = ({ onClick, size = 15 }: { size?: number; onClick?: () => void }) => {
  return (
    <Flex
      ml={1}
      justifyContent="center"
      alignItems={'center'}
      fontWeight={600}
      onClick={onClick}
      style={{
        fontSize: size - 3 + 'px',
        width: size + 'px',
        height: size + 'px',
        color: 'black',
        cursor: 'pointer',
        backgroundColor: '#70E000',
        borderRadius: '99999px'
      }}
    >
      i
    </Flex>
  )
}

export default InfoIcon
