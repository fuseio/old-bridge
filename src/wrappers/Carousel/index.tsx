import { useRef } from 'react'
import { motion } from 'framer-motion'
import { Flex, Box, Card, Image, Text } from 'rebass/styled-components'

import Pagination from '../Pagination'
import { ComponentLoader } from '../ComponentLoader'

interface CarouselProps {
  data: any
}

export default function Carousel({ data }: CarouselProps) {
  const carouselRef = useRef(null)
  const cardRef = useRef(null)

  const handleScrollNext = () => {
    if (carouselRef.current && cardRef.current) {
      carouselRef.current.scrollBy({ left: cardRef.current.clientWidth + 20, behavior: 'smooth' })
    }
  }

  const handleScrollPrev = () => {
    if (carouselRef.current && cardRef.current) {
      carouselRef.current.scrollBy({ left: -(cardRef.current.clientWidth + 20), behavior: 'smooth' })
    }
  }

  const formatDate = (dateString) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  return (
    <Flex width="100%" flexDirection="column" sx={{ position: 'relative' }}>
      <Flex justifyContent="flex-end" mb={3}>
        <Pagination showNumber={false} arrowSize={22} onNextPage={handleScrollNext} onPrevPage={handleScrollPrev} />
      </Flex>

      <Box
        ref={carouselRef}
        sx={{
          gap: '20px',
          display: 'flex',
          overflow: 'scroll',
          WebkitOverflowScrolling: 'touch',
          position: 'relative',
          '&::-webkit-scrollbar': {
            display: 'none', // Hide scrollbar for a cleaner look
          },
        }}
      >
        {data.length === 0 ? (
          <Flex width="100%" justifyContent="center">
            {[1, 2, 3].map((key) => (
              <ComponentLoader key={key} dark loading={true} width={'100%'} height={500} />
            ))}
          </Flex>
        ) : (
          data.map(({ content_html, date_published, url, title }, index) => {
            const parser = new DOMParser()
            const doc = parser.parseFromString(content_html, 'text/html')
            const firstImg = doc.querySelector('img')

            let imgSrc = null
            if (firstImg) {
              imgSrc = firstImg.src
            }

            return (
              <motion.div
                key={index}
                className="carousel-item"
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                initial={{ opacity: 0, x: 100 }}
                style={{ flex: '0 0 auto', scrollSnapAlign: 'start' }}
              >
                <Card
                  p={0}
                  pb={23}
                  key={index}
                  ref={cardRef}
                  height={['305px', '450px']}
                  maxWidth={['259px', '380px']}
                  sx={{ cursor: 'pointer', overflow: 'hidden', ':hover': { bg: 'select' } }}
                >
                  <a target="_blank" href={url} style={{ textDecoration: 'none' }} rel="noreferrer">
                    <Box sx={{ overflow: 'hidden' }} height={['150px', '220px']} width={['259px', '380px']}>
                      <Image sx={{ height: '100%', width: '100%', objectFit: 'cover' }} src={imgSrc} />
                    </Box>

                    <Flex px={3} flexDirection={'column'}>
                      <Text pt={4} pb={2} color="blk50" fontWeight={400} fontSize={['12px', '16px']}>
                        {formatDate(date_published)}
                      </Text>

                      <Text lineHeight={1.6} pb={2} fontSize={['13px', '20px']} fontWeight={600}>
                        {title}
                      </Text>
                    </Flex>
                  </a>
                </Card>
              </motion.div>
            )
          })
        )}
      </Box>
    </Flex>
  )
}
