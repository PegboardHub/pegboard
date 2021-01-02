import React, {useState} from 'react';
import styled from 'styled-components';
import { RowContainer } from './common';

const MARGIN = 5;
const DEFAULT_SIZE = 100;

const Wrapper = styled(RowContainer)`
  position: absolute;
  background-color: #123;
  width: ${({width=1, size=DEFAULT_SIZE}) => width * size + (width - 1) * MARGIN}px;
  height: ${({height=1, size=DEFAULT_SIZE}) => height * DEFAULT_SIZE + (height - 1) * MARGIN}px;
  transform: translate(${({left=0, size=DEFAULT_SIZE}) => left * (size + MARGIN)}px, ${({top=0, size=DEFAULT_SIZE}) => top * (size + MARGIN)}px);
  margin: ${MARGIN}px;
`;


export const Block = ({width, height, x, y}) => { 
  return (
    <Wrapper width={width} height={height} top={y} left={x}/>
  )
}

export default Block;
