import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getPatientByIdAdmin } from "../../../../api/api";
import Card from "../../../../components/card/card";
import { FiCopy } from "react-icons/fi";
import { toast } from "react-toastify";
import "../technician/AddTestResult.css";

export default function AdminPatientDetails() {
  const { patient_id } = useParams();

  const [pageLoading, setPageLoading] = useState(false);
  const [patientDetails, setPatientDetails] = useState(null);

  useEffect(() => {
    if (patient_id) {
      loadPatientDetails(patient_id);
    }
  }, [patient_id]);

  const loadPatientDetails = async (id) => {
    try {
      setPageLoading(true);

      const res = await getPatientByIdAdmin(id);

      if (res?.success && res?.data) {
        setPatientDetails(res.data);
      } else {
        setPatientDetails(null);
        toast.error(res?.message || "Failed to load patient details");
      }
    } catch (error) {
      console.error("Admin patient detail error:", error);
      setPatientDetails(null);
      toast.error("Something went wrong");
    } finally {
      setPageLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "----";

    const date = new Date(dateStr);

    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "----";

    const date = new Date(dateStr);

    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const maskName = (name) => {
    if (!name) return "-";

    return name
      .split(" ")
      .map((part) => {
        if (part.length <= 2) return part;
        return part[0] + "*".repeat(part.length - 2) + part[part.length - 1];
      })
      .join(" ");
  };

  const maskEmail = (email) => {
    if (!email) return "-";

    const [user, domain] = email.split("@");
    if (!user || !domain) return email;

    return `${user.slice(0, 2)}${"*".repeat(Math.max(user.length - 2, 0))}@${domain}`;
  };

  const handleCopyPatientId = async () => {
    try {
      await navigator.clipboard.writeText(patientDetails?.patient_id || "");
      toast.success("Patient ID copied");
    } catch {
      toast.error("Failed to copy patient ID");
    }
  };

  return (
    <div className="add-test-page">
      <Card ctype="primary" style={{ padding: "20px", marginBottom: "20px" }}>
        <h2 className="section-title">Patient Information</h2>

        {pageLoading ? (
          <p>Loading patient details...</p>
        ) : patientDetails ? (
          <div className="patient-info-grid">
            <div className="info-box">
              <span className="info-label">Name</span>
              <span className="info-value">{maskName(patientDetails.name)}</span>
            </div>

            <div className="info-box">
              <span className="info-label">Patient ID</span>
              <div className="patient-id-row">
                <span className="info-value">
                  {patientDetails.patient_id || "----"}
                </span>
                <FiCopy
                  className="copy-icon"
                  onClick={handleCopyPatientId}
                  title="Copy"
                />
              </div>
            </div>

            <div className="info-box">
              <span className="info-label">Gender</span>
              <span className="info-value">
                {patientDetails.gender || "----"}
              </span>
            </div>

            <div className="info-box">
              <span className="info-label">Date of Birth</span>
              <span className="info-value">
                {formatDate(patientDetails.dob)}
              </span>
            </div>

            <div className="info-box">
              <span className="info-label">Registered On</span>
              <span className="info-value">
                {formatDateTime(patientDetails.created_at)}
              </span>
            </div>

            <div className="info-box">
              <span className="info-label">Organization</span>
              <span className="info-value">
                {patientDetails.org_name || "----"}
              </span>
            </div>

            <div className="info-box">
              <span className="info-label">Email</span>
              <span className="info-value">
                {maskEmail(patientDetails.email)}
              </span>
            </div>

            <div className="info-box">
              <span className="info-label">Address</span>
              <span className="info-value">
                {patientDetails.address || "-"}
              </span>
            </div>
          </div>
        ) : (
          <p>No patient details found</p>
        )}
      </Card>
    </div>
  );
}