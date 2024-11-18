import styled from 'styled-components';
import { preset } from '../../theme/preset'

const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
`;

const ToggleLabel = styled.label`
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
`;

const Slider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${preset.colors.gray70};
  transition: .4s;
  border-radius: 34px;

  &:before {
    position: absolute;
    content: "";
    height: 26px;
    width: 26px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    transition: .4s;
    border-radius: 50%;
  }
`;

const Checkbox = styled.input`
  opacity: 0;
  width: 0;
  height: 0;

  &:checked + ${Slider} {
    background-color: ${preset.colors.highlight};
  }

  &:focus + ${Slider} {
    box-shadow: 0 0 1px ${preset.colors.highlight};
  }

  &:checked + ${Slider}:before {
    transform: translateX(26px);
  }
`;

export interface ToggleProps {
  id?: string
  isActive: boolean
  toggle: () => void
}

export default function Toggle({ isActive, toggle }: ToggleProps) {
  return (
    <ToggleContainer>
      <ToggleLabel>
        <Checkbox type="checkbox" checked={isActive} onChange={toggle} />
        <Slider />
      </ToggleLabel>
    </ToggleContainer>
  )
}
