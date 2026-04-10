// shared/Datacard.js
import React from 'react';
import './datacard.css';
import Card from '../card/card';

const Datacard = ({ cardList }) => {
    return (
        <div className="datacard-container">
            {cardList.map((card, index) => (
                <React.Fragment key={index}>
                    <Card  ctype={"datacard-items"}>
                        <div className="card-icon">{card.icon}</div>
                        <div className="card-content">
                            <h3 className="card-title">{card.title}</h3>
                            <p className="card-value">{card.value}</p>
                        </div>
                    </Card>
                </React.Fragment>

            ))}
        </div>
    );
};

export default Datacard;
