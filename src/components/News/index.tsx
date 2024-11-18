import { Box, Card } from 'rebass/styled-components'
import styled from 'styled-components'
import useScript from '../../hooks/useScript'
import { TYPE } from '../../theme'
import Loader from '../Loaders/news'

export const TwitterContainer = styled.div`
  > a {
    text-decoration: none;
    color: #ffffff;
    padding-bottom: 0px;
  }
  position: relative;

  z-index: 10;
  height: 285px;
`

export const Header = styled.div`
  font-family: 'Inter';
  font-size: 20px;
  text-align: left;
  font-weight: 500;
  font-stretch: normal;
  font-style: normal;
  letter-spacing: normal;
  width: 100%;
`
export const Item = styled.div`
  display: flex;
  flex: 1 1 90%;
  flex-wrap: wrap;
  font-size: 18px;
  line-height: 39px;
  font-weight: 500;
  text-align: left;
  > img {
    margin-right: 1rem;
  }
  > b {
    color: #003cff;
  }
  > p {
    margin: 0rem;
  }
  > p > span {
    text-align: center;
  }
`

export const Wrap = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`

export const Twitter = styled.div`
  padding-bottom: 0px;
  display: block;
  position: absolute;
  height: 74%;
  top: 0;
  overflow: hidden;
  width: 99%;

  .timeline-Tweet {
    padding: 0;
  }
`

export default function News() {
  useScript('https://platform.twitter.com/widgets.js')

  return (
    <Card minHeight={'100%'}>
      <TwitterContainer>
        <Box width="100%" textAlign="left">
          <TYPE.mediumHeader>News</TYPE.mediumHeader>
        </Box>

        <Wrap>
          <Twitter>
            <a
              className="twitter-timeline"
              data-chrome="transparent nofooter noborders noheader noscrollbar"
              data-height="325"
              data-theme="dark"
              href="https://twitter.com/voltfinance"
            >
              <Loader />
            </a>{' '}
          </Twitter>
        </Wrap>
      </TwitterContainer>
    </Card>
  )
}
