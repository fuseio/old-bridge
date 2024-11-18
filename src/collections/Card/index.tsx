import React from 'react'
import * as Rebass from 'rebass/styled-components'

import CardBody from './Body'
import CardLink from './Link'
import CardText from './Text'
import CardImage from './Image'
import CardFooter from './Footer'
import CardHeader from './Header'
import CardSubHeader from './Subheader'

// TODO: talk with designer to make a default card
function Card({
  px = 4,
  overflow = 'hidden',
  py = 4,
  bg = 'white',
  onClick,
  children,
  customHeight = false,
  ...props
}: any) {
  return (
    <Rebass.Card
      px={px}
      py={py}
      {...props}
      width={'100%'}
      onClick={onClick}
      sx={{
        ...{
          overflow,
          position: 'relative',
          bg,
          boxShadow: 'transparent',
          borderRadius: 'rounded',
        },
        ...(onClick
          ? {
              cursor: 'pointer',
              transition: 'background 200ms ease-in-out',
              ':hover': {
                opacity: 0.7,
              },
              ':active': {
                opacity: 0.7,
              },
            }
          : {}),
      }}
    >
      {React.Children.map(children, (child) => {
        if (child?.type?.displayName === 'CardImage') {
          return (
            <Rebass.Box width={'100%'} height={'100%'}>
              {React.cloneElement(child as React.ReactElement<any>)}
            </Rebass.Box>
          )
        }

        if (customHeight) {
          return child
        }

        if (child) {
          return <Rebass.Box width={'100%'}>{React.cloneElement(child as React.ReactElement<any>)}</Rebass.Box>
        }

        return <Rebass.Box sx={{ display: 'none' }} />
      })}
    </Rebass.Card>
  )
}

Card.Header = CardHeader
Card.Body = CardBody
Card.Footer = CardFooter
Card.Text = CardText
Card.Subheader = CardSubHeader
Card.Link = CardLink
Card.Image = CardImage

export default Card
