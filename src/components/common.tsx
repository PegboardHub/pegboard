import styled from 'styled-components';


export type ContainerProps = {
  stretched?: boolean
  scrollable?: boolean
}

export const RowContainer = styled.div<ContainerProps>`
  display: flex;
  position: relative;
  flex: ${({stretched}) => stretched ? 1 : undefined};
  overflow: ${({scrollable}) => scrollable ? 'auto' : undefined};
`;

export const ColContainer = styled(RowContainer)`
  flex-direction: column;
`;
