import { useEffect, useState, useMemo } from "react";
import { getAllPatients, addPatient } from "../../../../api/api";
import Table from "../../../../components/table/table";
import Card from "../../../../components/card/card";
import TextBox from "../../../../components/input/input";
import Button from "../../../../components/button/button";
import "./CreatePatient.css";

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [count, setCount] = useState(0);

  const initialForm = {
    name: "",
    lastname: "",
    gender: "",
    address: "",
    dob: "",
    age: "",
    phone: "",
    email: "",
  };

  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(false);

  const genderOptions = [
    { label: "Select Gender", value: "" },
    { label: "Male", value: "MALE" },
    { label: "Female", value: "FEMALE" },
    { label: "Other", value: "OTHER" },
  ];

  const fields = useMemo(
    () => [
      {
        label: "First Name",
        name: "name",
        type: "text",
        placeholder: "Enter First Name",
        required: true,
      },
      {
        label: "Last Name",
        name: "lastname",
        type: "text",
        placeholder: "Enter Last Name",
        required: true,
      },
      {
        label: "Gender",
        name: "gender",
        type: "select",
        placeholder: "Select Gender",
        options: genderOptions,
        required: true,
      },
      {
        label: "DOB",
        name: "dob",
        type: "date",
        placeholder: "Enter DOB",
        required: true,
      },
      {
        label: "Age",
        name: "age",
        type: "text",
        placeholder: "Enter Age",
        required: false,
      },
      {
        label: "Phone",
        name: "phone",
        type: "text",
        placeholder: "Enter Phone Number",
      },
      {
        label: "Email",
        name: "email",
        type: "email",
        placeholder: "Enter Email",
      },
    ],
    [],
  );

  const maskName = (name) => {
    const str = String(name || "").trim();
    if (!str) return "";

    return str
      .split(/\s+/)
      .map((part) => {
        if (!part) return "";
        if (part.length === 1) return part;
        return part[0] + "*".repeat(Math.max(part.length - 1, 0));
      })
      .join(" ");
  };

  const maskPhone = (phone) => {
    if (!phone) return "";

    const str = String(phone).trim();

    if (!str) return "";
    if (str.length <= 4) return str;

    return str.slice(0, 4) + "*".repeat(str.length - 4);
  };

  const columns = [
    {
      name: "Reference ID",
      key: "reference_id",
      type: "link",
      baseUrl: "/technician/add-test-result",
      params: "patient_id",
    },
    { name: "Name", key: "name", type: "text" },
    { name: "Gender", key: "gender", type: "text" },
    { name: "Address", key: "address", type: "text" },
    { name: "Phone", key: "phone", type: "text" },
    { name: "Email", key: "email", type: "text" },
    { name: "Organization", key: "org_id", type: "text" },
    { name: "Created By", key: "created_by_name", type: "text" },
  ];

  const loadPatients = async (page, pageSize) => {
    try {
      const res = await getAllPatients(pageSize, page);
      if (res?.success) {
        const patientRows = Array.isArray(res?.data?.rows)
          ? res.data.rows.map((item) => ({
              ...item,
              id: item.patient_id,
              patient_id: item.patient_id,
              reference_id: item.patient_code,
              name: maskName(item.name || ""),
              phone: maskPhone(item.phone || ""),
              address: item.address || "----",
              email: item.email || "----",
              org_id: item.org_id || "----",
              created_by_name: item.created_by_name || "----",
            }))
          : [];

        setPatients(patientRows);
        setCount(res?.data?.count || patientRows.length);
      } else {
        setPatients([]);
        setCount(0);
      }
    } catch (error) {
      console.error("Error loading patients:", error);
      setPatients([]);
      setCount(0);
    }
  };

  const handlePagination = (page, pageSize) => {
    loadPatients(page, pageSize);
  };

  useEffect(() => {
    loadPatients(1, 10);
  }, []);

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
      name: formData.name,
      lastname: formData.lastname,
      dob: formData.dob,
      age: formData.age,
      gender: formData.gender,
      phone: formData.phone,
      email: formData.email,
    };

    try {
      setLoading(true);

      const res = await addPatient(body);

      if (res?.success) {
        alert("Patient created successfully");
        resetForm();
        loadPatients(1, 10);
      } else {
        alert(res?.message || "Failed to create patient");
      }
    } catch (error) {
      console.error("Add patient error:", error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="create-patient">
        <div className="form-header">
          <h3>Create Patient</h3>

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
              btnTitle={loading ? "Creating..." : "Add Patient"}
              btnClick={handleSubmit}
            />
          </div>
        </div>

        <Card
          ctype="primary"
          tag="form"
          style={{ padding: "20px", marginBottom: "20px" }}
        >
          <div className="create-patient-form">
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
                inputDivClass="create-patient-field"
              />
            ))}
          </div>
        </Card>
      </div>

      <h2>Patient Details</h2>
      <Table
        name="patients"
        columns={columns}
        rows={patients}
        total={count}
        handlePagination={handlePagination}
      />
    </div>
  );
}