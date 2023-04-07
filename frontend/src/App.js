import React, { useEffect, useState } from "react";
import {CheckNftSecurity, CheckSiteSecurity}  from "./logic";


function App() {
  return (
    <div>
      <CheckSiteSecurity/>
      {/* <CheckNftSecurity/> */}
    </div>
  )
}

export default App;


