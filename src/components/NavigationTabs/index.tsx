import { darken } from 'polished'
import styled from 'styled-components'
import { ArrowLeft } from 'react-feather'
import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink, Link as HistoryLink, useHistory, useLocation } from 'react-router-dom'

import Row, { RowBetween } from '../Row'
import { ButtonSwitch } from '../Button'
import QuestionHelper from '../QuestionHelper'
import useAnalytics from '../../hooks/useAnalytics'

export const Wrapper = styled('div')`
  position: relative;
  margin: auto;
  margin-bottom: 15px;
  width: 100%;
  border-radius: 16px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin-left: 0;
    margin-right: 0;
  `}
`

const TabsContainer = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;

  border-radius: 3rem;
  justify-content: space-evenly;
`

const activeClassName = 'ACTIVE'

const StyledNavLink = styled(NavLink).attrs({
  activeClassName,
})`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  justify-content: center;
  height: 48px;
  border-radius: 3rem;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  color: ${({ theme }) => theme.text3};
  font-size: 16px;
  width: 100%;

  &.${activeClassName} {
    border-radius: 12px;
    font-weight: 500;
    color: ${({ theme }) => theme.text1};
    :before {
      content: '';
      position: absolute;
      width: 33.3%;
      top: 0;
      bottom: 0;
      border-radius: 16px;
      padding: 2px;
      background: linear-gradient(110deg, #b1ffbf 7%, #fff16d);
      -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      -webkit-mask-composite: destination-out;
      mask-composite: exclude;
    }
  }

  :hover,
  :focus {
    color: ${({ theme }) => darken(0.1, theme.text1)};
  }
`

const ActiveText = styled.div`
  font-weight: 500;
  font-size: 16px;
`

const StyledArrowLeft = styled(ArrowLeft)`
  color: ${({ theme }) => theme.text1};
`

export function SwapPoolTabs({ active }: { active: 'swap' | 'pool' | 'bridge' }) {
  const { t } = useTranslation()
  return (
    <Wrapper>
      <TabsContainer>
        <StyledNavLink id={`swap-nav-link`} to={'/swap'} isActive={() => active === 'swap'}>
          {t('swap')}
        </StyledNavLink>
        <StyledNavLink id={`pool-nav-link`} to={'/pool'} isActive={() => active === 'pool'}>
          {t('pool')}
        </StyledNavLink>
        <StyledNavLink id={`bridge-nav-link`} to={'/bridge'} isActive={() => active === 'bridge'}>
          Bridge
        </StyledNavLink>
      </TabsContainer>
    </Wrapper>
  )
}

export function SwapTabs() {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const history = useHistory()
  return (
    <Wrapper>
      <Row style={{ padding: '3px' }} borderRadius={'12px'} backgroundColor={'#0B0C13'}>
        <ButtonSwitch
          active={pathname.includes('swap') && !pathname.includes('stable')}
          height={'41px'}
          onClick={() => history.push('/swap')}
        >
          {t('Swap')}
        </ButtonSwitch>
        <ButtonSwitch active={pathname.includes('stable')} height={'41px'} onClick={() => history.push('/stableswap')}>
          {t('Stable Swap')}
        </ButtonSwitch>
      </Row>
    </Wrapper>
  )
}

interface NavTabsProps {
  tabs: Array<{ path: string; label: string }>
}

export function NavTabs({ tabs }: NavTabsProps) {
  const history = useHistory()
  const { pathname } = useLocation()
  const { sendEvent } = useAnalytics()

  const handleClick = useCallback(
    (path: string) => {
      history.push(path)
    },
    [history, sendEvent]
  )

  return (
    <Wrapper>
      <Row>
        {tabs.map(({ path, label }, index) => (
          <ButtonSwitch key={index} active={pathname.includes(path)} height="41px" onClick={() => handleClick(path)}>
            {label}
          </ButtonSwitch>
        ))}
      </Row>
    </Wrapper>
  )
}

export function FusdTabs({ active, setAction }: { active: boolean; setAction: (arg: boolean) => void }) {
  const { t } = useTranslation()
  const { sendEvent } = useAnalytics()

  const handleTabClick = React.useCallback(
    (isStake: boolean) => {
      setAction(isStake)
    },
    [setAction, sendEvent]
  )
  return (
    <Wrapper style={{ marginTop: '5px' }}>
      <Row style={{ padding: '3px' }} borderRadius={'12px'} backgroundColor={'#0B0C13'}>
        <ButtonSwitch active={active} height={'41px'} onClick={() => handleTabClick(true)}>
          {t('Deposit')}
        </ButtonSwitch>
        <ButtonSwitch active={!active} height={'41px'} onClick={() => handleTabClick(false)}>
          {t('Withdraw')}
        </ButtonSwitch>
      </Row>
    </Wrapper>
  )
}

export function ZapTabs({ active, setActive }: { active: string; setActive: (value: string) => void }) {
  const { t } = useTranslation()
  return (
    <Wrapper>
      <Row>
        <ButtonSwitch active={active === 'zap'} onClick={() => setActive('zap')}>
          {t('Zap')}
        </ButtonSwitch>

        <div style={{ padding: '6px' }}></div>

        <ButtonSwitch
          active={active === 'pool'}
          onClick={() => {
            setActive('pool')
          }}
        >
          {t('Liquidity')}
        </ButtonSwitch>

        <div style={{ padding: '6px' }}></div>

        <ButtonSwitch
          active={active === 'stablepool'}
          onClick={() => {
            setActive('stablepool')
          }}
        >
          {t('Stable Pool')}
        </ButtonSwitch>
      </Row>
    </Wrapper>
  )
}

export function MintTabs({ active, setActive }: { active: string; setActive: (value: string) => void }) {
  const { t } = useTranslation()
  return (
    <Wrapper>
      <Row style={{ padding: '3px' }} borderRadius={'12px'} backgroundColor={'transparent'}>
        <ButtonSwitch
          active={active === 'mint'}
          onClick={() => {
            setActive('mint')
          }}
        >
          {t('Mint')}
        </ButtonSwitch>

        <div style={{ padding: '6px' }}></div>

        <ButtonSwitch
          active={active === 'redeem'}
          onClick={() => {
            setActive('redeem')
          }}
        >
          {t('Redeem')}
        </ButtonSwitch>
      </Row>
    </Wrapper>
  )
}

export function AddRemoveTabs({ adding }: { adding: boolean }) {
  return (
    <TabsContainer>
      <RowBetween style={{ margin: '15px 0' }}>
        <HistoryLink to="/pool">
          <StyledArrowLeft />
        </HistoryLink>
        <ActiveText>{adding ? 'Add' : 'Remove'} Liquidity</ActiveText>
        <QuestionHelper
          text={
            adding
              ? 'When you add liquidity, you are given pool tokens representing your position. These tokens automatically earn fees proportional to your share of the pool, and can be redeemed at any time.'
              : 'Removing pool tokens converts your position back into underlying tokens at the current rate, proportional to your share of the pool. Accrued fees are included in the amounts you receive.'
          }
        />
      </RowBetween>
    </TabsContainer>
  )
}
