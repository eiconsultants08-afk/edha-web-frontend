import React, { useState } from 'react';
import './footer.css';
import Modal from '../modal/modal';
import { useNavigate } from 'react-router';

const Footer = () => {
  const [showmodal, setShowmodal] = useState(false);
  const navigate = useNavigate()
  const openModal = () => {
    setShowmodal(true)
  }

  const closeModal = () => {
    setShowmodal(false)
  }

  return (

    <div className="footer-contents">


      <div className='footer-text'>
        <div>
          <p><a href='https://weathercastsolutions.com/' target="_blank" rel="noreferrer" className='weatherCast-link'>Powered by WeatherCast Solutions</a></p>
        </div>
        <div className='footer-links'>
          <p onClick={openModal} className='policy'>Privacy Policy</p>
          {showmodal && <Modal close={closeModal} />}
          <p style={{ margin: '0 3px' }}>|</p>
          <p onClick={()=>navigate("/contact")} className='weatherCast-contact'>Contact</p>
        </div>
      </div>

{/* 
      <div className='version'>
        <p>VIYAT <strong>v2.2.1</strong></p>
      </div> */}

    </div>
  );
};

export default Footer;
