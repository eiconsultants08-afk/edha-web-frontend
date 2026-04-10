import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiUser, FiCpu, FiSmartphone, FiTrash2 } from "react-icons/fi";
import {
  getTechnicianDetail,
  getUnassignedDevices,
  assignDeviceToTechnician,
  removeTechnicianById,
} from "../../../../../api/api";
import Card from "../../../../../components/card/card";
import Button from "../../../../../components/button/button";
import "./TechnicianDetails.css";

export default function TechnicianDetails() {
  const { technician_id } = useParams();
  const navigate = useNavigate();

  const [details, setDetails] = useState(null);
  const [unassignedDevices, setUnassignedDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigningId, setAssigningId] = useState("");
  const [removing, setRemoving] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);

      const [detailRes, devicesRes] = await Promise.all([
        getTechnicianDetail(technician_id),
        getUnassignedDevices(50, 1),
      ]);

      if (detailRes?.success) {
        setDetails(detailRes.data);
      } else {
        setDetails(null);
      }

      if (devicesRes?.success) {
        setUnassignedDevices(
          Array.isArray(devicesRes?.data?.rows) ? devicesRes.data.rows : [],
        );
      } else {
        setUnassignedDevices([]);
      }
    } catch (error) {
      console.error("Technician details load error:", error);
      setDetails(null);
      setUnassignedDevices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [technician_id]);

  const getInitials = (name = "") => {
    const parts = name.trim().split(" ").filter(Boolean);
    if (parts.length === 0) return "T";
    if (parts.length === 1) return parts[0][0]?.toUpperCase() || "T";
    return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
  };

  const statusClass = useMemo(() => {
    const status = String(details?.status || "").toUpperCase();

    if (status === "ACTIVE" || status === "WORKING") return "td-status-active";
    if (status === "INACTIVE") return "td-status-inactive";
    if (status === "REMOVED") return "td-status-removed";
    return "td-status-default";
  }, [details]);

  const handleAssign = async (deviceId) => {
    try {
      setAssigningId(deviceId);

      const res = await assignDeviceToTechnician(deviceId, {
        technician_id,
      });

      if (res?.success) {
        alert("Device assigned successfully");
        await loadData();
      } else {
        alert(res?.message || "Failed to assign device");
      }
    } catch (error) {
      console.error("Assign device error:", error);
      alert("Something went wrong");
    } finally {
      setAssigningId("");
    }
  };

  const handleRemoveTechnician = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this technician?",
    );
    if (!confirmed) return;

    try {
      setRemoving(true);

      const res = await removeTechnicianById(technician_id);

      if (res?.success) {
        alert("Technician removed successfully");
        navigate("/technicians");
      } else {
        alert(res?.message || "Failed to remove technician");
      }
    } catch (error) {
      console.error("Remove technician error:", error);
      alert("Something went wrong");
    } finally {
      setRemoving(false);
    }
  };

  if (loading) {
    return <div>Loading technician details...</div>;
  }

  if (!details) {
    return <div>Technician not found</div>;
  }

  return (
    <div className="technician-details-page">
      <Card ctype="primary" style={{ padding: "24px" }}>
        <div className="td-profile-header">
          <div className="td-profile-left">
            <div className="td-avatar">{getInitials(details.name)}</div>

            <div className="td-profile-text">
              <h2 className="td-name">{details.name || "----"}</h2>
              <p className="td-username">@{details.username || "----"}</p>
            </div>
          </div>

          <span className={`td-status ${statusClass}`}>
            {details.status || "----"}
          </span>
        </div>
      </Card>

      <div className="td-top-grid">
        <Card ctype="primary" style={{ padding: "24px" }}>
          <div className="td-section-title">
            <FiUser />
            <span>Profile</span>
          </div>

          <div className="td-info-list">
            <div className="td-info-row">
              <span className="td-label">Email</span>
              <span className="td-value">{details.email || "----"}</span>
            </div>

            <div className="td-info-row">
              <span className="td-label">Phone</span>
              <span className="td-value">{details.phone || "----"}</span>
            </div>
          </div>
        </Card>

        <Card ctype="primary" style={{ padding: "24px" }}>
          <div className="td-stat-value">{details.devices?.length || 0}</div>
          <div className="td-stat-label">Devices</div>
        </Card>

        <Card ctype="primary" style={{ padding: "24px" }}>
          <div className="td-stat-value">{details.session_count || 0}</div>
          <div className="td-stat-label">Sessions</div>
        </Card>
      </div>

      {/* <Card ctype="primary" style={{ padding: "24px" }}>
        <div className="td-section-title">
          <FiCpu />
          <span>Assigned Devices</span>
        </div>

        {details.devices?.length ? (
          <div className="td-device-list">
            {details.devices.map((device) => (
              <div key={device.device_id} className="td-device-item">
                <div>
                  <div className="td-device-id">{device.device_id}</div>
                  <div className="td-device-model">
                    {device.model || "----"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="td-empty-text">No devices assigned.</div>
        )}
      </Card>

      <Card ctype="primary" style={{ padding: "24px" }}>
        <div className="td-section-title">
          <FiSmartphone />
          <span>Assign a Device</span>
        </div>

        <p className="td-section-subtitle">
          Available unassigned devices in your department:
        </p>

        {unassignedDevices.length ? (
          <div className="td-device-list">
            {unassignedDevices.map((device) => (
              <div
                key={device.device_id}
                className="td-device-item td-assign-row"
              >
                <div>
                  <div className="td-device-id">{device.device_id}</div>
                  <div className="td-device-model">
                    {device.model || "----"}
                  </div>
                </div>

                <Button
                  btntype="button"
                  btnClass="primary"
                  btnTitle={
                    assigningId === device.device_id ? "Assigning..." : "Assign"
                  }
                  btnClick={() => handleAssign(device.device_id)}
                  disabled={assigningId === device.device_id}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="td-empty-text">No unassigned devices available.</div>
        )}
      </Card> */}

      <div className="td-device-grid">
        <Card ctype="primary" style={{ padding: "24px" }}>
          <div className="td-section-title">
            <FiCpu />
            <span>Assigned Devices</span>
          </div>

          {details.devices?.length ? (
            <div className="td-device-list">
              {details.devices.map((device) => (
                <div key={device.device_id} className="td-device-item">
                  <div>
                    <div className="td-device-id">{device.device_id}</div>
                    <div className="td-device-model">
                      {device.model || "----"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="td-empty-text">No devices assigned.</div>
          )}
        </Card>

        <Card ctype="primary" style={{ padding: "24px" }}>
          <div className="td-section-title">
            <FiSmartphone />
            <span>Assign a Device</span>
          </div>

          <p className="td-section-subtitle">
            Available unassigned devices in your department:
          </p>

          {unassignedDevices.length ? (
            <div className="td-device-list">
              {unassignedDevices.map((device) => (
                <div
                  key={device.device_id}
                  className="td-device-item td-assign-row"
                >
                  <div>
                    <div className="td-device-id">{device.device_id}</div>
                    <div className="td-device-model">
                      {device.model || "----"}
                    </div>
                  </div>

                  <Button
                    btntype="button"
                    btnClass="primary"
                    btnTitle={
                      assigningId === device.device_id
                        ? "Assigning..."
                        : "Assign"
                    }
                    btnClick={() => handleAssign(device.device_id)}
                    disabled={assigningId === device.device_id}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="td-empty-text">
              No unassigned devices available.
            </div>
          )}
        </Card>
      </div>

      <button
        type="button"
        className="td-remove-button"
        onClick={handleRemoveTechnician}
        disabled={removing}
      >
        <FiTrash2 />
        <span>{removing ? "Removing..." : "Remove Technician"}</span>
      </button>
    </div>
  );
}
