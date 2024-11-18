import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'react-feather'
import { Box, Flex, Text, Card } from 'rebass/styled-components'

const DropdownCard = ({ title, children }: { title: string; children: any }) => {
  const [open, setOpen] = useState(false)
  return (
    <Card>
      <Flex flexDirection={'column'}>
        <Flex alignItems={'center'} justifyContent={'space-between'}>
          <Text fontWeight={600}>{title}</Text>
          <Box
            onClick={() => {
              setOpen(!open)
            }}
          >
            {open ? <ChevronUp cursor={'pointer'} /> : <ChevronDown cursor={'pointer'} />}
          </Box>
        </Flex>
        {open && <Box py={1}>{children}</Box>}
      </Flex>
    </Card>
  )
}
export default DropdownCard
