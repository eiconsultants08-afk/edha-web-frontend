import React, { useContext, useEffect, useState } from 'react'
import './contact.css'
import { FaLinkedinIn,FaTwitter,FaYoutube,FaEnvelope,FaGlobe } from 'react-icons/fa';
import { ImLocation } from "react-icons/im";
import { UserContext } from '../../context/UserProvider.jsx'
import Card from '../card/card.jsx'
import Button from '../button/button.jsx';
import { getRequestForm } from '../../api/api.jsx';
import TextBox from '../input/input.jsx';
import { notifyUser } from '../../shared/utils/utils.jsx';
import HeadText from '../headtext/headtext.jsx';

export default function Contact() {
    const [fields, setFormFields] = useState({
        fullName: "",
        email: "",
        organization: "",
        phone: "",
        subject: "",
        message: "",
    });
    const { user } = useContext(UserContext);


    useEffect(() => {
        if (user) {
            setFormFields((prevFields) => ({
                ...prevFields,
                fullName: user.username || '', 
                email: user.email || '',
                phone: user.phone || '',
                organization:user.organization || ''
            }));
        } else {
            setFormFields((prevFields) => ({
                ...prevFields,
                fullName: '',
                email: '',
                phone: '',
                organization:''
            }));
        }
    }, [user]);


    let contactContents = [
    {
        type: "text",
        name: "fullName",
        label: "Fullname",
        placeholder:"Enter fullname",
        value: fields.fullName,
        isEditable:false
    },
    {
        type: "email",
        name: "email",
        label: "Email",
        value: fields.email,
        isEditable:false
    },
    {
        type: "text",
        name: "organization",
        label: "Organization",
        value: fields.organization,
        isEditable:false
    },
    {
        type: "number",
        name: "phone",
        label: "Phone",
        value: fields.phone,
        isEditable:false
    },
    {
        type: "text",
        name: "subject",
        label: "Subject",
        placeholder:"Enter subject",
        value: fields.subject,
        isEditable:true
    },
    {
        type: "text",
        name: "message",
        label: "Message",
        placeholder:"Enter message",
        value: fields.message,
        isEditable:true
    },
    ];
      

  const reachusList = [
    {
        icon:<FaEnvelope size={23}/>,
        heading:'Email us',
        info:'info@weathercastsolutions.com'
    },
    {
        icon:<ImLocation size={23}/>,
        heading:'Visit us',
        info:'6032, 6th Floor, Rahul Bajaj Technology Innovation Centre (RBTIC), IIT Bombay Campus, Powai, Mumbai 400076'
    },
  ];

  const reactSocials = [
    {
      icon: <FaLinkedinIn size={20} />,
      link: "https://www.linkedin.com/company/weathercast-pvt-ltd/",
    },
    {
      icon: <FaTwitter size={20} />,
      link: "https://twitter.com/WeatherCastIN",
    },
    {
      icon: <FaYoutube size={20} />,
      link: "https://www.youtube.com/@weatherandclimate3749",
    },
    {
        icon: <FaGlobe size={20} />,
        link: "https://weathercastsolutions.com/",
      },
  ];
    
  const handleClick = (heading) => {
    if (heading === 'Email us') {
      window.location.href = 'mailto:info@weathercastsolutions.com';
    } else if (heading === 'Visit us') {
      window.open('https://maps.app.goo.gl/6GZgs5QzsD9yg2j27', '_blank');
    }
  };

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setFormFields((prevFields) => ({
      ...prevFields,
      [name]: value,
    }));
  };


  const handleSubmit = async (e) =>{
    e.preventDefault();

    const body = {
      fullName: fields.fullName,
      email: fields.email,
      company: fields.organization,
      phone: fields.phone,
      subject: `Query- ${fields.subject}`,
      message: fields.message,
    };

    const {success} = await getRequestForm(JSON.stringify(body))

    if (success) {
        notifyUser('success', 'Contact Form submitted successfully', 'top-right', "2px 0 0 40px");
        setFormFields({
            subject: "",
            message: "",
        });
        return;
    }

    notifyUser('error', "Form cannot be submit", 'top-right', "0 0 0 40px");
    return;
  }

  return (
    <div  className='contact-container'>
        <Card ctype="card-secondary reach-container">
            <HeadText heading="Reach us"/>
            <div className='reach-content'>
                {reachusList.map((item, index) => (
                    <div className='reach-info' key={index}  onClick={() => handleClick(item.heading)}>
                        <div className='reach-icons'>{item.icon}</div>
                        <div className='reach-text'>
                            <h4>{item.heading}</h4>
                            <p>{item.info}</p>
                        </div>
                    </div>
                ))}
            </div>
            <div className='reach-socials'>
                {reactSocials.map((item, index) => (
                    <React.Fragment key={index}>
                        <a href={item.link} target="_blank" rel="noopener noreferrer">{item.icon}</a>
                    </React.Fragment>
                ))}
            </div>
        </Card>
        <form className='request-container' onSubmit={handleSubmit}>
            <HeadText type={'heading'} title="Request Information"/>
        
            <div className='request-input'>
                {contactContents.map((item,index) => (
                    <React.Fragment key={index}>
                    <TextBox
                    labelText={item.label}
                    type={item.type}
                    placeholder={item.placeholder || item.name}
                    value={item.value}
                    name={item.name}
                    change={handleFieldChange}
                    required={true}
                    isEditable={item.isEditable}
                    />
                    </React.Fragment>))}
            </div>

            <Button btntype={"submit"} btnTitle={"submit"}/>
        </form>
    </div>
  )
}
