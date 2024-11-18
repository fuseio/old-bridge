import { Input } from '@rebass/forms'
import { Search } from 'react-feather'
import { Box, Flex } from 'rebass/styled-components'

interface PoolPageSearchProps {
  setSearch: React.Dispatch<React.SetStateAction<string>>
}

export default function PoolPageSearch({ setSearch }: PoolPageSearchProps) {
  return (
    <Box
      px={[14, 3]}
      variant="outline"
      sx={{
        height: '50px',
        position: 'relative',
        width: ['100%', '50%', '40%'],
        backgroundColor: 'transparent',
      }}
    >
      <Flex height={'100%'} alignItems={'center'}>
        <Input
          fontSize={['12px', '12px', '14px']}
          onChange={({ target: { value } }) => {
            setSearch(value)
          }}
          placeholder="Search by name, symbol or address"
          style={{ border: 'none', padding: '0px' }}
        />
        <Search />
      </Flex>
    </Box>
  )
}
