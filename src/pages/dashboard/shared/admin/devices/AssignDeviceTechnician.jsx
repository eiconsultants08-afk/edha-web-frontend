import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { FiCheck, FiAlertTriangle, FiSearch } from "react-icons/fi";
import Card from "../../../../../components/card/card";
import Button from "../../../../../components/button/button";
import {
  getTechnicians,
  assignDeviceToTechnician,
  getDevices,
} from "../../../../../api/api";
import "./AssignDeviceTechnician.css";

export default function AssignDeviceTechnician() {
  const { device_id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const currentTechnicianId = location.state?.current_technician_id || null;

  const [technicians, setTechnicians] = useState([]);
  const [selectedTechnicianId, setSelectedTechnicianId] = useState(
    currentTechnicianId || null
  );
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadTechnicians = async () => {
    try {
      setLoading(true);

      const [techRes, deviceRes] = await Promise.all([
        getTechnicians(100, 1),
        getDevices(200, 1),
      ]);

      const techRows = techRes?.success
        ? Array.isArray(techRes?.data?.rows)
          ? techRes.data.rows
          : []
        : [];

      const deviceRows = deviceRes?.success
        ? Array.isArray(deviceRes?.data?.rows)
          ? deviceRes.data.rows
          : []
        : [];

      const mappedTechnicians = techRows.map((tech) => {
        const assignedCount = deviceRows.filter(
          (device) =>
            String(device?.assigned_to_user_id || "") === String(tech.user_id)
        ).length;

        return {
          ...tech,
          assigned_device_count: assignedCount,
        };
      });

      setTechnicians(mappedTechnicians);
    } catch (error) {
      console.error("Load technicians error:", error);
      alert("Something went wrong");
      setTechnicians([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTechnicians();
  }, []);

  const filteredTechnicians = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return technicians;

    return technicians.filter((tech) => {
      const name = String(tech?.name || "").toLowerCase();
      const username = String(tech?.username || "").toLowerCase();
      const phone = String(tech?.phone || "").toLowerCase();

      return (
        name.includes(keyword) ||
        username.includes(keyword) ||
        phone.includes(keyword)
      );
    });
  }, [technicians, search]);

  const handleAssign = async () => {
    if (!selectedTechnicianId) {
      alert("Please select a technician");
      return;
    }

    try {
      setSaving(true);

      const res = await assignDeviceToTechnician(device_id, {
        technician_id: selectedTechnicianId,
      });

      if (res?.success) {
        alert("Device assigned successfully");
        navigate(`/device/${device_id}`);
      } else {
        alert(res?.message || "Failed to assign device");
      }
    } catch (error) {
      console.error("Assign technician error:", error);
      alert("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const pageTitle = currentTechnicianId ? "Reassign Technician" : "Assign Technician";

  return (
    <div className="assign-tech-page">
      <div className="assign-tech-header">
        <div>
          <h2>{pageTitle}</h2>
          <p>Select a technician for device: {device_id}</p>
        </div>

        <div className="assign-tech-actions">
          <Button
            btntype="button"
            btnClass="secondary"
            btnTitle="Cancel"
            btnClick={() => navigate(`/device/${device_id}`)}
          />

          <Button
            btntype="button"
            btnClass="primary"
            btnTitle={saving ? "Saving..." : currentTechnicianId ? "Reassign" : "Assign"}
            btnClick={handleAssign}
            disabled={saving}
          />
        </div>
      </div>

      <Card ctype="primary" style={{ padding: "20px", marginBottom: "20px" }}>
        <div className="assign-tech-search-wrap">
          <FiSearch className="assign-tech-search-icon" />
          <input
            type="text"
            placeholder="Search by name, username or phone"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="assign-tech-search-input"
          />
        </div>
      </Card>

      {loading ? (
        <Card ctype="primary" style={{ padding: "24px" }}>
          <div className="assign-tech-empty">Loading technicians...</div>
        </Card>
      ) : filteredTechnicians.length === 0 ? (
        <Card ctype="primary" style={{ padding: "24px" }}>
          <div className="assign-tech-empty">No technicians found</div>
        </Card>
      ) : (
        <div className="assign-tech-list">
          {filteredTechnicians.map((tech) => {
            const isSelected = String(selectedTechnicianId || "") === String(tech.user_id);
            const hasAssignedDevices = Number(tech.assigned_device_count || 0) > 0;

            return (
              <Card
                key={tech.user_id}
                ctype="primary"
                style={{ padding: "0", overflow: "hidden" }}
              >
                <button
                  type="button"
                  className={`assign-tech-card ${isSelected ? "selected" : ""}`}
                  onClick={() => setSelectedTechnicianId(tech.user_id)}
                >
                  <div className="assign-tech-card-top">
                    <div className="assign-tech-avatar">
                      {(tech.name || "T")[0].toUpperCase()}
                    </div>

                    <div className="assign-tech-main">
                      <div className="assign-tech-main-top">
                        <div>
                          <h3>{tech.name || "----"}</h3>
                          <p>@{tech.username || "----"}</p>
                        </div>

                        {isSelected && (
                          <div className="assign-tech-check">
                            <FiCheck />
                          </div>
                        )}
                      </div>

                      {hasAssignedDevices && (
                        <div className="assign-tech-warning">
                          <FiAlertTriangle />
                          <span>
                            Already has {tech.assigned_device_count} device
                            {tech.assigned_device_count > 1 ? "s" : ""} assigned —
                            assigning this will add another
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}