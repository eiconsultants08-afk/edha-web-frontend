import React, { useContext, useEffect, useState } from "react";
import "./header.css";
import { useLocation } from "react-router-dom";
import { UserContext } from "../../context/UserProvider";
import moment from "moment-timezone";

export default function Header() {
  const location = useLocation();
  const { user } = useContext(UserContext);
  const { name } = user;

  const [timeIST, setTimeIST] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const time = moment().tz("Asia/Kolkata").format("HH:mm:ss");
      setTimeIST(time);
    };

    updateTime(); // Set initial time
    const interval = setInterval(updateTime, 1000); // Update every second

    return () => clearInterval(interval); // Cleanup
  }, []);

  const Paths = () => {
    if (location.pathname === "/technician/dashboard") return "Technician Dashboard";
    if (location.pathname === "/technician/patients") return "Patients";

    if (location.pathname === "/technician/create-patient") return "Create Patient";
    if (location.pathname === "/technician/add-test") return "Add Test Result";
    return "";
  };

  return (
    <div className="header-section">
      <div className="head-text">
        <p>
          Hi, <span>{name}</span>
        </p>
        <h1>{Paths()}</h1>
      </div>
      <div className="time-display">
        <p>Local Time : {timeIST}</p>
      </div>
    </div>
  );
}
