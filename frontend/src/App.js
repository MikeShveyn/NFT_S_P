import React, { useEffect, useState } from "react";
import {CheckNftSecurity, CheckSiteSecurity}  from "./logic";


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


