import React, { useEffect, useMemo, useState } from "react";
import "./IncubatorGrid.css";

const TOTAL_SLOTS = 28;

const HARDCODED_TEST_TYPES = [
  // MSU (Urine Biochemistry) - 17 tests
  { id: 1, name: "ACR", unit: "mg/g", category: "MSU (Urine Biochemistry)", duration: "05:00", seconds: 5 * 60 },
  { id: 2, name: "ALB", unit: "mg/dL", category: "MSU (Urine Biochemistry)", duration: "05:00", seconds: 5 * 60 },
  { id: 3, name: "ASC", unit: "mmol/L", category: "MSU (Urine Biochemistry)", duration: "05:00", seconds: 5 * 60 },
  { id: 4, name: "BIL", unit: "µmol/L", category: "MSU (Urine Biochemistry)", duration: "05:00", seconds: 5 * 60 },
  { id: 5, name: "BLO", unit: "cell/µL", category: "MSU (Urine Biochemistry)", duration: "05:00", seconds: 5 * 60 },
  { id: 6, name: "CA", unit: "mg/dL", category: "MSU (Urine Biochemistry)", duration: "05:00", seconds: 5 * 60 },
  { id: 7, name: "Colour", unit: "", category: "MSU (Urine Biochemistry)", duration: "05:00", seconds: 5 * 60 },
  { id: 8, name: "CRE", unit: "mg/dL", category: "MSU (Urine Biochemistry)", duration: "05:00", seconds: 5 * 60 },
  { id: 9, name: "GLU", unit: "mmol/L", category: "MSU (Urine Biochemistry)", duration: "07:00", seconds: 7 * 60 },
  { id: 10, name: "KET", unit: "mmol/L", category: "MSU (Urine Biochemistry)", duration: "05:00", seconds: 5 * 60 },
  { id: 11, name: "LEU", unit: "cell/µL", category: "MSU (Urine Biochemistry)", duration: "05:00", seconds: 5 * 60 },
  { id: 12, name: "NIT", unit: "mmol/L", category: "MSU (Urine Biochemistry)", duration: "05:00", seconds: 5 * 60 },
  { id: 13, name: "pH", unit: "", category: "MSU (Urine Biochemistry)", duration: "05:00", seconds: 5 * 60 },
  { id: 14, name: "PRO", unit: "g/L", category: "MSU (Urine Biochemistry)", duration: "05:00", seconds: 5 * 60 },
  { id: 15, name: "SG", unit: "", category: "MSU (Urine Biochemistry)", duration: "05:00", seconds: 5 * 60 },
  { id: 16, name: "Transparency", unit: "", category: "MSU (Urine Biochemistry)", duration: "05:00", seconds: 5 * 60 },
  { id: 17, name: "URO", unit: "mg/dL", category: "MSU (Urine Biochemistry)", duration: "05:00", seconds: 5 * 60 },

  // Haemogram biochemistry
  { id: 18, name: "Hb", unit: "g/dL", category: "Haemogram biochemistry", duration: "00:10", seconds: 10 },
  { id: 19, name: "HbA1C", unit: "%", category: "Haemogram biochemistry", duration: "10:00", seconds: 10 * 60 },

  // Serum Biochemistry
  { id: 20, name: "RBS", unit: "mg/dL", category: "Serum Biochemistry", duration: "01:00", seconds: 1 * 60 },
  { id: 21, name: "S. Albumin", unit: "g/dL", category: "Serum Biochemistry", duration: "01:00", seconds: 1 * 60 },
  { id: 22, name: "S. Calcium", unit: "mg/dL", category: "Serum Biochemistry", duration: "02:00", seconds: 2 * 60 },
  { id: 23, name: "S. Creatinine", unit: "mg/dL", category: "Serum Biochemistry", duration: "03:00", seconds: 3 * 60 },
  { id: 24, name: "S. Direct Bilirubin", unit: "mg/dL", category: "Serum Biochemistry", duration: "05:00", seconds: 5 * 60 },
  { id: 25, name: "S. HDL-C", unit: "mg/dL", category: "Serum Biochemistry", duration: "10:00", seconds: 10 * 60 },
  { id: 26, name: "S. TC", unit: "mg/dL", category: "Serum Biochemistry", duration: "05:00", seconds: 5 * 60 },
  { id: 27, name: "S. Total Bilirubin", unit: "mg/dL", category: "Serum Biochemistry", duration: "05:00", seconds: 5 * 60 },
  { id: 28, name: "S. TP", unit: "g/dL", category: "Serum Biochemistry", duration: "03:00", seconds: 3 * 60 },
  { id: 29, name: "S. Triglycerides", unit: "mg/dL", category: "Serum Biochemistry", duration: "05:00", seconds: 5 * 60 },
  { id: 30, name: "S. Urea", unit: "mg/dL", category: "Serum Biochemistry", duration: "10:00", seconds: 10 * 60 },
  { id: 31, name: "S. Uric Acid", unit: "mg/dL", category: "Serum Biochemistry", duration: "05:00", seconds: 5 * 60 },
];

