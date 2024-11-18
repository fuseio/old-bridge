import { Box, Text, Flex, Image } from 'rebass/styled-components'
import QuoteSVG from '../../../assets/svg/quote.svg'
import Section from '../../../collections/Section'

const Testimonial = ({ author, quote }: { quote: string; author: string }) => {
  return (
    <Box p={4} bg="gray" sx={{ borderRadius: 'rounded' }} minHeight={'264px'} height={'fit-content'} width={'100%'}>
      <Image width={['10%', '24px']} opacity={0.3} src={QuoteSVG} />
      <Flex flexDirection={'column'} sx={{ gap: 3 }}>
        <Text sx={{ fontStyle: 'italic' }} fontSize={2} lineHeight={1.5} pt={3}>
          {`"${quote}"`}
        </Text>
        <Text>- {author}</Text>
      </Flex>
    </Box>
  )
}

export default function Testimonials() {
  return (
    <Section pb={200}>
      <Section.Header>Trusted by Thousands Globally</Section.Header>
      <Section.Body>
        <Box
          height={'fit-content'}
          width={'100%'}
          sx={{
            display: 'grid',
            'justify-items': 'center',
            'grid-column-gap': 20,
            'grid-row-gap': [20, 20],
            'grid-template-columns': ['repeat(1, 1fr)', 'repeat(3, 1fr)'],
          }}
        >
          <Testimonial
            quote="VOLTs intuitive interface and speedy transactions stood out for me. Its robust security measures are a huge plus."
            author={'Pablo'}
          />
          <Testimonial
            quote="Managing my crypto on the go has been a breeze with Volt App. It's beginner-friendly, secure, and often updated with new features."
            author={'Pierce'}
          />
          <Testimonial
            quote="With the Volt App, managing my assets has become simple, thanks to its user-friendly interface and diverse yield opportunity."
            author={'Clara'}
          />
          <Testimonial
            quote="Importing my wallet was smooth, and managing my crypto holdings is now hassle-free. The seamless swap feature and zero network fee make Volt a joy to use."
            author={'Olivia'}
          />
          <Testimonial
            quote="Managing tokens and funds on VOLT is incredibly convenient. It truly has it all!"
            author={'Liam'}
          />
          <Testimonial
            quote="VOLT's educational resources have fast-tracked my understanding of DeFi. It's not just an app; it's a comprehensive learning platform."
            author={'Pablo'}
          />
        </Box>
      </Section.Body>
    </Section>
  )
}
