import React from 'react';
import './headtext.css';

const HeadText = ({ title, type, ctype, className }) => {
    let TagName = 'div'; // Default fallback tag

    if (type === 'heading') TagName = 'h1';
    else if (type === 'sub-heading') TagName = 'h4';
    else if (type === 'sub-title') TagName = 'h6';

    return (
        <TagName className={className} style={ctype === 'primary' ? { color: 'white' } : undefined}>
            {title}
        </TagName>
    );
};

export default HeadText;
