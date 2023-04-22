import React from "react";
import { CheckNftSecurity } from "./CheckNftSecurity";
import { CheckSiteSecurity } from "./CheckSiteSecurity";
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
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

  const handleChange = (event, newValue) => {
    setValue(newValue);
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
        >
          <Tab label="Site Security" {...a11yProps(0)} />
          <Tab label="NFT Security" {...a11yProps(1)} />
          <Tab label="Feedback" {...a11yProps(2)} />
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
      <CheckSiteSecurity/>
      </TabPanel>
      <TabPanel value={value} index={1}>
      <CheckNftSecurity/>
      </TabPanel>
      <TabPanel value={value} index={2}>
        Item Three
      </TabPanel>

      <footer>
        <p>Support : <a href="" target="_blank">Support Team</a> </p>
      </footer>
    </div>
 
  )
}

export default App;


