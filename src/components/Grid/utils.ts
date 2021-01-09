import {Dimensions} from './types';

export const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};


export const LEFT_EDGE = 1;
export const RIGHT_EDGE = 2;
export const TOP_EDGE = 4;
export const BOTTOM_EDGE = 8;


export const isOnEdge = (boundingBox: Dimensions, place: [x: number, y: number], threshold: number = 10): number => {
  const [x, y] = place;
  let mask = 0;
  // left edge
  if (x - boundingBox.x >= 0 && x - boundingBox.x <= threshold && y >= boundingBox.y && y <= boundingBox.y + boundingBox.height) {
    mask |= LEFT_EDGE;
  }
  // right edge
  if (boundingBox.width + boundingBox.x - x >= 0 && boundingBox.width + boundingBox.x - x <= threshold &&
      y >= boundingBox.y && y <= boundingBox.y + boundingBox.height) {
    mask |= RIGHT_EDGE;
  }

  // top edge
  if (y - boundingBox.y >= 0 && y - boundingBox.y <= threshold && x >= boundingBox.x && x <= boundingBox.x + boundingBox.width) {
    mask |= TOP_EDGE;
  }
  // bottom edge
  if (boundingBox.height + boundingBox.y - y >= 0 && boundingBox.height + boundingBox.y - y <= threshold &&
      x >= boundingBox.x && x <= boundingBox.x + boundingBox.width) {
    mask |= BOTTOM_EDGE;
  }

  return mask;
};
