import React, { useState, useMemo, useRef, useEffect } from "react";
import { useSprings, animated, interpolate } from "react-spring"
import { useDrag } from "react-use-gesture";
import styled from 'styled-components';
import _ from 'lodash';
import { calculateResize, checkCollisions, createCollisionBoard } from "./calculations";
import { getRandomColor, isOnEdge } from './utils';
import { withResizeDetector } from 'react-resize-detector';


const SIZE = 100;
const MARGIN = 5;
const EDGE_THRESHOLD = 10;

const OuterContainer = styled.div`
  display: flex;
  flex: 1;
  position: relative;
`;


const Cell = styled.div`
  width: ${({ size = SIZE, margin = MARGIN }) => size + margin * 2}px;
  height: ${({ size = SIZE, margin = MARGIN }) => size + margin * 2}px;
  /* background-color: #d1d1d1; */
  box-sizing: border-box;
  border: 1px solid black;
  opacity: 0.4;
`;


const Container = styled.div`
  display: flex;
  flex-direction: ${props => props.isCol ? 'column' : 'row'};
`;

const Edge = styled.div`
  position: absolute;
  z-index: 10;
  /* pointer-events: none; */
  /* background-color: black; */
`;

const TopEdge = styled(Edge)`
  top: 0;
  left: 0;
  height: ${({ size }) => size}px;
  width: 100%;
  cursor: ns-resize;
`;

const BottomEdge = styled(Edge)`
  left: 0;
  bottom: 0;
  height: ${({ size }) => size}px;
  width: 100%;
  cursor: ns-resize;
`;

const LeftEdge = styled(Edge)`
  top: 0;
  left: 0;
  width: ${({ size }) => size}px;
  height: 100%;
  cursor: ew-resize;
`;

const RightEdge = styled(Edge)`
  top: 0;
  right: 0;
  width: ${({ size }) => size}px;
  height: 100%;
  cursor: ew-resize;
`;


const Corner = styled(Edge)`
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  border-radius: 10px;
  /* background-color: gray; */
`;

const TopLeftCorner = styled(Corner)`
  top: 0;
  left: 0;
  cursor: nwse-resize;
`;
const TopRightCorner = styled(Corner)`
  top: 0;
  right: 0;
  cursor: nesw-resize;
`;
const BottomLeftCorner = styled(Corner)`
  bottom: 0;
  left: 0;
  cursor: nesw-resize;
`;
const BottomRightCorner = styled(Corner)`
  bottom: 0;
  right: 0;
  cursor: nwse-resize;
`;


const Repeat = ({ Component, isCol = false, count = 12, props = {} }) => () => {
  return (
    <Container isCol={isCol}>
      {
        [...Array(count).keys()].map((_, index) => <Component key={index} {...props} />)
      }
    </Container>
  )
}

const Content = styled.div`
  position: relative;
  background-color: ${({ color = '#123' }) => color};
  width: 100%;
  height: 100%;
  z-index: 0;
  left: 0;
  top: 0;
  border-radius: 10px;
  overflow: hidden;
`;

const Warning = styled(animated.div)`
  position: absolute;
  background-color: #F22;
  width: 100%;
  height: 100%;
  pointer-events: none;
  top: 0;
  left: 0;
  /* opacity: 0.5; */
  z-index: 1;
  border-radius: 10px;
`;


const Wrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  user-select: none;
  pointer-events: auto;
  box-sizing: border-box;
  cursor: move;
  border-radius: 10px;
  overflow: hidden;
  left: 0;
  top: 0;
