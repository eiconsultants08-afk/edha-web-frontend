import React, { useState, useContext } from "react";
import "./sidebar.css";
import { NavLink, useNavigate } from "react-router-dom";
import { FaTerminal, FaTools, FaUserAlt } from "react-icons/fa";
import { TbDeviceImacCog } from "react-icons/tb";
import { IoIosAnalytics } from "react-icons/io";
import { RxCross1, RxHamburgerMenu } from "react-icons/rx";
import { AuthContext } from "../../context/AuthProvider";
import { UserContext } from "../../context/UserProvider";
import Button from "../button/button";
import { logout } from "../../api/api";
import { notifyUser } from "../../shared/utils/utils";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  const { auth, updateAuth } = useContext(AuthContext);
  const { updateUser } = useContext(UserContext);

  const navigate = useNavigate();

  /* ================= LOGOUT ================= */

  const handleClick = async (e) => {
    e.preventDefault();

    const { success, message } = await logout();

    if (success) {
      notifyUser("success", "Logout Successful", "top-center", "0 25px 5px");

      updateAuth({});
      updateUser({});

      navigate("/login");
    } else {
      notifyUser("error", message, "top-center");
    }
  };

  const getMenuItems = () => {
    let menuItem = [];

    /* ===== ADMIN ===== */

    if (auth?.role === "ADMIN") {
      menuItem.push(
        {
          path: "/admin/dashboard",
          name: "Dashboard",
          icon: <IoIosAnalytics size={22} />,
        },
        {
          path: "/technicians",
          name: "Technicians",
          icon: <FaTools size={20} />,
        },
        {
          path: "/patients",
          name: "Patients",
          icon: <FaUserAlt />,
        },
        {
          path: "/devices",
          name: "Devices",
          icon: <TbDeviceImacCog size={22} />,
        },
        {
          path: "/admin/profile",
          name: "Profile",
          icon: <FaUserAlt size={20} />,
        },
      );
    }

    /* ===== TECHNICIAN ===== */
    if (auth?.role === "TECHNICIAN") {
      menuItem.push(
        {
          path: "/technician/patients",
          name: "Patients",
          icon: <FaUserAlt />,
        },
        {
          path: "/technician/uart-console",
          name: "UART Console",
          icon: <FaTerminal />,
        },
        {
          path: "/technician/incubator-grid",
          name: "Incubator Grid",
          icon: <FaTools />,
        },
        {
          path: "/technician/profile",
          name: "Profile",
          icon: <FaUserAlt />,
        }
      );
    }

    return menuItem;
  };

  const menuItems = getMenuItems();

  return (
    <aside className="sidebar-container">
      <div className="burger" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <RxCross1 size={25} /> : <RxHamburgerMenu size={25} />}
      </div>

      <h1 className="top-header-brand">BIO-CHEQ</h1>
      <div className={`sidebar-content ${isOpen ? "mobile-open" : ""}`}>
        <ul className="nav-list">
          {menuItems.map((item, index) => (
            <li
              key={index}
              className="nav-links"
              onClick={() => setIsOpen(false)}
            >
              <NavLink to={item.path}>
                <span className="nav-icons">{item.icon}</span>

                <span>{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      <Button
        btnTagClass="logout-btn"
        btnTitle="Logout"
        btnClick={handleClick}
      />
    </aside>
  );
}
