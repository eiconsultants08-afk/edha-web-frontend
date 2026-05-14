import { useEffect, useMemo, useState } from "react";
import {
  getSuperAdminAdmins,
  createSuperAdminAdmin,
  updateSuperAdminAdmin,
  getSuperAdminOrganizations,
} from "../../../../../api/api";

import Table from "../../../../../components/table/table";
import Card from "../../../../../components/card/card";
import TextBox from "../../../../../components/input/input";
import Button from "../../../../../components/button/button";
import "./Admins.css";

export default function Admins() {
  const initialForm = {
    user_id: "",
    username: "",
    name: "",
    email: "",
    phone: "",
    password: "",
    org_id: "",
    status: "INACTIVE",
  };

  const [formData, setFormData] = useState(initialForm);
  const [admins, setAdmins] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const isEdit = Boolean(formData.user_id);

  const statusOptions = [
    { label: "ACTIVE", value: "ACTIVE" },
    { label: "INACTIVE", value: "INACTIVE" },
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
    loadAdmins(1, 10);
  }, []);

  async function loadOrganizations() {
    const res = await getSuperAdminOrganizations(100, 1);

    if (res?.success) {
      setOrganizations(Array.isArray(res?.data?.rows) ? res.data.rows : []);
    }
  }

  async function loadAdmins(page = 1, pageSize = 10) {
    const res = await getSuperAdminAdmins(pageSize, page);

    if (res?.success) {
      const rows = Array.isArray(res?.data?.rows)
        ? res.data.rows.map((admin) => ({
            ...admin,
            id: admin.user_id,
            name: admin.name || "----",
            username: admin.username || "----",
            email: admin.email || "----",
            phone: admin.phone || "----",
            org_name: admin.org_name || "----",
            status: admin.status || "----",
            action: "Edit",
          }))
        : [];

      setAdmins(rows);
      setCount(res?.data?.count || rows.length);
    } else {
      setAdmins([]);
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

  function handleEdit(admin) {
    setFormData({
      user_id: admin.user_id || "",
      username: admin.username === "----" ? "" : admin.username || "",
      name: admin.name === "----" ? "" : admin.name || "",
      email: admin.email === "----" ? "" : admin.email || "",
      phone: admin.phone === "----" ? "" : admin.phone || "",
      password: "",
      org_id: admin.org_id || "",
      status: admin.status === "----" ? "INACTIVE" : admin.status || "INACTIVE",
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
      status: formData.status,
    };

    if (formData.password) {
      body.password = formData.password;
    }

    setLoading(true);

    const res = isEdit
      ? await updateSuperAdminAdmin(formData.user_id, body)
      : await createSuperAdminAdmin(body);

    setLoading(false);

    if (res?.success) {
      alert(
        isEdit ? "Admin updated successfully" : "Admin created successfully",
      );
      resetForm();
      loadAdmins(1, 10);
    } else {
      alert(res?.message || "Something went wrong");
    }
  }

  return (
    <div>
      <div className="create-admin">
        <div className="form-header">
          <h3>{isEdit ? "Edit Admin" : "Create Admin"}</h3>

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
                loading ? "Saving..." : isEdit ? "Update Admin" : "Add Admin"
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
          <div className="create-admin-form">
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
                inputDivClass="create-admin-field"
              />
            ))}
          </div>
        </Card>
      </div>

      <h2>Admin Details</h2>

      <Table
        name="superadmin-admins"
        columns={columns}
        rows={admins}
        total={count}
        handlePagination={loadAdmins}
        onCellClick={(row, column) => {
          if (column.key === "action") {
            handleEdit(row);
          }
        }}
      />
    </div>
  );
}