`;




const input = [
  { x: 1, y: 1, width: 1, height: 1, backgroundColor: getRandomColor() },
  { x: 1, y: 2, width: 1, height: 1, backgroundColor: getRandomColor()  },
  { x: 1, y: 3, width: 2, height: 1, backgroundColor: getRandomColor()  },
  { x: 6, y: 3, width: 1, height: 1, backgroundColor: getRandomColor()  },
  { x: 6, y: 1, width: 1, height: 1, backgroundColor: getRandomColor()  },
]


const calculateActual = (curr, size = SIZE, margin = MARGIN) => ({
  ...curr,
  width: curr.width * size + (curr.width - 1) * margin * 2,
  height: curr.height * size + (curr.height - 1) * margin * 2,
  x: curr.x * (size + margin * 2) + margin,
  y: curr.y * (size + margin * 2) + margin,
});

const fn = ({ vals, down, currentIndex, immediate = false}) => index => {
  return {
    ...vals[index],
    width: vals[index].width,
    height: vals[index].height,
    x: vals[index].x,
    y: vals[index].y,
    zIndex: down && (index === currentIndex) ? 1 : 0,
    opacity: down && (index === currentIndex) ? 0.8 : 1,
    immediate: key => immediate || ['zIndex'].includes(key),
  }
}

const warningFn = ({currentIndex, isWarning}) => index => {
  return {
    opacity: currentIndex === index && isWarning ? 0.3 : 0
  }
}


const BackGrid = ({ size, margin, xCount, yCount }) => {
  const Comp = Repeat({ Component: Repeat({ Component: Cell, count: xCount, props: { size, margin } }), isCol: true, count: yCount });
  return <Comp />
}

export const Grid = withResizeDetector(({ width }) => {
  const order = useRef(input);
  const [constraints, setConstraints] = useState({
    x: 12,
    y: 6,
    margin: MARGIN,
  });
  const size = useMemo(() => Math.floor((width - (constraints.margin * 2 * constraints.x)) / constraints.x) || SIZE, [width]);
  const [warningProps, warningSet] = useSprings(input.length, warningFn({}));
  const [props, set] = useSprings(input.length, fn({ vals: order.current.map(c => calculateActual(c, size, constraints.margin)) }));
  useEffect(() => {
    set(fn({ vals: order.current.map(c => calculateActual(c, size, constraints.margin)), immediate: true }))
  }, [size]);

  const bind = useDrag(({ event, xy, args: [i], first, memo, down, movement: [x, y] }) => {
    const currDim = order.current[i];

    const movedCellX = Math.round(x / (size + 2 * constraints.margin));
    const movedCellY = Math.round(y / (size + 2 * constraints.margin));

    const sizes = event.currentTarget.getBoundingClientRect();
    const onEdge = first ? isOnEdge(sizes, xy, EDGE_THRESHOLD) : memo.onEdge;

    const newMap = [...order.current];
    const board = first ? createCollisionBoard(constraints.x, constraints.y, i, newMap) : memo.board;
    let wantedCell;
    if (onEdge) {
      // for scaling
      wantedCell = calculateResize(currDim, onEdge, movedCellX, movedCellY, constraints, down);
    } else {
      // for dragging
      wantedCell = {
        x: _.clamp(currDim.x + movedCellX, 0, constraints.x - currDim.width),
        y: _.clamp(currDim.y + movedCellY, 0, constraints.y - currDim.height),
      };
    }
    newMap[i] = {
      ...newMap[i],
      ...wantedCell,
    }
    const isColliding = checkCollisions(newMap[i], board);

    let actual = newMap.map(c => calculateActual(c, size, constraints.margin));

    if (!down) {
      // if mouse released save the state.
      if (isColliding) {
        actual = order.current.map(c => calculateActual(c, size, constraints.margin)); // restore original
      } else {
        order.current = newMap;
      }
      warningSet(warningFn({}));
    } else {
      warningSet(warningFn({currentIndex: i, isWarning: isColliding}));
    }

    set(fn({ vals: actual, down, currentIndex: i}))
    return {
      onEdge,
      board,
    }
  })


  return (
    <OuterContainer>
      <div style={{ position: 'absolute' }}>
        <BackGrid size={size} xCount={constraints.x} yCount={constraints.y} />
      </div>
      <div style={{ position: 'relative', top: 0, left: 0 }}>
        {
          props.map(({ x, y, backgroundColor, ...rest }, i) => {
            return (
              <animated.div
                {...bind(i)}
                key={i}
                style={{
                  ...rest,
                  position: 'absolute',
                  transform: interpolate([x, y], (x, y) => `translate3d(${x}px,${y}px,0)`)
                }}
                children={<Wrapper>
                  <TopEdge size={EDGE_THRESHOLD - 2} />
                  <BottomEdge size={EDGE_THRESHOLD - 2} />
                  <LeftEdge size={EDGE_THRESHOLD - 2} />
                  <RightEdge size={EDGE_THRESHOLD - 2} />
                  <TopLeftCorner size={EDGE_THRESHOLD - 2} />
                  <TopRightCorner size={EDGE_THRESHOLD - 2} />
                  <BottomLeftCorner size={EDGE_THRESHOLD - 2} />
                  <BottomRightCorner size={EDGE_THRESHOLD - 2} />

                  <Warning style={{...warningProps[i]}} />
                  <Content color={order.current[i].backgroundColor}>

                  </Content>

                </Wrapper>}
              />
            )
          }
          )

        }
      </div>
    </OuterContainer>
  )
});
