import { AnimatePresence } from "framer-motion";
import React from "react";
import ReactDOM from "react-dom";
import Block from "./components/Block";
import GlobalStyle from "./components/globalStyles";
import { Grid } from "./components/Grid";


const App = () => {
    return (
        <>
            <GlobalStyle/>
            <Grid/>
        </>
    );
}

const renderApp = (Component) => {
    ReactDOM.render(<Component/>, document.getElementById('root'));
}

renderApp(App);
