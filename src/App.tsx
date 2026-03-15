"use client";

import React from "react";
import { BookContainer } from "./components/BookContainer";
import { Toolbar } from "./components/Toolbar";

const App: React.FC = () => {
  return (
    <>
      <BookContainer />
      <Toolbar />
    </>
  );
};

export default App;
