import React from "react";
import { CheckNftSecurity } from "./CheckNftSecurity";
import { CheckSiteSecurity } from "./CheckSiteSecurity";
import "./App.css"

function App() {
  return (
    <div className="main-contaiener">
      <h1>NFT DEFENDER</h1>
      <CheckSiteSecurity/>
      <CheckNftSecurity/>
    </div>
  )
}

export default App;


