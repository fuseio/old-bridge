import React from 'react'
import { Box } from 'rebass/styled-components'

import PageHeader from './Header'
import PageSubheader from './Subheader'
import PageBody from './Body'
function Page({ children }: any) {
  return (
    <Box>
      {React.Children.map(children, (child) => {
        if (child) {
          return React.cloneElement(child as React.ReactElement<any>)
        }
        return <div></div>
      })}
    </Box>
  )
}

Page.Header = PageHeader
Page.Subheader = PageSubheader
Page.Body = PageBody

export default Page
