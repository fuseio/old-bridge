import { useEffect, useState } from 'react'
import { Flex, Text } from 'rebass/styled-components'

interface TabsProps {
  onChange: (activeTab: string) => void
  mb?: string | number
  fontSize?: string
  items: Array<{ name: string; onClick?: (activeTab: string) => void }>
}

const Tabs = ({
  onChange,
  mb = 3,
  items = [
    {
      name: 'Tab 1',
      onClick: () => ({}),
    },
    {
      name: 'Tab 2',
      onClick: () => ({}),
    },
  ],
  fontSize = '1'
}: TabsProps) => {
  const [activeTab, setActiveTab] = useState(items[0]?.name)

  useEffect(() => {
    onChange(activeTab)
  }, [activeTab, onChange])

  return (
    <Flex mt={1} mb={mb} alignItems={'center'} style={{ gap: '12px' }}>
      {items.map(({ name, onClick }, index) => (
        <Text
          fontSize={fontSize}
          key={index}
          style={{ cursor: 'pointer' }}
          fontWeight={700}
          opacity={activeTab !== name ? 0.5 : 1}
          color={activeTab === name ? 'secondary' : 'secondary'}
          onClick={() => {
            if (onClick) {
              onClick(name)
            }
            setActiveTab(name)
          }}
        >
          {name}
        </Text>
      ))}
    </Flex>
  )
}
export default Tabs
