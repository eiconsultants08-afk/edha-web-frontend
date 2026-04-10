import React, { useMemo, useState } from "react";
import { addPatient } from "../../../../api/api";
import Card from "../../../../components/card/card";
import TextBox from "../../../../components/input/input";
import "./CreatePatient.css";
import Button from "../../../../components/button/button";

const initialForm = {
  name: "",
  gender: "",
  address: "",
  dob: "",
  phone: "",
  email: "",
};

export default function CreatePatient() {
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
      // {
      //   label: "Address",
      //   name: "address",
      //   type: "text",
      //   placeholder: "Enter Address",
      // },
      {
        label: "DOB",
        name: "dob",
        type: "date",
        placeholder: "Enter DOB",
        required: true,
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
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
      gender: formData.gender,
      phone: formData.phone,
      email: formData.email,
    };

    try {
      setLoading(true);

      const res = await addPatient(body);

      if (res?.success || res?.status === 201) {
        alert("Patient created successfully");
        resetForm();
      } else {
        alert(res?.message || "Failed to create patient");
      }
    } catch (error) {
      console.error("Create patient error:", error);
      alert("Something went wrong while creating patient");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-patient">
      <Card
        ctype="primary"
        tag="form"
        onSubmit={handleSubmit}
        style={{ padding: "20px" }}
      >
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
            btnTitle={loading ? "Creating..." : "Create Patient"}
            disabled={loading}
          />
        </div>

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
              inputDivClass="create-patient-field"
            />
          ))}
        </div>
      </Card>
    </div>
  );
}