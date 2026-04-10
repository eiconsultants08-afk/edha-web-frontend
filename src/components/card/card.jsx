import React from 'react';
import './card.css';

export default function Card({ ctype, children, style, tag: Tag = 'div', onSubmit, onClick}) {

  const handleClass = (type) => {
    if(type==='primary') return 'card-primary'; 
    if(type==='secondary') return 'card-secondary'; 

    return 'card-primary'
  };

  return <Tag onSubmit={onSubmit} onClick={onClick} className={`card ${handleClass(ctype)} ${ctype}`} style={style}>{children}</Tag>;

}

