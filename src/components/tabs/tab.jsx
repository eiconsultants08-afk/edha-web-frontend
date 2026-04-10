import React, { useEffect, useState } from 'react';
import './tab.css';
import Button from '../button/button';

export default function Tab({
  tabs = [{ name: 'Tab 1', render: () => <div>Content for Tab 1</div>, key: 'tab1' }],
  defaultTab = null,
  onTabChange = () => {}
}) {
  const defaultTabObj = tabs.find(tab => tab.name === defaultTab) || tabs[0];
  const [activeTab, setActiveTab] = useState(defaultTabObj);

  useEffect(() => {
    onTabChange(activeTab);
  }, [activeTab, onTabChange]);

  return (
    <div className='tab-btns'>
      {tabs.map((item, index) => (
        <React.Fragment key={index}>
          <Button
            btnTitle={item.name}
            btnClass={activeTab.name === item.name ? 'primary' : 'secondary'}
            btnClick={() => setActiveTab(item)}
          />
        </React.Fragment>
      ))}
    </div>
  );
}


// USAGE 
// const tabsData = {
//     'Realtime Data': (
//       <div>
//         <h3>Realtime Data Content</h3>
//         <p>This is the realtime data section with live updates and metrics.</p>
//         <ul>
//           <li>CPU Usage: 45%</li>
//           <li>Memory: 2.3GB</li>
//           <li>Network: 125 Mbps</li>
//         </ul>
//       </div>
//     ),
//     'Weather Forecast': (
//       <div>
//         <h3>Weather Forecast</h3>
//         <p>Current weather conditions and 5-day forecast.</p>
//         <div>
//           <p>Today: Sunny, 24°C</p>
//           <p>Tomorrow: Partly cloudy, 22°C</p>
//           <p>Wednesday: Rainy, 18°C</p>
//         </div>
//       </div>
//     ),
//     'Advisory': (
//       <div>
//         <h3>Advisory Information</h3>
//         <p>Important notices and recommendations.</p>
//         <div style={{ backgroundColor: '#fff3cd', padding: '10px', border: '1px solid #ffeaa7' }}>
//           <strong>Notice:</strong> System maintenance scheduled for tonight at 2:00 AM.
//         </div>
//       </div>
//     )
//   };

//    <Tabs tabs={tabsData} defaultTab="Realtime Data" />
