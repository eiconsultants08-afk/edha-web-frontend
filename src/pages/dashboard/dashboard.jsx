import React, { useContext } from "react";
import { UserContext } from "../../context/UserProvider";

import AdminDashboard from "./shared/admin/AdminDashboard";
import TechnicianDashboard from "./shared/technician/TechnicianDashboard";
import SuperAdminDashboard from "./shared/superadmin/SuperAdminDashboard";

export default function Dashboard() {
  const { user } = useContext(UserContext);

  if (!user) return null;

  switch (user.role) {
    case "SUPER_ADMIN":
      return <SuperAdminDashboard />;

    case "ADMIN":
      return <AdminDashboard />;

    case "TECHNICIAN":
      return <TechnicianDashboard />;

    default:
      return <div>Unauthorized</div>;
  }
}