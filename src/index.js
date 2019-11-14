import React from "react";
import ReactDOM from "react-dom";

import "./styles.css";
import Timeline from "./Timeline";

function App() {
  return <Timeline />;
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
