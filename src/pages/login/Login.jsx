import React, { useContext } from "react";
import "./Login.css";
import { FaUserAlt, FaLock } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import {
  notifyUser,
  updateTokenAndUserDetails,
} from "../../shared/utils/utils.jsx";
import { AuthContext } from "../../context/AuthProvider";
import { UserContext } from "../../context/UserProvider";
import { login } from "../../api/api.jsx";
import Card from "../../components/card/card.jsx";
import TextBox from "../../components/input/input.jsx";
import Button from "../../components/button/button.jsx";

export default function Login() {
  const { updateAuth } = useContext(AuthContext);
  const { updateUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const { username, password } = Object.fromEntries(data.entries());

    const body = { username, password };

    const { success, message } = await login(body);

    if (success) {
      await updateTokenAndUserDetails(updateAuth, updateUser, true);

      const savedUser = JSON.parse(localStorage.getItem("user"));

      if (savedUser?.role === "ADMIN") {
        navigate("/admin/dashboard");
      } else if (savedUser?.role === "TECHNICIAN") {
        navigate("/technician/patients");
      } else if (savedUser?.role === "SUPER_ADMIN") {
        navigate("/dashboard");
      } else {
        navigate("/");
      }
    } else {
      notifyUser("error", message, "bottom-center", "0 32px 5px");
    }
  };

  return (
    <Card tag="form" onSubmit={handleSubmit} ctype="login-card">
      <h1>BIO-CHEQ</h1>

      <div className="login-fields">
        <TextBox
          name="username"
          label={"Username"}
          placeholder="Enter your username"
          icons={<FaUserAlt />}
          required={true}
        />
        <TextBox
          name="password"
          label={"Password"}
          placeholder="Enter your password"
          type="password"
          icons={<FaLock />}
          required={true}
        />
      </div>

      <div className="login-btn">
        <Button btnTitle={"Login"} btnClass="primary" btntype={"submit"} />
      </div>
    </Card>
  );
}
