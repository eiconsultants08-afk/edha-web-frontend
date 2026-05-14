import React, { useContext } from "react";
import "./Login.css";
import { FaUserAlt, FaLock } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { notifyUser } from "../../shared/utils/utils.jsx";
import { AuthContext } from "../../context/AuthProvider";
import { UserContext } from "../../context/UserProvider";
import { login, getUserProfile } from "../../api/api.jsx";
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

    const loginRes = await login(body);

    if (!loginRes.success) {
      notifyUser("error", loginRes.message, "bottom-center", "0 32px 5px");
      return;
    }

    const profileRes = await getUserProfile();

    if (!profileRes?.success) {
      notifyUser("error", "Failed to load user profile", "bottom-center");
      return;
    }

    const user = profileRes.data?.user || profileRes.data;

    updateAuth(user);
    updateUser(user);
    localStorage.setItem("user", JSON.stringify(user));

    notifyUser("success", "Login Successful", "top-center", "0 25px 5px");

    if (user?.role === "ADMIN") {
      navigate("/admin/dashboard", { replace: true });
    } else if (user?.role === "TECHNICIAN") {
      navigate("/technician/patients", { replace: true });
    } else if (user?.role === "SUPER_ADMIN") {
      navigate("/superadmin/dashboard", { replace: true });
    } else {
      navigate("/login", { replace: true });
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