const createInitialSlots = () =>
  Array.from({ length: TOTAL_SLOTS }, (_, index) => ({
    id: index + 1,
    testName: "",
    patientId: "",
    packageName: "",
    category: "",
    status: "Unassigned",
    durationSeconds: 0,
    remainingSeconds: 0,
    isRunning: false,
    isCompleted: false,
  }));

const formatTime = (totalSeconds) => {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

export default function IncubatorGrid() {
  const [slots, setSlots] = useState(createInitialSlots());
  const [patientId, setPatientId] = useState("");
  const [queue, setQueue] = useState([]);
  const [cols, setCols] = useState(4);

  const [testTypes] = useState(HARDCODED_TEST_TYPES);
  const [selectedCategory, setSelectedCategory] = useState(
    HARDCODED_TEST_TYPES[0]?.category || ""
  );
  const [selectedTests, setSelectedTests] = useState([]);

  const rows = Math.ceil(TOTAL_SLOTS / cols);

  useEffect(() => {
    const interval = setInterval(() => {
      setSlots((prevSlots) =>
        prevSlots.map((slot) => {
          if (!slot.isRunning || slot.remainingSeconds <= 0) return slot;

          const nextRemaining = slot.remainingSeconds - 1;

          if (nextRemaining <= 0) {
            return {
              ...slot,
              remainingSeconds: 0,
              isRunning: false,
              isCompleted: true,
              status: "Completed",
            };
          }

          return {
            ...slot,
            remainingSeconds: nextRemaining,
          };
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setSelectedTests([]);
  }, [selectedCategory]);

  const categoryOptions = useMemo(() => {
    return [...new Set(testTypes.map((item) => item.category).filter(Boolean))];
  }, [testTypes]);

  const filteredTests = useMemo(() => {
    if (!selectedCategory) return [];
    return testTypes.filter((item) => item.category === selectedCategory);
  }, [testTypes, selectedCategory]);

  const selectedCategoryInfo = useMemo(() => {
    return {
      name: selectedCategory,
      tests: filteredTests.map((item) => item.name),
    };
  }, [selectedCategory, filteredTests]);

  const nextActionText = useMemo(() => {
    const freeSlot = slots.find((slot) => !slot.testName);

    if (queue.length === 0 || !freeSlot) {
      return "No pending queue or no free slot right now.";
    }

    const nextItem = queue[0];
    return `Next queued test: ${nextItem.testName}${
      nextItem.patientId ? ` | Patient ID: ${nextItem.patientId}` : ""
    }${nextItem.packageName ? ` | ${nextItem.packageName}` : ""} → Assign to Slot ${freeSlot.id}`;
  }, [queue, slots]);

  const toggleTestSelection = (testName) => {
    setSelectedTests((prev) =>
      prev.includes(testName)
        ? prev.filter((item) => item !== testName)
        : [...prev, testName]
    );
  };

  const selectAllTests = () => {
    setSelectedTests(filteredTests.map((test) => test.name));
  };

  const clearSelectedTests = () => {
    setSelectedTests([]);
  };

  const addCategoryToQueue = () => {
    if (!patientId.trim()) {
      alert("Please enter Patient ID.");
      return;
    }

    if (filteredTests.length === 0) {
      alert("No tests available in selected category.");
      return;
    }

    const categoryQueueItems = filteredTests.map((test, index) => ({
      id: `${Date.now()}_${index}_${test.name}`,
      category: selectedCategory,
      packageName: selectedCategory,
      testName: test.name,
      duration: test.duration,
      seconds: test.seconds,
      patientId: patientId.trim(),
      unit: test.unit,
    }));

    setQueue((prev) => [...prev, ...categoryQueueItems]);
    setPatientId("");
    setSelectedTests([]);
  };

  const addSelectedTestsToQueue = () => {
    if (!patientId.trim()) {
      alert("Please enter Patient ID.");
      return;
    }

    if (selectedTests.length === 0) {
      alert("Please select at least one test.");
      return;
    }

    const chosenTests = filteredTests.filter((test) =>
      selectedTests.includes(test.name)
    );

    const queueItems = chosenTests.map((test, index) => ({
      id: `${Date.now()}_${index}_${test.name}`,
      category: selectedCategory,
      packageName: selectedCategory,
      testName: test.name,
      duration: test.duration,
      seconds: test.seconds,
      patientId: patientId.trim(),
      unit: test.unit,
    }));

    setQueue((prev) => [...prev, ...queueItems]);
    setPatientId("");
    setSelectedTests([]);
  };

  const assignNextFromQueue = () => {
    if (queue.length === 0) return;

    const freeSlot = slots.find((slot) => !slot.testName);
    if (!freeSlot) {
      alert("No free slot available.");
      return;
    }

    const nextItem = queue[0];

    setSlots((prev) =>
      prev.map((slot) =>
        slot.id === freeSlot.id
          ? {
              ...slot,
              testName: nextItem.testName,
              patientId: nextItem.patientId,
              packageName: nextItem.packageName,
              category: nextItem.category || "",
              status: "Running",
              durationSeconds: nextItem.seconds,
              remainingSeconds: nextItem.seconds,
              isRunning: true,
              isCompleted: false,
            }
          : slot
      )
    );

    setQueue((prev) => prev.slice(1));
  };

  const pauseSlot = (slotId) => {
    setSlots((prev) =>
      prev.map((slot) =>
        slot.id === slotId
          ? {
              ...slot,
              isRunning: false,
              status: slot.remainingSeconds > 0 ? "Paused" : slot.status,
            }
          : slot
      )
    );
  };

  const resumeSlot = (slotId) => {
    setSlots((prev) =>
      prev.map((slot) =>
        slot.id === slotId && slot.remainingSeconds > 0
          ? {
              ...slot,
              isRunning: true,
              isCompleted: false,
              status: "Running",
            }
          : slot
      )
    );
  };

  const clearSlot = (slotId) => {
    setSlots((prev) =>
      prev.map((slot) =>
        slot.id === slotId
          ? {
              id: slot.id,
              testName: "",
              patientId: "",
              packageName: "",
              category: "",
              status: "Unassigned",
              durationSeconds: 0,
              remainingSeconds: 0,
              isRunning: false,
              isCompleted: false,
            }
          : slot
      )
    );
  };

  const resetAll = () => {
    const firstCategory = categoryOptions[0] || "";
    setSlots(createInitialSlots());
    setQueue([]);
    setPatientId("");
    setCols(4);
    setSelectedCategory(firstCategory);
    setSelectedTests([]);
  };

  const loadDemoQueue = () => {
    const demoTests = filteredTests.slice(0, 4);

    if (demoTests.length === 0) {
      alert("No tests available for demo in selected category.");
      return;
    }

    const demoItems = demoTests.map((test, index) => ({
      id: `demo_${index + 1}_${test.id}`,
      packageName: selectedCategory,
      category: selectedCategory,
      testName: test.name,
      duration: test.duration,
      seconds: test.seconds,
      patientId: `P${1000 + index + 1}`,
      unit: test.unit,
    }));

    setQueue(demoItems);
  };

  return (
    <div className="incubator-page">
      <div className="incubator-header">
        <div>
          <h1 className="incubator-title">Incubator Grid Timers</h1>
          <p className="incubator-subtitle">
            Dynamic Slots • Row-major numbering • Category-based Test Queue
          </p>
        </div>

        <div className="incubator-top-controls">
          <div className="incubator-counter-wrap">
            <span className="incubator-counter-label">Rows</span>
            <input
              type="number"
              value={rows}
              readOnly
              className="incubator-counter-input"
            />

            <span className="incubator-counter-label">Cols</span>
            <input
              type="number"
              min="1"
              max="7"
              value={cols}
              onChange={(e) => {
                const value = Number(e.target.value);
                if (value >= 1 && value <= 7) {
                  setCols(value);
                }
              }}
              className="incubator-counter-input"
            />
          </div>

          <button className="incubator-top-btn" onClick={resetAll}>
            Reset All
          </button>

          <button className="incubator-top-btn" onClick={loadDemoQueue}>
            Load Demo Queue
          </button>
        </div>
      </div>

      <div className="incubator-summary-grid">
        <div className="incubator-panel">
          <h3 className="incubator-panel-title">Next Action</h3>
          <p className="incubator-next-action">{nextActionText}</p>

          {queue.length > 0 && (
            <button className="incubator-main-btn" onClick={assignNextFromQueue}>
              Assign Next from Queue
            </button>
          )}
        </div>

        <div className="incubator-panel">
          <h3 className="incubator-panel-title">Add Tests to Queue</h3>

          <select
            className="incubator-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categoryOptions.map((category) => {
              const count = testTypes.filter(
                (item) => item.category === category
              ).length;

              return (
                <option key={category} value={category}>
                  {category} ({count} tests)
                </option>
              );
            })}
          </select>

          <input
            type="text"
            placeholder="Patient ID"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            className="incubator-input"
          />

          {selectedCategoryInfo && selectedCategoryInfo.tests.length > 0 && (
            <div className="incubator-package-preview">
              <div className="incubator-package-preview-title">
                {selectedCategoryInfo.name} includes {selectedCategoryInfo.tests.length} tests
              </div>
              <div className="incubator-package-preview-list">
                {selectedCategoryInfo.tests.join(", ")}
              </div>
            </div>
          )}

          <div className="incubator-test-selector">
            <div className="incubator-test-selector-header">
              <div className="incubator-test-selector-title">
                Choose Tests ({selectedTests.length} selected)
              </div>

              <div className="incubator-test-selector-actions">
                <button
                  type="button"
                  className="incubator-small-btn"
                  onClick={selectAllTests}
                >
                  Select All
                </button>
                <button
                  type="button"
                  className="incubator-small-btn"
                  onClick={clearSelectedTests}
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="incubator-test-checkbox-list">
              {filteredTests.map((test) => (
                <label key={test.id} className="incubator-test-checkbox-item">
                  <input
                    type="checkbox"
                    checked={selectedTests.includes(test.name)}
                    onChange={() => toggleTestSelection(test.name)}
                  />
                  <span>
                    {test.name}
                    {test.unit ? ` (${test.unit})` : ""}
                    {test.duration ? ` - ${test.duration}` : ""}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="incubator-dual-btns">
            <button className="incubator-main-btn" onClick={addSelectedTestsToQueue}>
              Add Selected Tests
            </button>

            <button className="incubator-main-btn" onClick={addCategoryToQueue}>
              Add Full Category
            </button>
          </div>
        </div>

        <div className="incubator-panel">
          <h3 className="incubator-panel-title">Locked Test Catalogue</h3>
          <ul className="incubator-catalogue-list">
            {filteredTests.map((test) => (
              <li key={test.id}>
                {test.name}
                {test.unit ? ` — ${test.unit}` : ""}
                {test.duration ? ` — ${test.duration}` : ""}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {queue.length > 0 && (
        <div className="incubator-panel incubator-queue-panel">
          <h3 className="incubator-panel-title">Queue</h3>
          <div className="incubator-queue-list">
            {queue.map((item, index) => (
              <div key={item.id} className="incubator-queue-item">
                <strong>{index + 1}.</strong> {item.testName} — {item.duration}
                {item.patientId ? ` | Patient ID: ${item.patientId}` : ""}
                {item.packageName ? ` | ${item.packageName}` : ""}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="incubator-slot-grid fixed-grid">
        {slots.map((slot) => (
          <div key={slot.id} className="incubator-slot-card">
            <div className="incubator-slot-number">Slot {slot.id}</div>

            <div
              className={`incubator-slot-status ${
                slot.status === "Completed"
                  ? "completed"
                  : slot.status === "Running"
                  ? "running"
                  : slot.status === "Paused"
                  ? "paused"
                  : ""
              }`}
            >
              {slot.status}
            </div>

            <div className="incubator-slot-test">{slot.testName || "—"}</div>

            <div className="incubator-slot-patient">
              {slot.patientId ? `Patient ID: ${slot.patientId}` : ""}
            </div>

            <div className="incubator-slot-patient">
              {slot.packageName ? `Category: ${slot.packageName}` : ""}
            </div>

            {slot.testName ? (
              <div className="incubator-timer-box">
                <div className="incubator-timer-label">Timer</div>
                <div className="incubator-timer-value">
                  {formatTime(slot.remainingSeconds)}
                </div>
              </div>
            ) : null}

            {slot.testName ? (
              <>
                {slot.status !== "Completed" && (
                  <div className="incubator-slot-actions">
                    {slot.isRunning ? (
                      <button
                        className="incubator-slot-btn"
                        onClick={() => pauseSlot(slot.id)}
                      >
                        Pause
                      </button>
                    ) : (
                      <button
                        className="incubator-slot-btn"
                        onClick={() => resumeSlot(slot.id)}
                      >
                        Resume
                      </button>
                    )}
                  </div>
                )}

                <button
                  className="incubator-slot-btn incubator-clear-btn"
                  onClick={() => clearSlot(slot.id)}
                >
                  Clear Slot
                </button>
              </>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}