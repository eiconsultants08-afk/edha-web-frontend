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
          <p><a href='https://www.edhaainnovations.com/' target="_blank" rel="noreferrer" className='eddha-link'>Powered by Edhaa Innovations</a></p>
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
