import { Box, Text } from 'rebass/styled-components'
interface LinkDataProps {
  name: string
  src?: string
  target?: string
  onClick?: () => void
}
interface ColumnProps {
  header: string
  data: Array<LinkDataProps>
}
const Links = ({ columns }: { columns: Array<ColumnProps> }) => {
  return (
    <Box fontSize={1} width={'100%'}>
      <Box
        sx={{
          display: 'grid',
          'grid-template-columns': ['1fr 1fr', '1fr repeat(3, 1fr)'],
          rowGap: ['24px', '0px'],
          columnGap: ['0px', '24px'],
        }}
      >
        {columns.map(({ header, data }) => {
          return (
            <Box
              key={header}
              sx={{
                display: 'grid',
                rowGap: 3,
                'grid-template-rows': '1fr repeat(3, 1fr)',
                alignSelf: 'flex-start',
              }}
            >
              <Text fontWeight={600} as="p">{header}</Text>
              {data.map(({ name, src, onClick }) => (
                <Text
                  style={{ cursor: 'pointer' }}
                  sx={{
                    transition: 'opacity 0.2s ease-in-out',
                    '&:hover': {
                      opacity: 0.7,
                    },
                  }}
                  key={name}
                  onClick={() => {
                    if (onClick) return onClick()
                  }}
                  as="p"
                >
                  {src ? (
                    <a href={src} target="_blank" style={{ textDecoration: 'none' }} rel="noreferrer">
                      {name}
                    </a>
                  ) : (
                    name
                  )}
                </Text>
              ))}
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}
export default Links
