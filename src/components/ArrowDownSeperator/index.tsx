import React from 'react'
import styled from 'styled-components'

const Container = styled.div`
  position: relative;
  height: 20px;
  width: 100%;
  z-index: 1;
  margin: 16px 0px;
`
const Border = styled.div`
  border-top: 1px solid rgba(94, 94, 111);
  position: absolute;
  width: 100%;
  top: 50%;
  z-index: 1;
`
const ArrowLogo = styled.div`
  height: fit-content;
  margin: 0 auto;
  width: fit-content;
  position: relative;
  z-index: 99999;
`
const ArrowDownSeperator = () => {
  return (
    <Container>
      <Border></Border>
      <ArrowLogo>
        <svg width="20" height="20" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="0.25" y="0.25" width="15.5" height="15.5" rx="7.75" fill="rgba(94,94,111)" />
          <path
            d="M8.36364 4.36328C8.36364 4.16245 8.20083 3.99964 8 3.99964C7.79917 3.99964 7.63636 4.16245 7.63636 4.36328H8.36364ZM7.74287 11.8931C7.88488 12.0351 8.11512 12.0351 8.25713 11.8931L10.5713 9.57897C10.7133 9.43696 10.7133 9.20672 10.5713 9.06471C10.4293 8.9227 10.199 8.9227 10.057 9.06471L8 11.1217L5.94296 9.06471C5.80095 8.9227 5.57071 8.9227 5.4287 9.06471C5.28669 9.20672 5.28669 9.43696 5.4287 9.57897L7.74287 11.8931ZM7.63636 4.36328V11.636H8.36364V4.36328H7.63636Z"
            fill="white"
          />
          <rect x="0.25" y="0.25" width="15.5" height="15.5" rx="7.75" stroke="rgba(94,94,111)" strokeWidth="0.5" />
        </svg>
      </ArrowLogo>
    </Container>
  )
}
export default ArrowDownSeperator
