import { useEffect, useMemo, useState } from "react";
import {
  getSuperAdminTechnicians,
  createSuperAdminTechnician,
  updateSuperAdminTechnician,
  getSuperAdminOrganizations,
} from "../../../../../api/api";

import Table from "../../../../../components/table/table";
import Card from "../../../../../components/card/card";
import TextBox from "../../../../../components/input/input";
import Button from "../../../../../components/button/button";
import "./Technicians.css";

export default function Technicians() {
  const initialForm = {
    user_id: "",
    username: "",
    name: "",
    email: "",
    phone: "",
    password: "",
    org_id: "",
    department_id: "",
    status: "INACTIVE",
  };

  const [formData, setFormData] = useState(initialForm);
  const [technicians, setTechnicians] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const isEdit = Boolean(formData.user_id);

  const statusOptions = [
    { label: "ACTIVE", value: "ACTIVE" },
    { label: "INACTIVE", value: "INACTIVE" },
    { label: "WORKING", value: "WORKING" },
    { label: "SUSPENDED", value: "SUSPENDED" },
    { label: "REMOVED", value: "REMOVED" },
  ];

  const orgOptions = useMemo(
    () => [
      { label: "Select Organization", value: "" },
      ...organizations.map((org) => ({
        label: org.org_name,
        value: org.org_id,
      })),
    ],
    [organizations],
  );

  const fields = useMemo(
    () => [
      {
        label: "Username",
        name: "username",
        type: "text",
        placeholder: "Enter Username",
        required: true,
        disabled: isEdit,
      },
      {
        label: "Name",
        name: "name",
        type: "text",
        placeholder: "Enter Name",
        required: true,
      },
      {
        label: "Email",
        name: "email",
        type: "email",
        placeholder: "Enter Email",
      },
      {
        label: "Phone",
        name: "phone",
        type: "text",
        placeholder: "Enter Phone",
        required: true,
      },
      {
        label: isEdit ? "New Password Optional" : "Password",
        name: "password",
        type: "password",
        placeholder: isEdit
          ? "Leave blank to keep same password"
          : "Enter Password",
        required: !isEdit,
      },
      {
        label: "Organization",
        name: "org_id",
        type: "select",
        options: orgOptions,
        required: true,
      },
      {
        label: "Department ID",
        name: "department_id",
        type: "text",
        placeholder: "Enter Department ID",
      },
      {
        label: "Status",
        name: "status",
        type: "select",
        options: statusOptions,
      },
    ],
    [isEdit, orgOptions],
  );

  const columns = [
    { name: "Name", key: "name", type: "text" },
    { name: "Username", key: "username", type: "text" },
    { name: "Email", key: "email", type: "text" },
    { name: "Phone", key: "phone", type: "text" },
    { name: "Organization", key: "org_name", type: "text" },
    { name: "Status", key: "status", type: "text" },
    { name: "Action", key: "action", type: "text" },
  ];

  useEffect(() => {
    loadOrganizations();
    loadTechnicians(1, 10);
  }, []);

  async function loadOrganizations() {
    const res = await getSuperAdminOrganizations(100, 1);

    if (res?.success) {
      setOrganizations(Array.isArray(res?.data?.rows) ? res.data.rows : []);
    }
  }

  async function loadTechnicians(page = 1, pageSize = 10) {
    const res = await getSuperAdminTechnicians(pageSize, page);

    if (res?.success) {
      const rows = Array.isArray(res?.data?.rows)
        ? res.data.rows.map((tech) => ({
            ...tech,
            id: tech.user_id,
            name: tech.name || "----",
            username: tech.username || "----",
            email: tech.email || "----",
            phone: tech.phone || "----",
            org_name: tech.org_name || "----",
            status: tech.status || "----",
            action: "Edit",
          }))
        : [];

      setTechnicians(rows);
      setCount(res?.data?.count || rows.length);
    } else {
      setTechnicians([]);
      setCount(0);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function resetForm() {
    setFormData(initialForm);
  }

  function handleEdit(tech) {
    setFormData({
      user_id: tech.user_id || "",
      username: tech.username === "----" ? "" : tech.username || "",
      name: tech.name === "----" ? "" : tech.name || "",
      email: tech.email === "----" ? "" : tech.email || "",
      phone: tech.phone === "----" ? "" : tech.phone || "",
      password: "",
      org_id: tech.org_id || "",
      department_id: tech.department_id || "",
      status: tech.status === "----" ? "INACTIVE" : tech.status || "INACTIVE",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const body = {
      username: formData.username,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      org_id: formData.org_id,
      department_id: formData.department_id || null,
      status: formData.status,
    };

    if (formData.password) {
      body.password = formData.password;
    }

    setLoading(true);

    const res = isEdit
      ? await updateSuperAdminTechnician(formData.user_id, body)
      : await createSuperAdminTechnician(body);

    setLoading(false);

    if (res?.success) {
      alert(
        isEdit
          ? "Technician updated successfully"
          : "Technician created successfully",
      );
      resetForm();
      loadTechnicians(1, 10);
    } else {
      alert(res?.message || "Something went wrong");
    }
  }

  return (
    <div>
      <div className="create-technician">
        <div className="form-header">
          <h3>{isEdit ? "Edit Technician" : "Create Technician"}</h3>

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
              btnTitle={
                loading
                  ? "Saving..."
                  : isEdit
                    ? "Update Technician"
                    : "Add Technician"
              }
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
                options={field.options || []}
                required={field.required || false}
                disabled={field.disabled || false}
                inputDivClass="create-technician-field"
              />
            ))}
          </div>
        </Card>
      </div>

      <h2>Technician Details</h2>

      <Table
        name="superadmin-technicians"
        columns={columns}
        rows={technicians}
        total={count}
        handlePagination={loadTechnicians}
        onCellClick={(row, column) => {
          if (column.key === "action") {
            handleEdit(row);
          }
        }}
      />
    </div>
  );
}
