import { useState } from 'react'
import { Button, Flex, Text } from 'rebass/styled-components'
import TokenMigrationModal from '../../modals/TokenMigrationModal'

export default function DeprecatedPopup({ content }: { content: any }) {
  const [migrateModalOpen, setMigrateModalOpen] = useState(false)
  const {
    deprecated: { token, currency },
  } = content

  return (
    <>
      <Flex alignItems={'center'}>
        <Text fontSize={2}>{token?.replace(/\(Deprecated\)/, '')} is deprecated!</Text>
      </Flex>
      <Flex pt={3}>
        <Button
          variant="secondary"
          fontSize={0}
          px={3}
          onClick={() => {
            setMigrateModalOpen(true)
          }}
        >
          Migrate {token}
        </Button>
      </Flex>
      <TokenMigrationModal
        token={currency}
        isOpen={migrateModalOpen}
        onDismiss={() => setMigrateModalOpen(false)}
        listType="Swap"
      />
    </>
  )
}
