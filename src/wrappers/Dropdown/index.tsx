import { useRef, useState } from 'react'
import { ChevronDown, ChevronUp } from 'react-feather'
import { Box, Flex, Image, Text } from 'rebass/styled-components'
import { useOnClickOutside } from '../../hooks/useOnClickOutside'

interface DropdownOptionProps {
  text: string
  src?: string
  id?: string | number
}

const Dropdown = ({
  defaultOption,
  options = [],
  onChange = () => ({}),
}: {
  defaultOption?: any
  options: Array<DropdownOptionProps>
  onChange?: any
}) => {
  const [open, setOpen] = useState(false)
  const [activeItem, setActiveItem] = useState(null)

  const hasOptions = options.length > 1
  const dropdownRef = useRef()

  useOnClickOutside(dropdownRef, () => {
    setOpen(false)
  })

  return (
    <Box minWidth={150} width={'100%'} sx={{ position: 'relative', pointerEvents: !hasOptions ? 'none' : 'all' }}>
      <Flex
        onClick={() => {
          setOpen(!open)
        }}
        alignItems="center"
        width={'100%'}
        sx={{ cursor: 'pointer', gap: 1 }}
      >
        <Flex alignItems={'center'} sx={{ gap: 2 }} justifyContent={'space-between'}>
          {(defaultOption?.src || activeItem?.src) && <Image size={18} src={defaultOption?.src || activeItem?.src} />}

          <Text fontWeight={600} fontSize={2}>
            {defaultOption?.text || activeItem?.text || 'Select'}
          </Text>
        </Flex>
        {hasOptions ? (
          open ? (
            <ChevronUp size={18} strokeWidth={2} />
          ) : (
            <ChevronDown size={18} strokeWidth={2} />
          )
        ) : (
          <Box></Box>
        )}
      </Flex>
      {open && options.length > 1 && (
        <Box
          ref={dropdownRef}
          sx={{
            position: 'absolute',
            width: '100%',
            zIndex: 10,
          }}
        >
          <Flex
            backgroundColor={'white'}
            mt={2}
            sx={{
              gap: '12px',
              borderRadius: 'default',
              cursor: 'pointer',
              border: '1px solid #ccc',
            }}
            py={2}
            px={2}
            flexDirection={'column'}
          >
            {options
              .filter((option) => option.id !== activeItem?.id && option.id !== defaultOption?.id)
              .map((option, index) => (
                <Flex alignItems={'center'} sx={{ gap: 2 }} key={index}>
                  {option.src && <Image size={16} src={option.src} />}
                  <Text
                    fontSize={1}
                    onClick={() => {
                      if (onChange) {
                        onChange(option, setActiveItem)
                      }
                      setOpen(false)
                    }}
                  >
                    {option.text}
                  </Text>
                </Flex>
              ))}
          </Flex>
        </Box>
      )}
    </Box>
  )
}

export default Dropdown
