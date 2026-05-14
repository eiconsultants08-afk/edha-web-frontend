import { useEffect, useMemo, useState } from "react";
import {
  getSuperAdminDevices,
  createSuperAdminDevice,
  updateSuperAdminDevice,
  getSuperAdminOrganizations,
  getSuperAdminTechnicians,
} from "../../../../../api/api";

import Table from "../../../../../components/table/table";
import Card from "../../../../../components/card/card";
import TextBox from "../../../../../components/input/input";
import Button from "../../../../../components/button/button";
import "./SuperAdminDevices.css";

export default function SuperAdminDevices() {
  const initialForm = {
    device_id: "",
    serial_no: "",
    model: "",
    firmware_version: "",
    org_id: "",
    assigned_to_user_id: "",
    department_id: "",
    status: "ACTIVE",
  };

  const [formData, setFormData] = useState(initialForm);
  const [devices, setDevices] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const isEdit = Boolean(
    formData.device_id &&
    devices.some((d) => d.device_id === formData.device_id),
  );

  const statusOptions = [
    { label: "ACTIVE", value: "ACTIVE" },
    { label: "INACTIVE", value: "INACTIVE" },
    { label: "MAINTENANCE", value: "MAINTENANCE" },
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

  const technicianOptions = useMemo(
    () => [
      { label: "Unassigned", value: "" },
      ...technicians
        .filter((tech) => !formData.org_id || tech.org_id === formData.org_id)
        .map((tech) => ({
          label: tech.name || tech.username,
          value: tech.user_id,
        })),
    ],
    [technicians, formData.org_id],
  );

  const fields = useMemo(
    () => [
      {
        label: "Device ID",
        name: "device_id",
        type: "text",
        placeholder: "Enter Device ID",
        required: true,
        disabled: isEdit,
      },
      {
        label: "Serial No",
        name: "serial_no",
        type: "text",
        placeholder: "Enter Serial No",
        required: true,
      },
      {
        label: "Model",
        name: "model",
        type: "text",
        placeholder: "Enter Model",
        required: true,
      },
      {
        label: "Firmware Version",
        name: "firmware_version",
        type: "text",
        placeholder: "Enter Firmware Version",
      },
      {
        label: "Organization",
        name: "org_id",
        type: "select",
        options: orgOptions,
        required: true,
      },
      {
        label: "Assigned Technician",
        name: "assigned_to_user_id",
        type: "select",
        options: technicianOptions,
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
    [isEdit, orgOptions, technicianOptions],
  );

  const columns = [
    { name: "Device ID", key: "device_id", type: "text" },
    { name: "Serial No", key: "serial_no", type: "text" },
    { name: "Model", key: "model", type: "text" },
    { name: "Organization", key: "org_name", type: "text" },
    { name: "Assigned To", key: "assigned_to_name", type: "text" },
    { name: "Status", key: "status", type: "text" },
    { name: "Action", key: "action", type: "text" },
  ];

  useEffect(() => {
    loadOrganizations();
    loadTechnicians();
    loadDevices(1, 10);
  }, []);

  async function loadOrganizations() {
    const res = await getSuperAdminOrganizations(100, 1);
    if (res?.success) {
      setOrganizations(Array.isArray(res?.data?.rows) ? res.data.rows : []);
    }
  }

  async function loadTechnicians() {
    const res = await getSuperAdminTechnicians(500, 1);
    if (res?.success) {
      setTechnicians(Array.isArray(res?.data?.rows) ? res.data.rows : []);
    }
  }

  async function loadDevices(page = 1, pageSize = 10) {
    const res = await getSuperAdminDevices(pageSize, page);

    if (res?.success) {
      const rows = Array.isArray(res?.data?.rows)
        ? res.data.rows.map((device) => {
            const org = organizations.find((o) => o.org_id === device.org_id);
            const tech = technicians.find(
              (t) => t.user_id === device.assigned_to_user_id,
            );

            return {
              ...device,
              id: device.device_id,
              device_id: device.device_id || "----",
              serial_no: device.serial_no || "----",
              model: device.model || "----",
              org_name: org?.org_name || device.org_id || "----",
              assigned_to_name:
                tech?.name ||
                tech?.username ||
                device.assigned_to_user_id ||
                "Unassigned",
              status: device.status || "----",
              action: "Edit",
            };
          })
        : [];

      setDevices(rows);
      setCount(res?.data?.count || rows.length);
    } else {
      setDevices([]);
      setCount(0);
    }
  }

  useEffect(() => {
    if (devices.length > 0) {
      loadDevices(1, 10);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizations, technicians]);

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      if (name === "org_id") {
        updated.assigned_to_user_id = "";
      }

      return updated;
    });
  }

  function resetForm() {
    setFormData(initialForm);
  }

  function handleEdit(device) {
    setFormData({
      device_id: device.device_id === "----" ? "" : device.device_id || "",
      serial_no: device.serial_no === "----" ? "" : device.serial_no || "",
      model: device.model === "----" ? "" : device.model || "",
      firmware_version: device.firmware_version || "",
      org_id: device.org_id || "",
      assigned_to_user_id: device.assigned_to_user_id || "",
      department_id: device.department_id || "",
      status: device.status === "----" ? "ACTIVE" : device.status || "ACTIVE",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const body = {
      device_id: formData.device_id,
      serial_no: formData.serial_no,
      model: formData.model,
      firmware_version: formData.firmware_version || null,
      org_id: formData.org_id,
      assigned_to_user_id: formData.assigned_to_user_id || null,
      department_id: formData.department_id || null,
      status: formData.status,
    };

    setLoading(true);

    const res = isEdit
      ? await updateSuperAdminDevice(formData.device_id, body)
      : await createSuperAdminDevice(body);

    setLoading(false);

    if (res?.success) {
      alert(
        isEdit ? "Device updated successfully" : "Device created successfully",
      );
      resetForm();
      loadDevices(1, 10);
    } else {
      alert(res?.message || "Something went wrong");
    }
  }

  return (
    <div>
      <div className="create-superadmin-device">
        <div className="form-header">
          <h3>{isEdit ? "Edit Device" : "Create Device"}</h3>

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
                loading ? "Saving..." : isEdit ? "Update Device" : "Add Device"
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
          <div className="create-superadmin-device-form">
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
                inputDivClass="create-superadmin-device-field"
              />
            ))}
          </div>
        </Card>
      </div>

      <h2>Device Details</h2>

      <Table
        name="superadmin-devices"
        columns={columns}
        rows={devices}
        total={count}
        handlePagination={loadDevices}
        onCellClick={(row, column) => {
          if (column.key === "action") {
            handleEdit(row);
          }
        }}
      />
    </div>
  );
}
