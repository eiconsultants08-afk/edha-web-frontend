import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiCpu, FiUser, FiArrowRight } from "react-icons/fi";
import Card from "../../../../../components/card/card";
import Button from "../../../../../components/button/button";
import {
  getAdminDevice,
  assignDeviceToTechnician,
} from "../../../../../api/api";
import "./DevicesDetails.css";

export default function DevicesDetails() {
  const { device_id } = useParams();
  const navigate = useNavigate();

  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadDevice = async () => {
    if (!device_id) return;

    try {
      const res = await getAdminDevice(device_id);

      if (res?.success) {
        setDevice(res.data);
      } else {
        alert(res?.message || "Failed to load device");
      }
    } catch (error) {
      console.error("Load device error:", error);
      alert("Something went wrong");
    }
  };

  useEffect(() => {
    if (device_id) {
      loadDevice();
    }
  }, [device_id]);

  const handleUnassign = async () => {
    try {
      setLoading(true);

      const res = await assignDeviceToTechnician(device_id, {
        technician_id: null,
      });

      if (res?.success) {
        alert("Device unassigned successfully");
        await loadDevice();
      } else {
        alert(res?.message || "Failed to unassign device");
      }
    } catch (error) {
      console.error("Unassign device error:", error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status = "") => {
    const normalized = String(status).toUpperCase();

    if (normalized === "ACTIVE") return "device-status-active";
    if (normalized === "MAINTENANCE") return "device-status-maintenance";
    return "device-status-inactive";
  };

  if (!device_id) {
    return <div>Invalid device route</div>;
  }

  if (!device) {
    return <div>Loading device details...</div>;
  }

  const isAssigned = !!device.assigned_to_user_id;

  return (
    <div className="device-detail-page">
      <Card ctype="primary" style={{ padding: "24px" }}>
        <div className="device-header-card">
          <div className="device-header-left">
            <div className="device-icon-box">
              <FiCpu size={28} />
            </div>

            <div className="device-header-text">
              <h2 className="device-serial">{device.serial_no || "----"}</h2>
              <p className="device-model">{device.model || "----"}</p>
            </div>
          </div>

          <span
            className={`device-status-pill ${getStatusClass(device.status)}`}
          >
            {device.status || "----"}
          </span>
        </div>
      </Card>

      <div className="device-detail-grid">
        <Card ctype="primary" style={{ padding: "24px" }}>
          <div className="device-section-title">
            <FiCpu />
            <span>Device Info</span>
          </div>

          <div className="device-info-list">
            <div className="device-info-row">
              <span className="device-info-label">Device ID</span>
              <span className="device-info-value">
                {device.device_id || "----"}
              </span>
            </div>

            <div className="device-info-row">
              <span className="device-info-label">Serial No</span>
              <span className="device-info-value">
                {device.serial_no || "----"}
              </span>
            </div>

            <div className="device-info-row">
              <span className="device-info-label">Model</span>
              <span className="device-info-value">{device.model || "----"}</span>
            </div>

            <div className="device-info-row">
              <span className="device-info-label">Organisation</span>
              <span className="device-info-value">
                {device.org_name || "----"}
              </span>
            </div>

            <div className="device-info-row">
              <span className="device-info-label">Department</span>
              <span className="device-info-value">
                {device.department_name || "----"}
              </span>
            </div>
          </div>
        </Card>

        <Card ctype="primary" style={{ padding: "24px" }}>
          <div className="device-section-title">
            <FiUser />
            <span>Assignment</span>
          </div>

          {isAssigned ? (
            <>
              <div className="assigned-tech-card">
                <div className="assigned-tech-avatar">
                  {(device.assigned_to_name || "T")[0].toUpperCase()}
                </div>

                <div className="assigned-tech-info">
                  <h4>{device.assigned_to_name || "----"}</h4>
                  <p>@{device.assigned_to_username || "----"}</p>
                </div>
              </div>

              <button
                type="button"
                className="device-reassign-box"
                onClick={() =>
                  navigate(`/devices/assign/${device_id}`, {
                    state: {
                      device_id,
                      current_technician_id: device.assigned_to_user_id,
                    },
                  })
                }
              >
                <span>Reassign to another technician</span>
                <FiArrowRight />
              </button>

              <button
                type="button"
                className="device-unassign-btn"
                onClick={handleUnassign}
                disabled={loading}
              >
                {loading ? "Unassigning..." : "Unassign Device"}
              </button>
            </>
          ) : (
            <div className="device-unassigned-state">
              <p className="device-empty-text">
                This device is not assigned to any technician.
              </p>

              <Button
                btntype="button"
                btnClass="primary"
                btnTitle="Assign Technician"
                btnClick={() =>
                  navigate(`/devices/assign/${device_id}`, {
                    state: {
                      device_id,
                      current_technician_id: null,
                    },
                  })
                }
              />
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}