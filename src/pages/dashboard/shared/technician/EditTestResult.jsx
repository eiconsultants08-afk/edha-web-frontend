import React, { useEffect, useMemo, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { completeTestSession } from "../../../../api/api";
import Card from "../../../../components/card/card";
import TextBox from "../../../../components/input/input";
import Button from "../../../../components/button/button";
import { toast } from "react-toastify";

const formatDisplay = (iso) => {
  if (!iso) return "N/A";
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

function refRangeLabel(tt, gender) {
  const g = (gender || "").toUpperCase();

  const min =
    g === "MALE" && tt.male_min != null
      ? Number(tt.male_min)
      : g === "FEMALE" && tt.female_min != null
      ? Number(tt.female_min)
      : tt.normal_min != null
      ? Number(tt.normal_min)
      : null;

  const max =
    g === "MALE" && tt.male_max != null
      ? Number(tt.male_max)
      : g === "FEMALE" && tt.female_max != null
      ? Number(tt.female_max)
      : tt.normal_max != null
      ? Number(tt.normal_max)
      : null;

  if (min == null || max == null) return null;
  return `${min} - ${max}${tt.unit ? " " + tt.unit : ""}`;
}

const qualitativeTests = [
  "hiv",
  "hbsag",
  "hcv",
  "dengue",
  "malaria",
  "covid",
];

const isQualitative = (tt) => {
  const name = (tt?.name || tt?.test_type_name || "").toLowerCase().trim();
  return qualitativeTests.some((t) => name.includes(t));
};

export default function EditTestResult() {
  const { history_id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const session = location.state?.session;
  const patientGender = location.state?.patientGender;

  const sessionResults = session?.results || [];

  const [values, setValues] = useState({});
  const [notes, setNotes] = useState(session?.notes || "");
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!session) return;

    const initial = {};
    sessionResults.forEach((r) => {
      const tt = r.testType || {};

      if (isQualitative(tt)) {
        if (r.value_text) initial[r.test_type_id] = r.value_text;
      } else {
        if (r.value_num != null) initial[r.test_type_id] = String(r.value_num);
      }
    });

    setValues(initial);
  }, [session]);

  const errors = useMemo(() => {
    const e = {};

    sessionResults.forEach((r) => {
      const tt = r.testType || {};
      const id = r.test_type_id;
      const raw = String(values[id] || "").trim();

      if (!raw) return;

      if (!isQualitative(tt) && isNaN(Number(raw))) {
        e[id] = "Must be a number";
      }
    });

    return e;
  }, [values, sessionResults]);

  const filledCount = sessionResults.filter(
    (r) => String(values[r.test_type_id] || "").trim() !== ""
  ).length;

  const allFilled = filledCount === sessionResults.length;
  const isValid = filledCount > 0 && Object.keys(errors).length === 0;

  const buildTests = () =>
    sessionResults
      .filter((r) => String(values[r.test_type_id] || "").trim() !== "")
      .map((r) => {
        const tt = r.testType || {};
        const id = r.test_type_id;

        return isQualitative(tt)
          ? { test_type_id: id, value_text: values[id] }
          : { test_type_id: id, value_num: Number(values[id]) };
      });

  const handleSave = async () => {
    setTouched(true);
    if (!isValid) return;

    setSubmitting("save");

    try {
      const res = await completeTestSession(history_id, {
        tests: buildTests(),
        notes: notes.trim() || null,
        complete: false,
      });

      if (res?.success) {
        toast.success(res?.message || "Test values saved.");
        navigate(-1);
      } else {
        toast.error(res?.message || "Failed to save values.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to save values.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleComplete = async () => {
    setTouched(true);
    if (!isValid) return;

    setSubmitting("complete");

    try {
      const res = await completeTestSession(history_id, {
        tests: buildTests(),
        notes: notes.trim() || null,
        complete: true,
      });

      if (res?.success) {
        toast.success(res?.message || "Test session completed.");
        navigate(-1);
      } else {
        toast.error(res?.message || "Failed to complete session.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to complete session.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!session) {
    return <div style={{ padding: "20px" }}>No session data found</div>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ marginBottom: "16px" }}>Record Test Values</h2>

      <Card ctype="primary" style={{ padding: "20px", marginBottom: "20px" }}>
        <div style={{ marginBottom: "12px" }}>
          <strong>Test Date:</strong> {formatDisplay(session?.test_date)}
        </div>

        {session?.device_id ? (
          <div style={{ marginBottom: "16px" }}>
            <strong>Device ID:</strong> {session.device_id}
          </div>
        ) : null}

        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "8px" }}>
            Session Notes (optional)
          </label>
          <TextBox
            name="notes"
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any observations for this session..."
          />
        </div>

        <h3 style={{ marginBottom: "8px" }}>Enter Measurements</h3>
        <p style={{ marginBottom: "16px" }}>
          Record the result value for each registered test.
        </p>

        {sessionResults.length === 0 ? (
          <p>No tests registered for this session.</p>
        ) : (
          sessionResults.map((r) => {
            const tt = r.testType || {};
            const id = r.test_type_id;
            const unit = tt.unit || "";
            const range = refRangeLabel(tt, patientGender);
            const err = touched ? errors[id] : null;

            return (
              <div key={id} style={{ marginBottom: "20px" }}>
                <div
                  style={{
                    border: "1px solid #16a085",
                    borderRadius: "12px",
                    padding: "12px 16px",
                    marginBottom: "10px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: "#eaf7f1",
                  }}
                >
                  <strong>{tt.name || tt.test_type_name || "Test"}</strong>
                  <span>{unit || "-"}</span>
                </div>

                {isQualitative(tt) ? (
                  <select
                    value={values[id] || ""}
                    onChange={(e) =>
                      setValues((prev) => ({
                        ...prev,
                        [id]: e.target.value,
                      }))
                    }
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "10px",
                      border: "1px solid #ccc",
                      outline: "none",
                    }}
                  >
                    <option value="">Select Result</option>
                    <option value="Positive">Positive</option>
                    <option value="Negative">Negative</option>
                  </select>
                ) : (
                  <>
                    <TextBox
                      name={`value_${id}`}
                      type="number"
                      value={values[id] || ""}
                      onChange={(e) =>
                        setValues((prev) => ({
                          ...prev,
                          [id]: e.target.value,
                        }))
                      }
                      placeholder={`Enter value${unit ? " in " + unit : ""}`}
                    />
                    {range && (
                      <p style={{ marginTop: "6px", color: "#666" }}>
                        Normal range: {range}
                      </p>
                    )}
                  </>
                )}

                {err ? (
                  <p style={{ marginTop: "6px", color: "red" }}>{err}</p>
                ) : null}
              </div>
            );
          })
        )}

        <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
          <Button
            btntype="button"
            btnClass="secondary"
            btnTitle={submitting === "save" ? "Saving..." : "Save Test Session"}
            btnClick={handleSave}
            disabled={!!submitting}
          />

          <Button
            btntype="button"
            btnClass="primary"
            btnTitle={
              submitting === "complete"
                ? "Completing..."
                : "Complete Test Session"
            }
            btnClick={handleComplete}
            disabled={!!submitting || !allFilled}
          />

          <Button
            btntype="button"
            btnClass="secondary"
            btnTitle="Cancel"
            btnClick={() => navigate(-1)}
          />
        </div>
      </Card>
    </div>
  );
}