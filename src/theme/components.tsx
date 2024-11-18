import { X } from 'react-feather'
import styled from 'styled-components'
import { HTMLProps, useCallback } from 'react'

import useAnalytics from '../hooks/useAnalytics'

export const CloseIcon = styled(X)<{ onClick: () => void }>`
  cursor: pointer;
`

// A button that triggers some onClick result, but looks like a link.
export const LinkStyledButton = styled.button<{ disabled?: boolean }>`
  border: none;
  text-decoration: none;
  background: none;

  cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};
  color: ${({ theme, disabled }) => (disabled ? theme.text2 : 'white')};
  font-weight: 500;

  :hover {
    text-decoration: ${({ disabled }) => (disabled ? null : 'underline')};
  }

  :focus {
    outline: none;
    text-decoration: ${({ disabled }) => (disabled ? null : 'underline')};
  }

  :active {
    text-decoration: none;
  }
`

export const StyledLink = styled.a`
  text-decoration: none;
  cursor: pointer;
  color: ${({ theme }) => theme.primary1};
  font-weight: 500;
  font-size: 14px;
  line-height: 16px;
  :hover {
    text-decoration: underline;
  }

  :focus {
    outline: none;
    text-decoration: underline;
  }

  :active {
    text-decoration: none;
  }
`

/**
 * Outbound link that handles firing google analytics events
 */
export function ExternalLink({
  target = '_blank',
  href,
  rel = 'noopener noreferrer',
  fontSize,
  ...rest
}: Omit<HTMLProps<HTMLAnchorElement>, 'as' | 'ref' | 'onClick'> & { href: string; fontSize?: number }) {
  const { sendEvent } = useAnalytics()
  const handleClick = useCallback(() => {
    sendEvent('Open External Link', {
      url: href,
    })
  }, [sendEvent, href])
  return <StyledLink target={target} rel={rel} href={href} onClick={handleClick} style={{ fontSize }} {...rest} />
}
