import { Card, Flex, Text } from 'rebass/styled-components'
import { ComponentLoader } from '../../../../wrappers/ComponentLoader'
import NoSelect from '../../../../wrappers/NoSelect'
import { IconButton } from '../../../../wrappers/IconButton'
import { ArrowUpRight, Twitter } from 'react-feather'

const Explanation = ({
  title = 'lorem',
  content = 'Arkham (ARKM) is an intel-to-earn token powering the deanonymization of the blockchain with AI.Arkham (ARKM) is an intel-to-earn token powering the deanonymization of the blockchain with AI.Arkham (ARKM) is an intel-to-earn token powering the deanonymization of the blockchain with AI.Arkham (ARKM) is an intel-to-earn token powering the deanonymization of the blockchain with AI.',
}: any) => {
  return (
    <ComponentLoader width={'100%'} loading={!content}>
      <Card minHeight={'fit-content'}>
        <NoSelect>
          <Flex flexDirection={'column'}>
            <Text variant={'h4'}>About {title}</Text>
            <Text lineHeight={1.5} opacity={0.7} fontSize={2}>
              {content}
            </Text>
          </Flex>
        </NoSelect>
        <Flex pt={4} sx={{ gap: 2 }}>
          <IconButton Icon={ArrowUpRight} to={'https://mirakle.io/'} content="Website" />
          <IconButton Icon={Twitter} to={'https://twitter.com/DefiMirakle'} content="Twitter" />
        </Flex>
      </Card>
    </ComponentLoader>
  )
}
export default Explanation
