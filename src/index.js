import React, { useState } from "react";
import ReactDOM from "react-dom";

import "./styles.css";
import Timeline from "./Timeline";
import SpringModal from "./SpringModal";

const initialModalState = {
  modalOpen: false,
  modalTitle: "",
  modalDescription: "",
  modalDetails: "",
  modalLocation: "",
  modalStart: "",
  modalEnd: ""
};

function App() {
  const [modalState, setModalState] = useState(initialModalState);
  return (
    <>
      <Timeline modalState={modalState} setModalState={setModalState} />
      <SpringModal modalState={modalState} setModalState={setModalState} />
    </>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
