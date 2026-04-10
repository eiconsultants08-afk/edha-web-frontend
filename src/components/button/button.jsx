import React from 'react'
import './button.css'

export default function Button({ btntype, btnName, btnTagClass, btnValue, btnStyle, btnClick = () => { }, isEditable, btnTitle, btnClass, form}) {

    const handleClass = (classes) => {

        if (classes === "primary") return "btn-primary";
        if (classes === "secondary") return "btn-secondary";
        
        return "btn-primary";
    }

    return (
        <div className={(handleClass(btnClass))}>
            <button type={btntype} className={btnTagClass ? btnTagClass : ''} disabled={isEditable} name={btnName} value={btnValue} onClick={btnClick} form={form} style={isEditable ? { backgroundColor: '#175398', color: 'white' } : btnStyle}>
                {btnTitle}
            </button> 
        </div>
    )
}