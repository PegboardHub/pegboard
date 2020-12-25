import React from "react";
import ReactDOM from "react-dom";
import Block from "./components/Block";


const App = () => {
    return (
        <div>
            <Block x={1} y={1}/>
            <Block x={2} y={1}/>
            <Block x={3} y={1}/>
            <Block width={3} y={2} />

            <Block x={10} y={1} />
            <Block x={10} y={2} />
            <Block x={10} y={3} />
            <Block x={11} height={3} />
            {/* <Block width={4} y={1}/>
            <Block y={2}/>
            <Block x={4}/>
            <Block y={6}/>
            <Block y={9}/> */}
        </div>
    );
}

const renderApp = (Component) => {
    ReactDOM.render(<Component/>, document.getElementById('root'));
}

renderApp(App);
