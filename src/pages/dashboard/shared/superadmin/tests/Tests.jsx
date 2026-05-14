import { useEffect, useMemo, useState } from "react";
import {
  getSuperAdminTests,
  updateSuperAdminTest,
} from "../../../../../api/api";

import Table from "../../../../../components/table/table";
import Card from "../../../../../components/card/card";
import TextBox from "../../../../../components/input/input";
import Button from "../../../../../components/button/button";
import "./Tests.css";

export default function Tests() {
  const initialForm = {
    test_type_id: "",
    name: "",
    full_name: "",
    unit: "",
    method: "",
    normal_min: "",
    normal_max: "",
    male_min: "",
    male_max: "",
    female_min: "",
    female_max: "",
    category: "",
    reference_text: "",
    critical_low: "",
    critical_high: "",
    is_qualitative: "false",
    specimen_type: "",
  };

  const [formData, setFormData] = useState(initialForm);
  const [tests, setTests] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const isEdit = Boolean(formData.test_type_id);

  const booleanOptions = [
    { label: "False", value: "false" },
    { label: "True", value: "true" },
  ];

  const fields = useMemo(
    () => [
      {
        label: "Short Name",
        name: "name",
        type: "text",
        placeholder: "Enter Test Name",
        required: true,
      },
      {
        label: "Full Name",
        name: "full_name",
        type: "text",
        placeholder: "Enter Full Name",
      },
      {
        label: "Unit",
        name: "unit",
        type: "text",
        placeholder: "Enter Unit",
        required: true,
      },
      {
        label: "Method",
        name: "method",
        type: "text",
        placeholder: "Enter Method",
      },

      {
        label: "Normal Min",
        name: "normal_min",
        type: "number",
        placeholder: "Normal Min",
      },
      {
        label: "Normal Max",
        name: "normal_max",
        type: "number",
        placeholder: "Normal Max",
      },
      {
        label: "Male Min",
        name: "male_min",
        type: "number",
        placeholder: "Male Min",
      },
      {
        label: "Male Max",
        name: "male_max",
        type: "number",
        placeholder: "Male Max",
      },

      {
        label: "Female Min",
        name: "female_min",
        type: "number",
        placeholder: "Female Min",
      },
      {
        label: "Female Max",
        name: "female_max",
        type: "number",
        placeholder: "Female Max",
      },
      {
        label: "Category",
        name: "category",
        type: "text",
        placeholder: "Enter Category",
      },
      {
        label: "Specimen Type",
        name: "specimen_type",
        type: "text",
        placeholder: "Blood / Urine / Saliva",
      },

      {
        label: "Critical Low",
        name: "critical_low",
        type: "number",
        placeholder: "Critical Low",
      },
      {
        label: "Critical High",
        name: "critical_high",
        type: "number",
        placeholder: "Critical High",
      },
      {
        label: "Qualitative",
        name: "is_qualitative",
        type: "select",
        options: booleanOptions,
      },
      {
        label: "Reference Text",
        name: "reference_text",
        type: "text",
        placeholder: "Enter Reference Text",
      },
    ],
    [],
  );

  const columns = [
    { name: "Name", key: "name", type: "text" },
    { name: "Full Name", key: "full_name", type: "text" },
    { name: "Unit", key: "unit", type: "text" },
    { name: "Category", key: "category", type: "text" },
    { name: "Specimen", key: "specimen_type", type: "text" },
    { name: "Normal Range", key: "normal_range", type: "text" },
    { name: "Action", key: "action", type: "text" },
  ];

  useEffect(() => {
    loadTests(1, 10);
  }, []);

  async function loadTests(page = 1, pageSize = 10) {
    const res = await getSuperAdminTests(pageSize, page);

    if (res?.success) {
      const rows = Array.isArray(res?.data?.rows)
        ? res.data.rows.map((test) => ({
            ...test,
            id: test.test_type_id,
            name: test.name || "----",
            full_name: test.full_name || "----",
            unit: test.unit || "----",
            category: test.category || "----",
            specimen_type: test.specimen_type || "----",
            normal_range:
              test.normal_min || test.normal_max
                ? `${test.normal_min || "-"} - ${test.normal_max || "-"}`
                : "----",
            action: "Edit",
          }))
        : [];

      setTests(rows);
      setCount(res?.data?.count || rows.length);
    } else {
      setTests([]);
      setCount(0);
    }
  }

  function cleanValue(value) {
    return value === "----" || value === null || value === undefined
      ? ""
      : value;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function resetForm() {
    setFormData(initialForm);
  }

  function handleEdit(test) {
    setFormData({
      test_type_id: test.test_type_id || "",
      name: cleanValue(test.name),
      full_name: cleanValue(test.full_name),
      unit: cleanValue(test.unit),
      method: cleanValue(test.method),
      normal_min: cleanValue(test.normal_min),
      normal_max: cleanValue(test.normal_max),
      male_min: cleanValue(test.male_min),
      male_max: cleanValue(test.male_max),
      female_min: cleanValue(test.female_min),
      female_max: cleanValue(test.female_max),
      category: cleanValue(test.category),
      reference_text: cleanValue(test.reference_text),
      critical_low: cleanValue(test.critical_low),
      critical_high: cleanValue(test.critical_high),
      is_qualitative: String(test.is_qualitative || false),
      specimen_type: cleanValue(test.specimen_type),
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!isEdit) {
      alert("Please select a test to edit");
      return;
    }

    const body = {
      name: formData.name,
      full_name: formData.full_name || null,
      unit: formData.unit,
      method: formData.method || null,
      normal_min: formData.normal_min || null,
      normal_max: formData.normal_max || null,
      male_min: formData.male_min || null,
      male_max: formData.male_max || null,
      female_min: formData.female_min || null,
      female_max: formData.female_max || null,
      category: formData.category || null,
      reference_text: formData.reference_text || null,
      critical_low: formData.critical_low || null,
      critical_high: formData.critical_high || null,
      is_qualitative: formData.is_qualitative === "true",
      specimen_type: formData.specimen_type || null,
    };

    setLoading(true);

    const res = await updateSuperAdminTest(formData.test_type_id, body);

    setLoading(false);

    if (res?.success) {
      alert("Test updated successfully");
      resetForm();
      loadTests(1, 10);
    } else {
      alert(res?.message || "Something went wrong");
    }
  }

  return (
    <div>
      <div className="edit-test">
        <div className="form-header">
          <h3>{isEdit ? "Edit Test" : "Select Test To Edit"}</h3>

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
              btnTitle={loading ? "Saving..." : "Update Test"}
              btnClick={handleSubmit}
            />
          </div>
        </div>

        <Card
          ctype="primary"
          tag="form"
          style={{ padding: "20px", marginBottom: "20px" }}
        >
          <div className="edit-test-form">
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
                inputDivClass="edit-test-field"
              />
            ))}
          </div>
        </Card>
      </div>

      <h2>Test Details</h2>

      <Table
        name="superadmin-tests"
        columns={columns}
        rows={tests}
        total={count}
        handlePagination={loadTests}
        onCellClick={(row, column) => {
          if (column.key === "action") {
            handleEdit(row);
          }
        }}
      />
    </div>
  );
}
