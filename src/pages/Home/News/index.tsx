import { useEffect, useState } from 'react'
import { Flex, Text } from 'rebass/styled-components'

import Carousel from '../../../wrappers/Carousel'
import Section from '../../../collections/Section'
import { ComponentLoader } from '../../../wrappers/ComponentLoader'

// https://www.toptal.com/developers/feed2json/convert?url=https://medium.com/feed/@voltage.finance
import newsListJSON from '../../../assets/json/landing/news.json'

const News = () => {
  const [data, setData] = useState([])

  useEffect(() => {
    const items = newsListJSON?.items

    let data = null
    if (items?.length === 0) {
      data = [
        <ComponentLoader key={1} dark loading={true} width={'100%'} height={500} />,
        <ComponentLoader key={2} dark loading={true} width={'100%'} height={500} />,
        <ComponentLoader key={3} dark loading={true} width={'100%'} height={500} />,
      ]
    } else {
      data = items
    }

    setData(data)
  }, [])

  return (
    <Section pb={100}>
      <Section.Header width={'100%'} fontSize={5}>
        <Flex width={'100%'} justifyContent={'space-between'}>
          <Text textAlign={'left'}> Latest News</Text>
        </Flex>
      </Section.Header>

      <Section.Body pt={30}>
        <Carousel data={data} />
      </Section.Body>
    </Section>
  )
}
export default News
