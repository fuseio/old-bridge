import React from 'react'
import WebFont from 'webfontloader'
import { createGlobalStyle } from 'styled-components'
import { Heading, Link, Text, TextProps } from 'rebass/styled-components'

export * from './components'
import { preset } from './preset'

WebFont.load({
  google: {
    families: ['Montserrat:200,300, 400,500, 600', 'Anton: 300, 400, 700', 'sans-serif'],
  },
})

interface TypeProps {
  active?: boolean
  loading?: boolean
  children: React.ReactNode
  fontSize?: number
  error?: boolean
  onClick?: any
}

export const TYPE = {
  main({ onClick, children }: TypeProps & TextProps) {
    return (
      <Text onClick={onClick} fontSize={[1, 2]}>
        {children}
      </Text>
    )
  },
  link({ onClick, fontSize = 2, children }: TypeProps & TextProps) {
    return (
      <Link onClick={onClick} fontSize={fontSize}>
        {children}
      </Link>
    )
  },
  black({ onClick, children }: TypeProps & TextProps) {
    return (
      <Text onClick={onClick} fontSize={2}>
        {children}
      </Text>
    )
  },

  body({ onClick, children }: TypeProps & TextProps) {
    return (
      <Text onClick={onClick} fontSize={2}>
        {children}
      </Text>
    )
  },
  largeHeader({ onClick, children }: TypeProps & TextProps) {
    return (
      <Heading onClick={onClick} fontSize={4}>
        {children}
      </Heading>
    )
  },
  mediumHeader({ onClick, children }: TypeProps & TextProps) {
    return (
      <Heading onClick={onClick} fontSize={3}>
        {children}
      </Heading>
    )
  },
  smallHeader({ onClick, children }: TypeProps & TextProps) {
    return (
      <Heading onClick={onClick} fontSize={2}>
        {children}
      </Heading>
    )
  },
  subHeader({ onClick, children }: TypeProps & TextProps) {
    return (
      <Text onClick={onClick} fontSize={1}>
        {children}
      </Text>
    )
  },

  small({ onClick, children }: TypeProps & TextProps) {
    return (
      <Text onClick={onClick} fontSize={0}>
        {children}
      </Text>
    )
  },
  blue({ onClick, children }: TypeProps & TextProps) {
    return (
      <Text onClick={onClick} fontSize={2}>
        {children}
      </Text>
    )
  },
  yellow({ onClick, children }: TypeProps & TextProps) {
    return (
      <Text onClick={onClick} variant="warning" fontSize={2}>
        {children}
      </Text>
    )
  },
  warning({ onClick, children }: TypeProps & TextProps) {
    return (
      <Text onClick={onClick} variant="warning" fontSize={2}>
        {children}
      </Text>
    )
  },
  success({ onClick, children }: TypeProps & TextProps) {
    return (
      <Text onClick={onClick} variant="success" fontSize={2}>
        {children}
      </Text>
    )
  },
  darkGray({ onClick, children }: TypeProps & TextProps) {
    return (
      <Text onClick={onClick} fontSize={2}>
        {children}
      </Text>
    )
  },

  italic({ onClick, children }: TypeProps & TextProps) {
    return (
      <Text onClick={onClick} variant="italic" fontSize={1}>
        {children}
      </Text>
    )
  },
  error({ onClick, fontSize = 2, children }: TypeProps & TextProps) {
    return (
      <Text onClick={onClick} variant="error" fontSize={fontSize}>
        {children}
      </Text>
    )
  },
}

export const FixedGlobalStyle = createGlobalStyle`
html {
  background-color:${preset.colors.background};
  font-size: ${preset.fontSizes[2]};
  font-variant: none;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  overflow-x: hidden;

},
body {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  position: relative;
  overflow-x: hidden;
  min-height: 100vh;
  background-color: ${preset.colors.background};
  overflow-x: hidden;
}
button {
  user-select: none;
}
*{
  font-family:${preset.fonts.body};
  color: ${preset.colors.text};
  line-height: ${preset.styles.root.lineHeight};

}
textarea:focus, input:focus{
  outline: none;
}
`
