import React, { useState } from 'react';
import { CheckNftSecurity } from "./CheckNftSecurity";
import { CheckSiteSecurity } from "./CheckSiteSecurity";
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import FeedbackForm from "./Feedback";
import "./App.css"

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      className="fullScreenTab"
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}


TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`,
  };
}


function App() {
  const [value, setValue] = React.useState(0);
  const [loading, setLoading] = useState(false);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleLoading = (loadingState) => {
      setLoading(loadingState)
  };

  return (
        <div className="main-contaiener">
      <header>
        <div className="logo">
            <img src="/logo.png" alt="logo"/>
        </div>
        <h1>NFT DEFENDER</h1>
      </header>
    

      <Box className="tabBox" sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Tabs
          value={value}
          onChange={handleChange}
          indicatorColor="secondary"
          textColor="inherit"
          variant="fullWidth"
          aria-label="full width tabs example"
          disabled={loading}
        >
          <Tab label="Site Security" {...a11yProps(0)}  />
          <Tab label="NFT Security" {...a11yProps(1)} />
          <Tab label="Feedback" {...a11yProps(2)} />
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
      <CheckSiteSecurity onLoading={handleLoading}/>
      </TabPanel>
      <TabPanel value={value} index={1}>
      <CheckNftSecurity onLoading={handleLoading}/>
      </TabPanel>
      <TabPanel value={value} index={2}>
        <FeedbackForm onLoading={handleLoading}/>
      </TabPanel>

      <footer>
        <p>Support : <a href="https://docs.google.com/document/d/e/2PACX-1vRtUVnIfJSbejeR2NE6nt07zLXqK1N_34THjOl_55-0jU4rHUlMi-sAro4YLY2ePI-MK0WGlemX95hx/pub" target="_blank">Documentation</a> </p>
      </footer>
    </div>
 
  )
}

export default App;


