import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'react-feather'
import { Button, Flex, Image, Text } from 'rebass/styled-components'

import Card from '../../../collections/Card'

interface StakeOptionCardProps {
  to: string
  title: string
  tokenName: string
  buttonText: string
  apy: string
  tvl: string
  logo: any
  isDeprecated?: boolean
  learnMore?: string
}

export const StakeOptionCard = ({
  to,
  title,
  tokenName,
  buttonText,
  apy,
  tvl,
  logo,
  isDeprecated = false,
  learnMore,
}: StakeOptionCardProps) => {
  const deprecatedTag = isDeprecated ? (
    <Flex
      px={['5px']}
      height={'17.97px'}
      alignItems={'center'}
      sx={{
        borderRadius: '3px',
        background: '#D8D8D8',
      }}
    >
      <Text lineHeight={'100%'} fontSize={['12px', '10px', '12px']} fontWeight={600}>
        Deprecated
      </Text>
    </Flex>
  ) : null

  return (
    <Card px={['21px', '2vw', '40px']}>
      <Card.Body pt={0}>
        <Flex flexDirection={['column', 'row']} justifyContent={'space-between'} sx={{ gap: ['27px', '0xp'] }}>
          <Flex flexDirection={['column', 'row']} sx={{ gap: ['31px', '2vw', '114px'] }}>
            <Flex width={['100%', '210px', '250px']} sx={{ gap: ['20px', '1vw', '20px'] }} alignItems={'center'}>
              <Flex minWidth={'40px'}>
                <Image width={40} height={40} src={logo} />
              </Flex>

              <Flex flexDirection={'column'} sx={{ gap: ['2px'] }}>
                <Text color={'blk70'} fontSize={['12px', '13px', '14px']} fontWeight={500}>
                  {title}
                </Text>

                <Flex alignItems={'center'} sx={{ gap: ['13px'] }}>
                  <Text color={'gray500'} fontSize={['18px', '20px', '24px']} fontWeight={600}>
                    {tokenName}
                  </Text>

                  {deprecatedTag}
                </Flex>
              </Flex>
            </Flex>

            <Flex justifyContent={'space-between'} sx={{ gap: ['114px', '2vw', '114px'] }}>
              <Flex flexDirection={'column'} width={['82px']}>
                <Text color={'blk70'} fontSize={['12px', '13px', '14px']} fontWeight={500}>
                  APY
                </Text>
                <Text color={'highlight'} fontSize={['18px', '20px', '24px']} fontWeight={600}>
                  {apy}
                </Text>
              </Flex>

              <Flex flexDirection={'column'}>
                <Text color={'blk70'} fontSize={['12px', '13px', '14px']} fontWeight={500}>
                  TVL
                </Text>
                <Text color={'gray500'} fontSize={['18px', '20px', '24px']} fontWeight={600}>
                  {tvl}
                </Text>
              </Flex>
            </Flex>
          </Flex>

          <Flex flexDirection={['column', 'row']} alignItems={'center'} sx={{ gap: ['15px', '1vw', '15px'] }}>
            {!!learnMore && (
              <Flex
                alignItems={'center'}
                justifyContent={'center'}
                sx={{
                  width: ['100%', '12vw'],
                  maxWidth: ['100%', '112px'],
                  order: [2, 1],
                }}
              >
                <a href={learnMore} style={{ textDecoration: 'none' }} target="_blank" rel="noreferrer">
                  <Text color={'black'} fontSize={['16px', '12px', '16px']} fontWeight={700}>
                    Learn more
                  </Text>
                </a>

                <ArrowUpRight width={'16px'} height={'16px'} strokeWidth={'3px'} />
              </Flex>
            )}

            <Flex
              width={['100%', '100px', '147px']}
              sx={{
                order: [1, 2],
              }}
            >
              <Link style={{ width: '100%' }} to={to}>
                <Button
                  variant="primary"
                  backgroundColor={'gray500'}
                  width={['100%', '100px', '147px']}
                  fontSize={['16px', '12px', '16px']}
                  sx={{ border: '0.5px solid white', margin: ['0 auto', '0 0'] }}
                >
                  {buttonText}
                </Button>
              </Link>
            </Flex>
          </Flex>
        </Flex>
      </Card.Body>
    </Card>
  )
}
