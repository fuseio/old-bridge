import { Box, Image } from 'rebass/styled-components'
import Section from '../../../collections/Section'
import Card from '../../../collections/Card'
import Zokyo from '../../../assets/svg/logos/zokyo.svg'
import Arcadia from '../../../assets/svg/logos/arcadia.svg'
import Quillhash from '../../../assets/svg/logos/quillhash.svg'

const Report = () => {
  return (
    <Section>
      <Section.Header fontSize={5}>Security audits</Section.Header>
      <Section.Body>
        <Box
          height={'fit-content'}
          width={'100%'}
          sx={{
            display: 'grid',
            'justify-items': 'center',
            'grid-column-gap': 30,
            'grid-row-gap': [30, 0],
            'grid-template-columns': ['repeat(1, 1fr)', 'repeat(3, 1fr)'],
          }}
        >
          <Card>
            <Card.Header>
              <Image src={Zokyo} />
            </Card.Header>
            <Card.Link to={'https://docs.voltage.finance/voltage/audits'} target="_blank" color="blk50" pt={4}>
              View Report
            </Card.Link>
          </Card>
          <Card>
            <Card.Header>
              <Image src={Arcadia} />
            </Card.Header>
            <Card.Link to={'https://docs.voltage.finance/voltage/audits'} target="_blank" color="blk50" pt={4}>
              View Report
            </Card.Link>
          </Card>
          <Card>
            <Card.Header>
              <Image src={Quillhash} />
            </Card.Header>
            <Card.Link
              to={
                'https://files.gitbook.com/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FwttAR2Fr2U1I5o5f6hJf%2Fuploads%2FPmSjHJbCMHQ6aVzjdfAa%2FVoltage%20Smart%20Contract%20Initial%20Audit%20Report.pdf?alt=media&token=191a8d85-82ab-4880-853f-d79cae38df7f'
              }
              target="_blank"
              color="blk50"
              pt={4}
            >
              View Report
            </Card.Link>
          </Card>
        </Box>
      </Section.Body>
    </Section>
  )
}
export default Report
