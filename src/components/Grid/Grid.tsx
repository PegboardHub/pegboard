import React, { useState, useMemo, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { useSprings, animated, interpolate } from "react-spring";
import { useDrag } from "react-use-gesture";
import styled from 'styled-components';
import _ from 'lodash';
import { calculateResize, checkCollisions, createCollisionBoard } from "./calculations";
import { getRandomColor, isOnEdge } from './utils';
import { withResizeDetector } from 'react-resize-detector';
import { Constraints, Input } from "./types";


const SIZE = 100;
const MARGIN = 5;
const EDGE_THRESHOLD = 10;

const OuterContainer = styled.div`
  display: flex;
  flex: 1;
  position: relative;
  min-height: 100px;
`;


const Cell = styled.div<{ size: number, margin: number, shown: boolean }>`
  width: ${({ size = SIZE, margin = MARGIN }) => size + margin * 2}px;
  height: ${({ size = SIZE, margin = MARGIN }) => size + margin * 2}px;
  /* background-color: #d1d1d1; */
  box-sizing: border-box;
  border: ${({shown}) => shown && "1px solid black"};
  opacity: 0.4;
`;


const Container = styled.div<{ isCol: boolean }>`
  display: flex;
  flex-direction: ${props => props.isCol ? 'column' : 'row'};
`;

const Edge = styled.div`
  position: absolute;
  z-index: 10;
  /* pointer-events: none; */
  /* background-color: black; */
`;

const TopEdge = styled(Edge) <{ size: number }>`
  top: 0;
  left: 0;
  height: ${({ size }) => size}px;
  width: 100%;
  cursor: ns-resize;
`;

const BottomEdge = styled(Edge) <{ size: number }>`
  left: 0;
  bottom: 0;
  height: ${({ size }) => size}px;
  width: 100%;
  cursor: ns-resize;
`;

const LeftEdge = styled(Edge) <{ size: number }>`
  top: 0;
  left: 0;
  width: ${({ size }) => size}px;
  height: 100%;
  cursor: ew-resize;
`;

const RightEdge = styled(Edge) <{ size: number }>`
  top: 0;
  right: 0;
  width: ${({ size }) => size}px;
  height: 100%;
  cursor: ew-resize;
`;


const Corner = styled(Edge) <{ size: number }>`
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  border-radius: 10px;
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


type RepeatProps = {
  Component: React.ComponentType
  isCol?: boolean
  count?: number
  props?: any
}

const Repeat = ({ Component, isCol = false, count = 12, props = {} }: RepeatProps) => () => {
  return (
    <Container isCol={isCol}>
      {
        [...Array(count).keys()].map((_, index) => <Component key={index} {...props} />)
      }
    </Container>
  )
}

const Content = styled.div<{ color?: string }>`
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




const input: Input[] = [
  { x: 1, y: 1, width: 1, height: 1, backgroundColor: getRandomColor() },
  { x: 1, y: 2, width: 1, height: 1, backgroundColor: getRandomColor() },
  { x: 1, y: 3, width: 2, height: 1, backgroundColor: getRandomColor() },
  { x: 6, y: 3, width: 1, height: 1, backgroundColor: getRandomColor() },
  { x: 6, y: 1, width: 1, height: 1, backgroundColor: getRandomColor() },
]


const calculateActual = (curr: Input, size = SIZE, margin = MARGIN): Input => ({
  ...curr,
  width: curr.width * size + (curr.width - 1) * margin * 2,
  height: curr.height * size + (curr.height - 1) * margin * 2,
  x: curr.x * (size + margin * 2) + margin,
  y: curr.y * (size + margin * 2) + margin,
});



type fnProps = {
  vals: Input[]
  down?: boolean
  currentIndex?: number
  immediate?: boolean
}

type SpringStyleProps = Input & {
  immediate: (key: any) => boolean,
  zIndex: number
  opacity: number
}
type SpringFunction = (index: number) => SpringStyleProps

const fn = ({ vals, down, currentIndex, immediate = false }: fnProps) => (prevFn?: SpringFunction): SpringFunction => (index: number) => {
  return {
    ...vals[index],
    width: vals[index].width,
    height: vals[index].height,
    x: vals[index].x,
    y: vals[index].y,
    opacity: down && (index === currentIndex) ? 0.8 : 1,
    immediate: key => immediate || ['zIndex'].includes(key),
    zIndex: down ? (index === currentIndex ? 1 : 0) : prevFn?.(index)?.zIndex ?? 0,
  }
}

type WarningFnProps = {
  currentIndex?: number
  isWarning?: boolean
}

type WarningStyleProps = {
  opacity: number
}

const warningFn = ({ currentIndex, isWarning }: WarningFnProps) => (index: number): WarningStyleProps => {
  return {
    opacity: currentIndex === index && isWarning ? 0.3 : 0
  }
}

type BackGridType = {
  size: number
  margin: number
  xCount: number
  yCount: number
  shown: boolean
}

const BackGrid: React.FC<BackGridType> = ({ size, margin, xCount, yCount, shown }) => {
  const Comp = Repeat({ Component: Repeat({ Component: Cell, count: xCount, props: { size, margin, shown } }), isCol: true, count: yCount });
  return <Comp />
}


export type GridProps = {
  /** max cells in x direction */
  maxX?: number
  /** max cells in y direction */
  maxY?: number
  /** show debug grid */
  debugGrid?: boolean
}

/**
 * Currently doesn't support mobile sizes
 */
export const Grid: React.FC<GridProps> = withResizeDetector<GridProps & { width: number }>(({ width, maxX, maxY, debugGrid = false }) => {
  const order = useRef<Input[]>(input);
  const constraints = useMemo<Constraints>(() => ({
    x: maxX ?? 1,
    y: maxY ?? 1,
    margin: MARGIN,
  }), [maxX, maxY])
  const size = useMemo(() => Math.floor(((width ?? 0) - (constraints.margin * 2 * constraints.x)) / constraints.x) || SIZE, [width, constraints]);
  const [warningProps, warningSet] = useSprings<WarningStyleProps>(input.length, warningFn({}));
  const [props, set] = useSprings<SpringStyleProps>(input.length, fn({ vals: order.current.map(c => calculateActual(c, size, constraints.margin)) })());
  useEffect(() => {
    set(fn({ vals: order.current.map(c => calculateActual(c, size, constraints.margin)), immediate: true })())
  }, [size]);

  const bind = useDrag(({ event, xy, args: [i], first, memo, down, movement: [x, y] }) => {
    const currDim = order.current[i];

    const movedCellX = Math.round(x / (size + 2 * constraints.margin));
    const movedCellY = Math.round(y / (size + 2 * constraints.margin));

    const sizes = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const onEdge = first ? isOnEdge(sizes, xy, EDGE_THRESHOLD) : memo.onEdge;

    const newMap: Input[] = [...order.current];
    const board = first ? createCollisionBoard(constraints.x, constraints.y, i, newMap) : memo.board;
    let wantedCell: Partial<Input>;
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
      warningSet(warningFn({ currentIndex: i, isWarning: isColliding }));
    }
    const newFn = fn({ vals: actual, down, currentIndex: i })(memo?.prevFn);
    set(newFn)
    return {
      onEdge,
      board,
      prevFn: newFn,
    }
  })


  return (
    <OuterContainer>
      <div style={{ position: 'absolute' }}>
        <BackGrid shown={debugGrid} size={size} margin={constraints.margin} xCount={constraints.x} yCount={constraints.y} />
      </div>
      <div style={{ position: 'relative', top: 0, left: 0 }}>
        {
          props.map(({ x, y, backgroundColor, ...rest }, i) => {
            return (
              <animated.div
                {...bind(i)}
                key={i}
                // @ts-ignore
                style={{
                  ...rest,
                  position: 'absolute',
                  transform: interpolate([x, y], (x, y) => `translate3d(${x}px,${y}px,0)`),
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
                  {/* @ts-ignore */}
                  <Warning style={{ ...warningProps[i] }} />
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
}) as React.FC<GridProps>;

Grid.displayName = 'Grid';
Grid.defaultProps = {
  maxX: 12,
  maxY: 6,
  debugGrid: false,
}

export default Grid;