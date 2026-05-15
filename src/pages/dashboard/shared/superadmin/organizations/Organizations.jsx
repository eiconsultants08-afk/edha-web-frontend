import { useEffect, useMemo, useState } from "react";
import {
  getSuperAdminOrganizations,
  createSuperAdminOrganization,
  updateSuperAdminOrganization,
  getSuperAdminPlans,
  createSuperAdminPlan,
  updateSuperAdminPlan,
  getSuperAdminTests,
  deleteSuperAdminOrganization,
} from "../../../../../api/api";

import Table from "../../../../../components/table/table";
import Card from "../../../../../components/card/card";
import TextBox from "../../../../../components/input/input";
import Button from "../../../../../components/button/button";
import "./Organizations.css";

export default function Organizations() {
  const initialOrgForm = {
    org_id: "",
    org_name: "",
    code: "",
    org_code: "",
    email: "",
    phone: "",
    address: "",
    status: "ACTIVE",
    plan_id: "",
  };

  const initialPlanForm = {
    plan_id: "",
    name: "",
    tier: "custom",
    display_name: "",
    description: "",
    test_type_ids: [],
  };

  const [activeTab, setActiveTab] = useState("organizations");

  const [orgForm, setOrgForm] = useState(initialOrgForm);
  const [organizations, setOrganizations] = useState([]);
  const [orgCount, setOrgCount] = useState(0);

  const [planForm, setPlanForm] = useState(initialPlanForm);
  const [plans, setPlans] = useState([]);
  const [planCount, setPlanCount] = useState(0);

  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);

  const isOrgEdit = Boolean(orgForm.org_id);
  const isPlanEdit = Boolean(planForm.plan_id);

  const statusOptions = [
    { label: "ACTIVE", value: "ACTIVE" },
    { label: "INACTIVE", value: "INACTIVE" },
  ];

  const tierOptions = [
    { label: "Basic", value: "basic" },
    { label: "Premium", value: "premium" },
    { label: "Custom", value: "custom" },
  ];

  const planOptions = plans.map((plan) => ({
    label: plan.display_name || plan.name,
    value: plan.plan_id,
  }));

  const orgFields = useMemo(
    () => [
      {
        label: "Organization Name",
        name: "org_name",
        type: "text",
        placeholder: "Enter Organization Name",
        required: true,
      },
      {
        label: "Code",
        name: "code",
        type: "text",
        placeholder: "Enter Code",
        required: true,
      },
      {
        label: "Org Code",
        name: "org_code",
        type: "text",
        placeholder: "Enter Org Code",
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
      },
      {
        label: "Plan",
        name: "plan_id",
        type: "select",
        options: [{ label: "Select Plan", value: "" }, ...planOptions],
      },
      {
        label: "Status",
        name: "status",
        type: "select",
        options: statusOptions,
      },
      {
        label: "Address",
        name: "address",
        type: "text",
        placeholder: "Enter Address",
      },
    ],
    [plans],
  );

  const planFields = useMemo(
    () => [
      {
        label: "Plan Name",
        name: "name",
        type: "text",
        placeholder: "basic / premium / custom_plan",
        required: true,
      },
      {
        label: "Tier",
        name: "tier",
        type: "select",
        options: tierOptions,
        required: true,
      },
      {
        label: "Display Name",
        name: "display_name",
        type: "text",
        placeholder: "Enter Display Name",
        required: true,
      },
      {
        label: "Description",
        name: "description",
        type: "text",
        placeholder: "Enter Description",
      },
    ],
    [],
  );

  const orgColumns = [
    { name: "Name", key: "org_name", type: "text" },
    { name: "Code", key: "code", type: "text" },
    { name: "Plan", key: "plan_name", type: "text" },
    { name: "Status", key: "status", type: "text" },
    { name: "Action", key: "edit", type: "text" },
    { name: "Delete", key: "delete", type: "text" },
  ];

  const planColumns = [
    { name: "Display Name", key: "display_name", type: "text" },
    { name: "Name", key: "name", type: "text" },
    { name: "Tier", key: "tier", type: "text" },
    { name: "Tests", key: "tests_count", type: "text" },
    { name: "Action", key: "action", type: "text" },
  ];

  useEffect(() => {
    loadOrganizations(1, 10);
    loadPlans(1, 100);
    loadTests();
  }, []);

  async function loadOrganizations(page = 1, pageSize = 10) {
    const res = await getSuperAdminOrganizations(pageSize, page);

    if (res?.success) {
      const rows = Array.isArray(res?.data?.rows)
        ? res.data.rows.map((org) => {
            const plan = plans.find((p) => p.plan_id === org.plan_id);

            return {
              ...org,
              id: org.org_id,
              org_name: org.org_name || "----",
              code: org.code || "----",
              org_code: org.org_code || "----",
              email: org.email || "----",
              phone: org.phone || "----",
              plan_name: plan?.display_name || org.plan_id || "----",
              status: org.status || "----",
              edit: "Edit",
              delete: "❌ Delete",
            };
          })
        : [];

      setOrganizations(rows);
      setOrgCount(res?.data?.count || rows.length);
    }
  }

  async function loadPlans(page = 1, pageSize = 100) {
    const res = await getSuperAdminPlans(pageSize, page);

    if (res?.success) {
      const rows = Array.isArray(res?.data?.rows)
        ? res.data.rows.map((plan) => ({
            ...plan,
            id: plan.plan_id,
            display_name: plan.display_name || "----",
            name: plan.name || "----",
            tier: plan.tier || "----",
            tests_count: getPlanTestNames(plan).length,
            action: "Edit",
          }))
        : [];

      setPlans(rows);
      setPlanCount(res?.data?.count || rows.length);
    }
  }

  async function loadTests() {
    const res = await getSuperAdminTests(500, 1);

    if (res?.success) {
      const rows = Array.isArray(res?.data?.rows) ? res.data.rows : [];
      setTests(rows);
    }
  }

  function handleOrgChange(e) {
    const { name, value } = e.target;
    setOrgForm((prev) => ({ ...prev, [name]: value }));
  }

  function handlePlanChange(e) {
    const { name, value } = e.target;
    setPlanForm((prev) => ({ ...prev, [name]: value }));
  }

  function resetOrgForm() {
    setOrgForm(initialOrgForm);
  }

  function resetPlanForm() {
    setPlanForm(initialPlanForm);
  }

  function handleOrgEdit(org) {
    setOrgForm({
      org_id: org.org_id || "",
      org_name: org.org_name === "----" ? "" : org.org_name || "",
      code: org.code === "----" ? "" : org.code || "",
      org_code: org.org_code === "----" ? "" : org.org_code || "",
      email: org.email === "----" ? "" : org.email || "",
      phone: org.phone === "----" ? "" : org.phone || "",
      address: org.address || "",
      status: org.status || "ACTIVE",
      plan_id: org.plan_id || "",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleOrgDelete(org) {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${org.org_name}"?\n\nThis will permanently delete all related admins, technicians, devices, patients, test histories, and results.`,
    );

    if (!confirmDelete) return;

    setLoading(true);

    const res = await deleteSuperAdminOrganization(org.org_id);

    setLoading(false);

    if (res?.success) {
      alert("Organization deleted successfully");
      resetOrgForm();
      loadOrganizations(1, 10);
    } else {
      alert(res?.message || "Failed to delete organization");
    }
  }

  function getPlanTestNames(plan) {
    const config = plan?.config || {};

    return [
      ...(config.allowed_blood_tests || []),
      ...(config.allowed_urine_tests || []),
      ...(config.allowed_saliva_tests || []),
    ];
  }

  function handlePlanEdit(plan) {
    const allowedNames = getPlanTestNames(plan);

    const selectedIds = tests
      .filter((test) => allowedNames.includes(test.name))
      .map((test) => test.test_type_id);

    setPlanForm({
      plan_id: plan.plan_id || "",
      name: plan.name === "----" ? "" : plan.name || "",
      tier: plan.tier === "----" ? "custom" : plan.tier || "custom",
      display_name: plan.display_name === "----" ? "" : plan.display_name || "",
      description: plan.description || "",
      test_type_ids: selectedIds,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function toggleTest(testTypeId) {
    setPlanForm((prev) => {
      const exists = prev.test_type_ids.includes(testTypeId);

      return {
        ...prev,
        test_type_ids: exists
          ? prev.test_type_ids.filter((id) => id !== testTypeId)
          : [...prev.test_type_ids, testTypeId],
      };
    });
  }

  async function handleOrgSubmit(e) {
    e.preventDefault();

    const body = {
      org_name: orgForm.org_name,
      code: orgForm.code,
      org_code: orgForm.org_code,
      email: orgForm.email,
      phone: orgForm.phone,
      address: orgForm.address,
      status: orgForm.status,
      plan_id: orgForm.plan_id || null,
    };

    setLoading(true);

    const res = isOrgEdit
      ? await updateSuperAdminOrganization(orgForm.org_id, body)
      : await createSuperAdminOrganization(body);

    setLoading(false);

    if (res?.success) {
      alert(
        isOrgEdit
          ? "Organization updated successfully"
          : "Organization created successfully",
      );
      resetOrgForm();
      loadOrganizations(1, 10);
    } else {
      alert(res?.message || "Something went wrong");
    }
  }

  async function handlePlanSubmit(e) {
    e.preventDefault();

    const body = {
      name: planForm.name,
      tier: planForm.tier,
      display_name: planForm.display_name,
      description: planForm.description,
      test_type_ids: planForm.test_type_ids,
    };

    setLoading(true);

    const res = isPlanEdit
      ? await updateSuperAdminPlan(planForm.plan_id, body)
      : await createSuperAdminPlan(body);

    setLoading(false);

    if (res?.success) {
      alert(
        isPlanEdit ? "Plan updated successfully" : "Plan created successfully",
      );
      resetPlanForm();
      loadPlans(1, 100);
    } else {
      alert(res?.message || "Something went wrong");
    }
  }

  const groupedTests = tests.reduce((acc, test) => {
    const key = test.specimen_type || "Other";

    if (!acc[key]) acc[key] = [];
    acc[key].push(test);

    return acc;
  }, {});

  return (
    <div className="organizations-page">
      <div className="organization-tabs">
        <button
          className={`organization-tab-btn ${
            activeTab === "organizations" ? "active" : ""
          }`}
          onClick={() => setActiveTab("organizations")}
        >
          Organizations
        </button>

        <button
          className={`organization-tab-btn ${
            activeTab === "plans" ? "active" : ""
          }`}
          onClick={() => setActiveTab("plans")}
        >
          Plans
        </button>
      </div>

      {activeTab === "organizations" && (
        <>
          <div className="create-organization">
            <div className="form-header">
              <h3>{isOrgEdit ? "Edit Organization" : "Create Organization"}</h3>

              <div className="action-button">
                <Button
                  btntype="button"
                  btnClass="secondary"
                  btnTitle="Reset"
                  btnClick={resetOrgForm}
                />

                <Button
                  btntype="submit"
                  btnClass="primary"
                  btnTitle={
                    loading
                      ? "Saving..."
                      : isOrgEdit
                        ? "Update Organization"
                        : "Add Organization"
                  }
                  btnClick={handleOrgSubmit}
                />
              </div>
            </div>

            <Card
              ctype="primary"
              tag="form"
              style={{ padding: "20px", marginBottom: "20px" }}
            >
              <div className="create-organization-form">
                {orgFields.map((field) => (
                  <TextBox
                    key={field.name}
                    label={field.label}
                    name={field.name}
                    type={field.type}
                    value={orgForm[field.name]}
                    onChange={handleOrgChange}
                    placeholder={field.placeholder}
                    options={field.options || []}
                    required={field.required || false}
                    inputDivClass="create-organization-field"
                  />
                ))}
              </div>
            </Card>
          </div>

          <h2>Organization Details</h2>

          <Table
            name="organizations"
            columns={orgColumns}
            rows={organizations}
            total={orgCount}
            handlePagination={loadOrganizations}
            onCellClick={(row, column) => {
              if (column.key === "action") {
                handleOrgEdit(row);
              }

              if (column.key === "delete") {
                handleOrgDelete(row);
              }
            }}
          />
        </>
      )}

      {activeTab === "plans" && (
        <>
          <div className="create-plan">
            <div className="form-header">
              <h3>{isPlanEdit ? "Edit Plan" : "Create Plan"}</h3>

              <div className="action-button">
                <Button
                  btntype="button"
                  btnClass="secondary"
                  btnTitle="Reset"
                  btnClick={resetPlanForm}
                />

                <Button
                  btntype="submit"
                  btnClass="primary"
                  btnTitle={
                    loading
                      ? "Saving..."
                      : isPlanEdit
                        ? "Update Plan"
                        : "Add Plan"
                  }
                  btnClick={handlePlanSubmit}
                />
              </div>
            </div>

            <Card
              ctype="primary"
              tag="form"
              style={{ padding: "20px", marginBottom: "20px" }}
            >
              <div className="create-plan-form">
                {planFields.map((field) => (
                  <TextBox
                    key={field.name}
                    label={field.label}
                    name={field.name}
                    type={field.type}
                    value={planForm[field.name]}
                    onChange={handlePlanChange}
                    placeholder={field.placeholder}
                    options={field.options || []}
                    required={field.required || false}
                    inputDivClass="create-plan-field"
                  />
                ))}
              </div>

              <div className="plan-tests-wrapper">
                <div className="plan-tests-title">Select Tests For Plan</div>

                <div className="plan-tests-grid">
                  {Object.entries(groupedTests).map(([specimen, list]) => (
                    <div className="plan-test-group" key={specimen}>
                      <h4>{specimen}</h4>

                      <div className="plan-checkbox-list">
                        {list.map((test) => (
                          <div
                            className="plan-checkbox-item"
                            key={test.test_type_id}
                          >
                            <input
                              type="checkbox"
                              id={test.test_type_id}
                              checked={planForm.test_type_ids.includes(
                                test.test_type_id,
                              )}
                              onChange={() => toggleTest(test.test_type_id)}
                            />

                            <label htmlFor={test.test_type_id}>
                              {test.full_name || test.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          <h2>Plan Details</h2>

          <Table
            name="plans"
            columns={planColumns}
            rows={plans}
            total={planCount}
            handlePagination={loadPlans}
            onCellClick={(row, column) => {
              if (column.key === "action") {
                handlePlanEdit(row);
              }
            }}
          />
        </>
      )}
    </div>
  );
}
