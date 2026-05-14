import React, { useEffect, useMemo, useState } from "react";
import { FiMail, FiPhone, FiCalendar, FiUsers } from "react-icons/fi";
import { FaBuilding, FaUserShield, FaVial } from "react-icons/fa";
import { MdDevices } from "react-icons/md";
import { getUserProfile, getSuperAdminDashboard } from "../../../../api/api";
import Card from "../../../../components/card/card";
import "./SuperAdminProfile.css";

export default function SuperAdminProfile() {
  const [user, setUser] = useState(null);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      setLoading(true);

      const [profileRes, dashboardRes] = await Promise.all([
        getUserProfile(),
        getSuperAdminDashboard(),
      ]);

      if (profileRes?.success) {
        setUser(profileRes.data);
      }

      if (dashboardRes?.success) {
        setCounts(dashboardRes.data || {});
      }
    } catch (error) {
      console.error("Super admin profile load error:", error);
    } finally {
      setLoading(false);
    }
  }

  const profileData = useMemo(() => {
    if (!user) return null;

    const name = user.name || user.username || "Super Admin";

    const initials = name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    const joinedDate = user.created_at
      ? new Date(user.created_at).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "—";

    return {
      name,
      initials,
      email: user.email || "—",
      phone: user.phone || "—",
      role: "Super Admin",
      joinedDate,
    };
  }, [user]);

  if (loading) {
    return (
      <div className="superadmin-profile-container">
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="superadmin-profile-container">
        <p>Profile not available</p>
      </div>
    );
  }

  return (
    <div className="superadmin-profile-container">
      <div className="superadmin-profile-header">
        <div className="superadmin-profile-avatar">{profileData.initials}</div>
      </div>

      <h1 className="superadmin-profile-name">{profileData.name}</h1>
      <p className="superadmin-profile-role">{profileData.role}</p>

      <div className="superadmin-profile-main-grid">
        <div className="superadmin-profile-stats">
          <div className="superadmin-profile-stat-card">
            <FaBuilding />
            <div className="superadmin-profile-stat-number">
              {counts.total_organizations || 0}
            </div>
            <div className="superadmin-profile-stat-label">Organizations</div>
          </div>

          <div className="superadmin-profile-stat-card">
            <FiUsers />
            <div className="superadmin-profile-stat-number">
              {counts.total_technicians || 0}
            </div>
            <div className="superadmin-profile-stat-label">Technicians</div>
          </div>

          <div className="superadmin-profile-stat-card">
            <MdDevices />
            <div className="superadmin-profile-stat-number">
              {counts.total_devices || 0}
            </div>
            <div className="superadmin-profile-stat-label">Devices</div>
          </div>

          <div className="superadmin-profile-stat-card">
            <FaVial />
            <div className="superadmin-profile-stat-number">
              {counts.total_tests || 0}
            </div>
            <div className="superadmin-profile-stat-label">Tests</div>
          </div>
        </div>

        <Card ctype="primary" style={{ padding: "24px" }}>
          <h2 className="superadmin-profile-section-title">
            Contact Information
          </h2>

          <div className="superadmin-profile-info-list">
            <div className="superadmin-profile-info-row">
              <div className="superadmin-profile-info-icon">
                <FiMail />
              </div>
              <div>
                <div className="superadmin-profile-info-label">Email</div>
                <div className="superadmin-profile-info-value">
                  {profileData.email}
                </div>
              </div>
            </div>

            <div className="superadmin-profile-info-row">
              <div className="superadmin-profile-info-icon">
                <FiPhone />
              </div>
              <div>
                <div className="superadmin-profile-info-label">Phone</div>
                <div className="superadmin-profile-info-value">
                  {profileData.phone}
                </div>
              </div>
            </div>

            <div className="superadmin-profile-info-row">
              <div className="superadmin-profile-info-icon">
                <FaUserShield />
              </div>
              <div>
                <div className="superadmin-profile-info-label">Role</div>
                <div className="superadmin-profile-info-value">
                  {profileData.role}
                </div>
              </div>
            </div>

            <div className="superadmin-profile-info-row">
              <div className="superadmin-profile-info-icon">
                <FiCalendar />
              </div>
              <div>
                <div className="superadmin-profile-info-label">Joined Date</div>
                <div className="superadmin-profile-info-value">
                  {profileData.joinedDate}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
