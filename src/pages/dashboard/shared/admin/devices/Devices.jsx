import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiCpu } from "react-icons/fi";
import Card from "../../../../../components/card/card";
import Button from "../../../../../components/button/button";
import { getDevices } from "../../../../../api/api";
import "./Devices.css";

export default function Devices() {
  const navigate = useNavigate();

  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const loadDevices = async () => {
    try {
      setLoading(true);

      const res = await getDevices(50, 1);

      if (res?.success) {
        const rows = Array.isArray(res?.data?.rows) ? res.data.rows : [];
        setDevices(rows);
      } else {
        setDevices([]);
        alert(res?.message || "Failed to load devices");
      }
    } catch (error) {
      console.error("Load devices error:", error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDevices();
  }, []);

  const filteredDevices = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return devices;

    return devices.filter((device) => {
      const deviceId = String(device?.device_id || "").toLowerCase();
      const serialNo = String(device?.serial_no || "").toLowerCase();
      const model = String(device?.model || "").toLowerCase();
      const status = String(device?.status || "").toLowerCase();

      return (
        deviceId.includes(keyword) ||
        serialNo.includes(keyword) ||
        model.includes(keyword) ||
        status.includes(keyword)
      );
    });
  }, [devices, search]);

  const getStatusClass = (status = "") => {
    const normalized = String(status).toUpperCase();

    if (normalized === "ACTIVE") return "device-status-active";
    if (normalized === "MAINTENANCE") return "device-status-maintenance";
    return "device-status-inactive";
  };

  return (
    <div className="devices-page">
      <div className="devices-list-header">
        <h2>Device Details</h2>
      </div>

      <Card ctype="primary" style={{ padding: "20px", marginBottom: "20px" }}>
        <div className="devices-search-wrap">
          <FiSearch className="devices-search-icon" />
          <input
            type="text"
            placeholder="Search by device id, serial no, model or status"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="devices-search-input"
          />
        </div>
      </Card>

      {loading ? (
        <Card ctype="primary" style={{ padding: "24px" }}>
          <div className="devices-empty">Loading devices...</div>
        </Card>
      ) : filteredDevices.length === 0 ? (
        <Card ctype="primary" style={{ padding: "24px" }}>
          <div className="devices-empty">
            {search.trim() ? "No devices found" : "No devices available"}
          </div>
        </Card>
      ) : (
        <div className="devices-grid">
          {filteredDevices.map((device) => (
            <Card
              key={device.device_id}
              ctype="primary"
              style={{ padding: "0", overflow: "hidden" }}
            >
              <div className="device-card">
                <div className="device-card-top">
                  <div className="device-card-icon">
                    <FiCpu size={24} />
                  </div>

                  <div className="device-card-main">
                    <div className="device-card-main-top">
                      <h3 className="device-card-id">
                        {device.device_id || "----"}
                      </h3>

                      <span
                        className={`device-status-pill ${getStatusClass(
                          device.status
                        )}`}
                      >
                        {device.status || "----"}
                      </span>
                    </div>

                    <p className="device-card-serial">
                      Serial No: {device.serial_no || "----"}
                    </p>
                    <p className="device-card-model">
                      Model: {device.model || "----"}
                    </p>

                    <div className="device-card-actions">
                      <Button
                        btntype="button"
                        btnClass="secondary"
                        btnTitle="View Details"
                        btnClick={() => navigate(`/device/${device.device_id}`)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}