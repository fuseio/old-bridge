import React, { useCallback, useState } from 'react'
import Question from '../../assets/svg/questionmark-white.svg'
import styled from 'styled-components'
import Tooltip from '../Tooltip'

const QuestionWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border: none;
  background: none;
  outline: none;
  cursor: default;
  border-radius: 36px;
  background-color: #393c57;
  color: ${({ theme }) => theme.text2};
  :hover,
  :focus {
    opacity: 0.7;
  }
  > img {
    opacity: 0.5;
  }
`

export default function QuestionHelper({ text }: { text: string }) {
  const [show, setShow] = useState<boolean>(false)

  const open = useCallback(() => setShow(true), [setShow])
  const close = useCallback(() => setShow(false), [setShow])

  return (
    <span style={{ marginLeft: 6, marginTop: 2 }}>
      <Tooltip text={text} show={show}>
        <QuestionWrapper onClick={open} onMouseEnter={open} onMouseLeave={close}>
          <img src={Question} alt="question icon" width={13} />
        </QuestionWrapper>
      </Tooltip>
    </span>
  )
}
