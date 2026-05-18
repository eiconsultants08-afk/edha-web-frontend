import { useEffect, useState, useMemo } from "react";
import {
  getAdminPatients,
  addAdminPatient,
  downloadAdminCsvReport,
  downloadAdminPdfReport,
} from "../../../../../api/api";
import Table from "../../../../../components/table/table";
import Card from "../../../../../components/card/card";
import TextBox from "../../../../../components/input/input";
import Button from "../../../../../components/button/button";

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [excelLoading, setExcelLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

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
    []
  );

  const downloadBase64File = (base64, filename, mimeType) => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadExcel = async () => {
    try {
      setExcelLoading(true);

      const res = await downloadAdminCsvReport();

      if (res?.success) {
        downloadBase64File(
          res.data.xlsx_base64,
          res.data.filename || "admin_report.xlsx",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
      } else {
        alert(res?.message || "Failed to download Excel report");
      }
    } catch (error) {
      console.error("Excel download error:", error);
      alert("Something went wrong while downloading Excel");
    } finally {
      setExcelLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      setPdfLoading(true);

      const res = await downloadAdminPdfReport();

      if (res?.success) {
        downloadBase64File(
          res.data.pdf_base64,
          res.data.filename || "admin_report.pdf",
          "application/pdf"
        );
      } else {
        alert(res?.message || "Failed to download PDF report");
      }
    } catch (error) {
      console.error("PDF download error:", error);
      alert("Something went wrong while downloading PDF");
    } finally {
      setPdfLoading(false);
    }
  };

  const columns = [
    {
      name: "Patient ID",
      key: "patient_id",
      type: "link",
      baseUrl: "/patient",
      params: "patient_id",
    },
    { name: "Name", key: "name", type: "text" },
    { name: "Gender", key: "gender", type: "text" },
    { name: "Phone", key: "phone", type: "text" },
    { name: "Email", key: "email", type: "text" },
    { name: "Organization", key: "org_id", type: "text" },
    { name: "Created By", key: "created_by_name", type: "text" },
  ];

  const loadPatients = async (page, pageSize) => {
    try {
      const res = await getAdminPatients(pageSize, page);

      if (res?.success) {
        const patientRows = Array.isArray(res?.data?.rows)
          ? res.data.rows.map((item) => ({
              ...item,
              id: item.patient_id,
              patient_id: item.patient_id,
              reference_id: item.patient_code,
              name: item.name || "----",
              phone: item.phone || "----",
              email: item.email || "----",
              org_id: item.org_name || "----",
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
      console.error("Error loading admin patients:", error);
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

      const res = await addAdminPatient(body);

      if (res?.success) {
        alert("Patient created successfully");
        resetForm();
        loadPatients(1, 10);
      } else {
        alert(res?.message || "Failed to create patient");
      }
    } catch (error) {
      console.error("Add admin patient error:", error);
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

      <div className="form-header">
        <h2>Patient Details</h2>

        <div className="action-button">
          <Button
            btntype="button"
            btnClass="secondary"
            btnTitle={excelLoading ? "Downloading..." : "Download Excel"}
            btnClick={handleDownloadExcel}
          />

          <Button
            btntype="button"
            btnClass="primary"
            btnTitle={pdfLoading ? "Downloading..." : "Download PDF"}
            btnClick={handleDownloadPdf}
          />
        </div>
      </div>

      <Table
        name="admin-patients"
        columns={columns}
        rows={patients}
        total={count}
        handlePagination={handlePagination}
      />
    </div>
  );
}