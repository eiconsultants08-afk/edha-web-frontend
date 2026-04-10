import { useEffect, useMemo, useState } from "react";
import { FiSearch, FiMail, FiPhone, FiChevronDown } from "react-icons/fi";
import { getTechnicians, createTechnician } from "../../../../../api/api";
import Card from "../../../../../components/card/card";
import TextBox from "../../../../../components/input/input";
import Button from "../../../../../components/button/button";
import { useNavigate } from "react-router-dom";
import "./Technicians.css";

export default function Technicians() {
  const navigate = useNavigate();
  const [technicians, setTechnicians] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const initialForm = {
    username: "",
    name: "",
    email: "",
    phone: "",
    password: "",
  };

  const [formData, setFormData] = useState(initialForm);

  const fields = useMemo(
    () => [
      {
        label: "Username",
        name: "username",
        type: "text",
        placeholder: "Enter username",
        required: true,
      },
      {
        label: "Full Name",
        name: "name",
        type: "text",
        placeholder: "Enter full name",
        required: true,
      },
      {
        label: "Email",
        name: "email",
        type: "email",
        placeholder: "Enter email",
        required: true,
      },
      {
        label: "Phone",
        name: "phone",
        type: "text",
        placeholder: "Enter phone number",
        required: true,
      },
      {
        label: "Password",
        name: "password",
        type: "password",
        placeholder: "Enter password",
        required: true,
      },
    ],
    [],
  );

  const loadTechnicians = async () => {
    try {
      setLoadingList(true);
      const res = await getTechnicians(50, 1);

      if (res?.success) {
        const rows = Array.isArray(res?.data?.rows) ? res.data.rows : [];
        setTechnicians(rows);
      } else {
        setTechnicians([]);
      }
    } catch (error) {
      console.error("Technicians fetch error:", error);
      setTechnicians([]);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadTechnicians();
  }, []);

  const filteredTechnicians = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return technicians.filter((tech) => {
      const name = String(tech?.name || "").toLowerCase();
      const email = String(tech?.email || "").toLowerCase();
      const phone = String(tech?.phone || "").toLowerCase();
      const username = String(tech?.username || "").toLowerCase();
      const status = String(tech?.status || "").toUpperCase();

      const matchesSearch =
        !keyword ||
        name.includes(keyword) ||
        email.includes(keyword) ||
        phone.includes(keyword) ||
        username.includes(keyword);

      const matchesStatus = statusFilter === "ALL" || status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [technicians, search, statusFilter]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData(initialForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const body = {
      username: formData.username.trim(),
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      password: formData.password,
    };

    if (
      !body.username ||
      !body.name ||
      !body.email ||
      !body.phone ||
      !body.password
    ) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoadingCreate(true);

      const res = await createTechnician(body);

      if (res?.success) {
        alert("Technician created successfully");
        resetForm();
        await loadTechnicians();
      } else {
        alert(res?.message || "Failed to create technician");
      }
    } catch (error) {
      console.error("Create technician error:", error);
      alert("Something went wrong");
    } finally {
      setLoadingCreate(false);
    }
  };

  const getInitials = (name = "") => {
    const parts = name.trim().split(" ").filter(Boolean);
    if (parts.length === 0) return "T";
    if (parts.length === 1) return parts[0][0]?.toUpperCase() || "T";
    return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
  };

  const getStatusClass = (status = "") => {
    const normalized = String(status).toUpperCase();

    if (normalized === "ACTIVE" || normalized === "WORKING") {
      return "status-active";
    }

    if (normalized === "INACTIVE") {
      return "status-inactive";
    }

    if (normalized === "REMOVED") {
      return "status-removed";
    }

    return "status-default";
  };

  return (
    <div>
      <div className="create-technician">
        <div className="form-header">
          <h3>Create Technician</h3>

          <div className="action-button">
            <Button
              btntype="button"
              btnClass="secondary"
              btnTitle="Reset"
              btnClick={resetForm}
            />

            <Button
              btntype="submit"
              btnClass="primary"
              btnTitle={loadingCreate ? "Creating..." : "Create Technician"}
              btnClick={handleSubmit}
            />
          </div>
        </div>

        <Card
          ctype="primary"
          tag="form"
          style={{ padding: "20px", marginBottom: "20px" }}
        >
          <div className="create-technician-form">
            {fields.map((field) => (
              <TextBox
                key={field.name}
                label={field.label}
                name={field.name}
                type={field.type}
                value={formData[field.name]}
                onChange={handleChange}
                placeholder={field.placeholder}
                required={field.required || false}
                inputDivClass="create-technician-field"
              />
            ))}
          </div>
        </Card>
      </div>

      <div className="technicians-list-header">
        <h2>Technician Details</h2>
      </div>

      <Card ctype="primary" style={{ padding: "20px", marginBottom: "20px" }}>
        <div className="technicians-toolbar">
          <div className="technicians-search-wrap">
            <FiSearch className="technicians-search-icon" />
            <input
              type="text"
              placeholder="Search by name, email, phone or username"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="technicians-search-input"
            />
          </div>

          <div className="technicians-filter-wrap">
            <FiChevronDown className="technicians-filter-icon" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="technicians-filter-select"
            >
              <option value="ALL">All</option>
              <option value="WORKING">Working</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="REMOVED">Removed</option>
            </select>
          </div>
        </div>
      </Card>

      {loadingList ? (
        <Card ctype="primary" style={{ padding: "24px" }}>
          <div className="technicians-empty">Loading technicians...</div>
        </Card>
      ) : filteredTechnicians.length === 0 ? (
        <Card ctype="primary" style={{ padding: "24px" }}>
          <div className="technicians-empty">
            {search.trim() || statusFilter !== "ALL"
              ? "No technicians found"
              : "No technicians available"}
          </div>
        </Card>
      ) : (
        <div className="technicians-list">
          {filteredTechnicians.map((tech) => (
            <Card
              key={tech.user_id}
              ctype="primary"
              style={{ padding: "0", overflow: "hidden", marginBottom: "18px" }}
            >
              <div className="technician-card">
                <div className="technician-top">
                  <div className="technician-avatar">
                    {getInitials(tech.name)}
                  </div>

                  <div className="technician-main">
                    <div className="technician-main-top">
                      <h3 className="technician-name">{tech.name || "----"}</h3>
                      <span
                        className={`technician-status ${getStatusClass(
                          tech.status,
                        )}`}
                      >
                        {tech.status || "----"}
                      </span>
                    </div>

                    <p className="technician-username">
                      Username: {tech.username || "----"}
                    </p>

                    <div className="technician-meta">
                      <div className="technician-meta-item">
                        <FiMail />
                        <span>{tech.email || "----"}</span>
                      </div>

                      <div className="technician-meta-item">
                        <FiPhone />
                        <span>{tech.phone || "----"}</span>
                      </div>
                    </div>
                    <div className="technician-actions">
                      <Button
                        btntype="button"
                        btnClass="secondary"
                        btnTitle="View Details"
                        btnClick={() => navigate(`/technician/${tech.user_id}`)}
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
