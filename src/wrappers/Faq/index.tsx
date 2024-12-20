import { useState } from 'react'

import { motion } from 'framer-motion'
import { Box, Flex, Text } from 'rebass/styled-components'
import { Minus, Plus } from 'react-feather'
import NoSelect from '../NoSelect'

const Faq = ({
  items = [
    {
      q: 'What is the Volt App?',
      a: `Focusing on reducing friction for non-experienced users, the Volt App provides a seamless DeFi experience on mobile devices. Non-custodial and without fees, the Volt App is the best way to interact with DeFi for beginners. <br></br>Read more about the app <a className="faq__link" href="/app">link</a>.
      `,
    },
    {
      q: 'What is the VOLT token for?',
      a: 'The VOLT token is the governance token of Voltage Finance. The token will give you ownership over the protocol, from rewards allocation to revenue share. Also by holding the VOLT token you will be able to participate in snapshot votes and much more.',
    },
    {
      q: 'What about VOLT tokenomics?',
      a: `Read more about VOLT tokenomics in our  <a className="faq__link" href="https://docs-voltage.gitbook.io/voltage/tokenomics">docs.</a>`,
    },
    {
      q: 'What is the purpose of holding VOLT?',
      a: 'You can stake your VOLT in a single stake pool. By staking Volt, you receive a yield and the ability to govern the Voltage platform at large. Voltage is a relatively newer platform, therefore many features will need to be implemented in the near future.',
    },
    {
      q: 'How secure Voltage Finance is?',
      a: `
      We have audited most of our contracts with Quillhash.
      <br></br>
      Check out our docs <a className="faq__link" href="https://docs-voltage.gitbook.io/voltage/audits">link</a>.

      `,
    },
  ],
}: any) => {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <NoSelect width={'100%'}>
      <Flex width={'100%'} sx={{ cursor: 'pointer', gap: 2 }} flexDirection={'column'}>
        {items.map(({ q, a }, index) => (
          <Flex key={index} flexDirection={'column'}>
            {index === 0 && <Box height={'0.5px'} width={'100%'} bg="black"></Box>}
            <motion.div
              initial={{ opacity: 1 }}
              animate={openIndex == index || openIndex === -1 ? { opacity: 1 } : { opacity: 0.3 }}
              onClick={() => {
                if (openIndex === index) {
                  setOpenIndex(-1)
                  return
                }
                setOpenIndex(index)
              }}
            >
              <Box py={3}>
                <Flex alignItems={'center'} sx={{ gap: 2 }}>
                  {openIndex !== index ? <Plus /> : <Minus />}
                  <Text fontWeight={600}>
                    <div dangerouslySetInnerHTML={{ __html: q }}></div>
                  </Text>
                </Flex>

                {openIndex === index && (
                  <motion.div className="faq__item--open">
                    <Text ml={32} lineHeight={1.4} pt={2}>
                      <div dangerouslySetInnerHTML={{ __html: a }}></div>
                    </Text>
                  </motion.div>
                )}
              </Box>
            </motion.div>
            <Box height={'0.5px'} width={'100%'} bg="black"></Box>
          </Flex>
        ))}
      </Flex>
    </NoSelect>
  )
}

export default Faq
