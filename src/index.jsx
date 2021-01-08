import { AnimatePresence } from "framer-motion";
import React from "react";
import ReactDOM from "react-dom";
import GlobalStyle from "./components/Grid/globalStyles";
import { Grid } from "./components/Grid/Grid";


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
