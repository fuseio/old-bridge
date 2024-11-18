import { Input } from '@rebass/forms/styled-components'
import { Button, Flex } from 'rebass/styled-components'

const Subscribe = () => {
  return (
    <form action="https://formspree.io/f/maykerbr" method="POST">
      <Flex
        sx={{
          width: '100%',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Input
          type="email"
          name="email"
          placeholder="Enter your email"
          fontSize={14}
          color={'black'}
          sx={{
            backgroundColor: 'white',
            padding: '12px',
            outline: '1px solid #18181629',
            border: 'none',
            '::placeholder': {
              color: '#181816B2',
            },
          }}
        />
        <Button variant="blackShadowPrimary">
          Subscribe
        </Button>
      </Flex>
    </form>
  )
}
export default Subscribe
