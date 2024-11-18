import React from 'react'
import { Box } from 'rebass/styled-components'

import SectionHeader from './Header'
import SectionBody from './Body'
import SectionSubheader from './Subheader'

function Section({ pb = [100, 100], children }: any) {
  return (
    <Box pb={pb}>
      {React.Children.map(children, (child) => {
        if (child) {
          return React.cloneElement(child as React.ReactElement<any>)
        }
        return <div></div>
      })}
    </Box>
  )
}
Section.Body = SectionBody

Section.Header = SectionHeader
Section.Subheader = SectionSubheader

export default Section
