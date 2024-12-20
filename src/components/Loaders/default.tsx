import styled, { keyframes } from 'styled-components'

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`

const StyledSVG = styled.svg<{ size: string; stroke?: string; margin: string }>`
  animation: 2s ${rotate} linear infinite;
  margin: ${({ margin }) => (margin ? margin : 'auto')};

  height: ${({ size }) => size};
  width: ${({ size }) => size};
  path {
    stroke: white;
  }
`

/**
 * Takes in custom size and stroke for circle color, default to primary color as fill,
 * need ...rest for layered styles on top
 */
export default function Loader({
  size = 16,
  stroke,
  margin = 'auto',
  ...rest
}: {
  size?: number
  success?: boolean
  error?: boolean
  stroke?: string
  margin?: string
}) {
  return (
    <StyledSVG
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      size={size + 2 + 'px'}
      strokeWidth={0.2}
      stroke={stroke}
      margin={margin}
      style={{ opacity: 0.9 }}
      {...rest}
    >
      <path
        d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 9.27455 20.9097 6.80375 19.1414 5"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </StyledSVG>
  )
}
