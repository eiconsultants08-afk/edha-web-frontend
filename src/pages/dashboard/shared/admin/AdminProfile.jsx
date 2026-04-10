import { useContext, useEffect, useMemo, useState } from "react";
import { FiMail, FiPhone, FiHome } from "react-icons/fi";
import { AuthContext } from "../../../../context/AuthProvider";
import { UserContext } from "../../../../context/UserProvider";
import { getDevices, getTechnicians } from "../../../../api/api";
import Card from "../../../../components/card/card";
import "./AdminProfile.css";

export default function AdminProfile() {
  const { auth } = useContext(AuthContext);
  const { user } = useContext(UserContext);

  const [deviceCount, setDeviceCount] = useState(0);
  const [technicianCount, setTechnicianCount] = useState(0);

  useEffect(() => {
    const loadCounts = async () => {
      try {
        const [devicesRes, techRes] = await Promise.all([
          getDevices(100, 1),
          getTechnicians(100, 1),
        ]);

        const deviceRows = Array.isArray(devicesRes?.data?.rows)
          ? devicesRes.data.rows
          : [];
        const techRows = Array.isArray(techRes?.data?.rows)
          ? techRes.data.rows
          : [];

        setDeviceCount(deviceRows.length);
        setTechnicianCount(techRows.length);
      } catch (error) {
        console.error("Admin profile counts error:", error);
      }
    };

    loadCounts();
  }, []);

  const initials = useMemo(() => {
    const name = user?.name || auth?.name || "Admin";
    const parts = name.trim().split(" ").filter(Boolean);
    if (parts.length === 1) return parts[0][0]?.toUpperCase() || "A";
    return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
  }, [user, auth]);

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">{initials}</div>
      </div>

      <h2 className="profile-name">{user?.name || auth?.name || "Demo Admin"}</h2>
      <p className="profile-role">{auth?.role || "ADMIN"}</p>

      <div className="admin-profile-grid">
        <div className="profile-stat-card">
          <div className="profile-stat-number">{deviceCount}</div>
          <div className="profile-stat-label">Devices</div>
        </div>

        <div className="profile-stat-card">
          <div className="profile-stat-number">{technicianCount}</div>
          <div className="profile-stat-label">Technicians</div>
        </div>

        <Card ctype="primary" className="admin-contact-card">
          <h3 className="profile-section-title">Contact Information</h3>

          <div className="profile-info-list">
            <div className="profile-info-row">
              <div className="profile-info-icon">
                <FiMail />
              </div>
              <div>
                <div className="profile-info-label">Email</div>
                <div className="profile-info-value">{user?.email || "----"}</div>
              </div>
            </div>

            <div className="profile-info-row">
              <div className="profile-info-icon">
                <FiPhone />
              </div>
              <div>
                <div className="profile-info-label">Phone</div>
                <div className="profile-info-value">{user?.phone || "----"}</div>
              </div>
            </div>

            <div className="profile-info-row">
              <div className="profile-info-icon">
                <FiHome />
              </div>
              <div>
                <div className="profile-info-label">Organisation</div>
                <div className="profile-info-value">
                  {user?.org_name || user?.organization_name || "----"}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}