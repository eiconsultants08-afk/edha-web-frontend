// import { useEffect, useState, useMemo } from "react";
// import { getAllPatients, addPatient } from "../../../../api/api";
// import Table from "../../../../components/table/table";
// import Card from "../../../../components/card/card";
// import TextBox from "../../../../components/input/input";
// import Button from "../../../../components/button/button";
// import "./CreatePatient.css";

// export default function Patients() {
//   const [patients, setPatients] = useState([]);
//   const [count, setCount] = useState(0);
//   const [patientSearch, setPatientSearch] = useState("");

//   const initialForm = {
//     name: "",
//     lastname: "",
//     gender: "",
//     address: "",
//     dob: "",
//     age: "",
//     phone: "",
//     email: "",
//   };

//   const [formData, setFormData] = useState(initialForm);
//   const [loading, setLoading] = useState(false);

//   const genderOptions = [
//     { label: "Select Gender", value: "" },
//     { label: "Male", value: "MALE" },
//     { label: "Female", value: "FEMALE" },
//     { label: "Other", value: "OTHER" },
//   ];

//   const fields = useMemo(
//     () => [
//       {
//         label: "First Name",
//         name: "name",
//         type: "text",
//         placeholder: "Enter First Name",
//         required: true,
//       },
//       {
//         label: "Last Name",
//         name: "lastname",
//         type: "text",
//         placeholder: "Enter Last Name",
//         required: true,
//       },
//       {
//         label: "Gender",
//         name: "gender",
//         type: "select",
//         placeholder: "Select Gender",
//         options: genderOptions,
//         required: true,
//       },
//       {
//         label: "DOB",
//         name: "dob",
//         type: "date",
//         placeholder: "Enter DOB",
//         required: true,
//       },
//       {
//         label: "Age",
//         name: "age",
//         type: "text",
//         placeholder: "Enter Age",
//         required: false,
//       },
//       {
//         label: "Phone",
//         name: "phone",
//         type: "text",
//         placeholder: "Enter Phone Number",
//       },
//       {
//         label: "Email",
//         name: "email",
//         type: "email",
//         placeholder: "Enter Email",
//       },
//     ],
//     [],
//   );

//   const columns = [
//     {
//       name: "Patient ID",
//       key: "patient_id",
//       type: "link",
//       baseUrl: "/technician/add-test-result",
//       params: "patient_id",
//     },
//     { name: "Name", key: "name", type: "text" },
//     { name: "Gender", key: "gender", type: "text" },
//     { name: "Address", key: "address", type: "text" },
//     { name: "Phone", key: "phone", type: "text" },
//     { name: "Email", key: "email", type: "text" },
//     { name: "Organization", key: "org_name", type: "text" },
//     { name: "Created By", key: "created_by_name", type: "text" },
//   ];

//   const filteredPatients = useMemo(() => {
//     const search = patientSearch.toLowerCase().trim();

//     if (!search) return patients;

//     return patients.filter((patient) => {
//       const patientId = String(patient.patient_id || "").toLowerCase();
//       const fullName = String(patient.name || "").toLowerCase();

//       return patientId.includes(search) || fullName.includes(search);
//     });
//   }, [patients, patientSearch]);

//   const loadPatients = async (page, pageSize) => {
//     try {
//       const res = await getAllPatients(pageSize, page);

//       if (res?.success) {
//         const patientRows = Array.isArray(res?.data?.rows)
//           ? res.data.rows.map((item) => ({
//               ...item,
//               id: item.patient_id,
//               patient_id: item.patient_id,
//               reference_id: item.patient_code,
//               name: item.name || "----",
//               phone: item.phone || "----",
//               address: item.address || "----",
//               email: item.email || "----",
//               org_name: item.org_name || "----",
//               created_by_name: item.created_by_name || "----",
//             }))
//           : [];

//         setPatients(patientRows);
//         setCount(res?.data?.count || patientRows.length);
//       } else {
//         setPatients([]);
//         setCount(0);
//       }
//     } catch (error) {
//       console.error("Error loading patients:", error);
//       setPatients([]);
//       setCount(0);
//     }
//   };

//   const handlePagination = (page, pageSize) => {
//     loadPatients(page, pageSize);
//   };

//   useEffect(() => {
//     loadPatients(1, 10);
//   }, []);

//   const handleChange = (e) => {
//     const { name, value } = e.target;

//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const resetForm = () => {
//     setFormData(initialForm);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const body = {
//       name: formData.name,
//       lastname: formData.lastname,
//       dob: formData.dob,
//       age: formData.age,
//       gender: formData.gender,
//       phone: formData.phone,
//       email: formData.email,
//     };

//     try {
//       setLoading(true);

//       const res = await addPatient(body);

//       if (res?.success) {
//         alert("Patient created successfully");
//         resetForm();
//         loadPatients(1, 10);
//       } else {
//         alert(res?.message || "Failed to create patient");
//       }
//     } catch (error) {
//       console.error("Add patient error:", error);
//       alert("Something went wrong");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div>
//       <div className="create-patient">
//         <div className="form-header">
//           <h3>Create Patient</h3>

//           <div className="action-button">
//             <Button
//               btntype="button"
//               btnClass="secondary"
//               btnTitle="Reset"
//               btnClick={resetForm}
//             />

