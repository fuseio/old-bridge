import { Text } from 'rebass/styled-components'
import Table from '../../../components/Table'

interface ContentBaseProps {
  title: string
  columns: any
  data: any
}

export default function OverviewBase({ title, columns, data }: ContentBaseProps) {
  return (
    <>
      <Text fontSize={16} fontWeight={500}>
        {title}
      </Text>
      <Table columns={columns} data={data} />
    </>
  )
}
