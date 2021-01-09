import {hot} from 'react-hot-loader/root';

import React from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import GlobalStyle from './components/globalStyles';
import {Grid} from '~/components/Grid/Grid';
import {RowContainer, ColContainer} from './components/common';
import NavBar from './components/Navbar/Navbar';

const AppWrapper = styled(RowContainer)`
  width: 100%;
  height: 100%;
`;

const App = () => {
  return (
    <>
      <GlobalStyle />
      <AppWrapper>
        <NavBar/>
        <ColContainer stretched scrollable>
          <Grid debugGrid />
        </ColContainer>
      </AppWrapper>
    </>
  );
};

const renderApp = (Component: React.FC) => {
  ReactDOM.render(<Component />, document.getElementById('root'));
};

renderApp(hot(App));