//             <Button
//               btntype="submit"
//               btnClass="primary"
//               btnTitle={loading ? "Creating..." : "Add Patient"}
//               btnClick={handleSubmit}
//             />
//           </div>
//         </div>

//         <Card
//           ctype="primary"
//           tag="form"
//           style={{ padding: "20px", marginBottom: "20px" }}
//         >
//           <div className="create-patient-form">
//             {fields.map((field) => (
//               <TextBox
//                 key={field.name}
//                 label={field.label}
//                 name={field.name}
//                 type={field.type}
//                 value={formData[field.name]}
//                 onChange={handleChange}
//                 placeholder={field.placeholder}
//                 options={field.options || []}
//                 required={field.required || false}
//                 disabled={field.disabled || false}
//                 inputDivClass="create-patient-field"
//               />
//             ))}
//           </div>
//         </Card>
//       </div>

//       <div className="patient-details-header">
//         <h2>Patient Details</h2>

//         <input
//           type="text"
//           className="patient-search-input"
//           placeholder="Search by Patient ID or Full Name"
//           value={patientSearch}
//           onChange={(e) => setPatientSearch(e.target.value)}
//         />
//       </div>

//       <Table
//         name="patients"
//         columns={columns}
//         rows={filteredPatients}
//         total={filteredPatients.length}
//         handlePagination={handlePagination}
//       />
//     </div>
//   );
// }

import { useEffect, useState, useMemo } from "react";
import {
  getAllPatients,
  addPatient,
  updatePatientSampleId,
} from "../../../../api/api";
import Table from "../../../../components/table/table";
import Card from "../../../../components/card/card";
import TextBox from "../../../../components/input/input";
import Button from "../../../../components/button/button";
import "./CreatePatient.css";

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [count, setCount] = useState(0);
  const [patientSearch, setPatientSearch] = useState("");

  const [editingPatientId, setEditingPatientId] = useState(null);
  const [editingSampleId, setEditingSampleId] = useState("");

  const initialForm = {
    name: "",
    lastname: "",
    sample_id: "",
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
        label: "Sample ID",
        name: "sample_id",
        type: "text",
        placeholder: "Enter Sample ID",
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

  const columns = [
    {
      name: "Patient ID",
      key: "patient_id",
      type: "link",
      baseUrl: "/technician/add-test-result",
      params: "patient_id",
    },
    { name: "Sample ID", key: "sample_id_view", type: "text" },
    { name: "Name", key: "name", type: "text" },
    { name: "Gender", key: "gender", type: "text" },
    { name: "Phone", key: "phone", type: "text" },
    { name: "Email", key: "email", type: "text" },
    { name: "Organization", key: "org_name", type: "text" },
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
              sample_id: item.sample_id || "",
              reference_id: item.patient_code,
              name: item.name || "----",
              phone: item.phone || "----",
              address: item.address || "----",
              email: item.email || "----",
              org_name: item.org_name || "----",
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

  const handleSampleSave = async (patientId) => {
    try {
      const res = await updatePatientSampleId(patientId, {
        sample_id: editingSampleId.trim(),
      });

      if (res?.success) {
        setEditingPatientId(null);
        setEditingSampleId("");
        loadPatients(1, 10);
      } else {
        alert(res?.message || "Failed to update Sample ID");
      }
    } catch (error) {
      console.error("Sample ID update error:", error);
      alert("Something went wrong");
    }
  };

  const filteredPatients = useMemo(() => {
    const search = patientSearch.toLowerCase().trim();

    const filtered = !search
      ? patients
      : patients.filter((patient) => {
          const patientId = String(patient.patient_id || "").toLowerCase();
          const fullName = String(patient.name || "").toLowerCase();

          return patientId.includes(search) || fullName.includes(search);
        });

    return filtered.map((patient) => ({
      ...patient,
      sample_id_view:
        editingPatientId === patient.patient_id ? (
          <div className="sample-edit-box">
            <input
              type="text"
              className="sample-inline-input"
              value={editingSampleId}
              onChange={(e) => setEditingSampleId(e.target.value)}
              placeholder="Sample ID"
            />

            <button
              type="button"
              className="sample-save-btn"
              onClick={() => handleSampleSave(patient.patient_id)}
            >
              ✔
            </button>

            <button
              type="button"
              className="sample-cancel-btn"
              onClick={() => {
                setEditingPatientId(null);
                setEditingSampleId("");
              }}
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="sample-view-box">
            <span>{patient.sample_id || "----"}</span>

            <button
              type="button"
              className="sample-edit-btn"
              onClick={() => {
                setEditingPatientId(patient.patient_id);
                setEditingSampleId(patient.sample_id || "");
              }}
            >
              ✎
            </button>
          </div>
        ),
    }));
  }, [patients, patientSearch, editingPatientId, editingSampleId]);

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
      sample_id: formData.sample_id,
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

      <div className="patient-details-header">
        <h2>Patient Details</h2>

        <input
          type="text"
          className="patient-search-input"
          placeholder="Search by Patient ID or Full Name"
          value={patientSearch}
          onChange={(e) => setPatientSearch(e.target.value)}
        />
      </div>

      <Table
        name="patients"
        columns={columns}
        rows={filteredPatients}
        total={count}
        handlePagination={handlePagination}
      />
    </div>
  );
}