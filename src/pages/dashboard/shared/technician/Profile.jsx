import React, { useEffect, useMemo, useState } from "react";
import { FiMail, FiPhone, FiCalendar } from "react-icons/fi";
import { FaBuilding } from "react-icons/fa";
import { getUserProfile, getAllPatients } from "../../../../api/api";
import Card from "../../../../components/card/card";
import "./Profile.css";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [patientCount, setPatientCount] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);

      const [profileRes, patientsRes] = await Promise.all([
        getUserProfile(),
        getAllPatients(1, 1),
      ]);

      if (profileRes?.success) {
        setUser(profileRes.data);
      }

      if (patientsRes?.success) {
        const count =
          patientsRes?.data?.count ??
          (Array.isArray(patientsRes?.data) ? patientsRes.data.length : 0);

        setPatientCount(count);
      }
    } catch (error) {
      console.error("Profile load error:", error);
    } finally {
      setLoading(false);
    }
  };

  const profileData = useMemo(() => {
    if (!user) return null;

    const name = user.name || user.username || "Technician";

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
      orgName: user.org_name || user.org_id || "—",
      joinedDate,
      role: user.role || "TECHNICIAN",
    };
  }, [user]);

  if (loading) {
    return (
      <div className="profile-container">
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="profile-container">
        <p>Profile not available</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">{profileData.initials}</div>
      </div>

      <h1 className="profile-name">{profileData.name}</h1>
      <p className="profile-role">
        {profileData.role === "ADMIN" ? "Sub Admin" : "Technician"}
      </p>

      <div className="profile-main-grid">
        <div className="profile-stat-card">
          <div className="profile-stat-number">{patientCount ?? "—"}</div>
          <div className="profile-stat-label">Patients</div>
        </div>

        <Card ctype="primary" style={{ padding: "24px" }}>
          <h2 className="profile-section-title">Contact Information</h2>

          <div className="profile-info-list">
            <div className="profile-info-row">
              <div className="profile-info-icon">
                <FiMail />
              </div>
              <div>
                <div className="profile-info-label">Email</div>
                <div className="profile-info-value">{profileData.email}</div>
              </div>
            </div>

            <div className="profile-info-row">
              <div className="profile-info-icon">
                <FiPhone />
              </div>
              <div>
                <div className="profile-info-label">Phone</div>
                <div className="profile-info-value">{profileData.phone}</div>
              </div>
            </div>

            <div className="profile-info-row">
              <div className="profile-info-icon">
                <FaBuilding />
              </div>
              <div>
                <div className="profile-info-label">Organisation</div>
                <div className="profile-info-value">{profileData.orgName}</div>
              </div>
            </div>

            <div className="profile-info-row">
              <div className="profile-info-icon">
                <FiCalendar />
              </div>
              <div>
                <div className="profile-info-label">Joined Date</div>
                <div className="profile-info-value">{profileData.joinedDate}</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}