import styled from 'styled-components'
import { Link } from 'rebass'
import { ExternalLink } from '../../theme'

export const Wrapper = styled.div`
  position: relative;

  border-radius: 12px;
`

export const ModalSection = styled.div<{ light?: boolean }>`
  padding: 1rem;
  ${({ light }) => (light ? 'background-color: rgb(44, 47, 54)' : null)};
`

export const UnsupportedTokenContainer = styled.div`
  padding: 1rem;
`

export const ArrowWrapper = styled.div`
  padding: 0.75rem;
`

export const BottomGrouping = styled.div`
  margin-top: 20px;
`

export const Logo = styled.img<{ width?: number }>`
  width: ${({ width }) => (width ? width : 100)}px;
`

export const Loader = styled.img`
  margin-right: 5px;
`

export const DestinationWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
`

export const ModalLink = styled(Link)`
  cursor: pointer;
  color: ${({ theme }) => theme.secondary1};
  font-size: 14px;
  text-decoration: underline;
`

export const ExtLink = styled(ExternalLink)`
  font-size: 14px;
  color: ${({ theme }) => theme.secondary1};
  text-decoration: underline;
`
