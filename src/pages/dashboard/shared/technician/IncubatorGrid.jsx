// import React, { useEffect, useMemo, useState } from "react";
// import "./IncubatorGrid.css";

// const LOCKED_TEST_CATALOGUE = [
//   { name: "Cholesterol", duration: "05:00", seconds: 5 * 60 },
//   { name: "Glucose", duration: "07:00", seconds: 7 * 60 },
//   { name: "Calcium", duration: "01:00", seconds: 1 * 60 },
//   { name: "Zinc", duration: "01:00", seconds: 1 * 60 },
// ];

// const TOTAL_SLOTS = 28;

// const createInitialSlots = () =>
//   Array.from({ length: TOTAL_SLOTS }, (_, index) => ({
//     id: index + 1,
//     testName: "",
//     patientId: "",
//     status: "Unassigned",
//     durationSeconds: 0,
//     remainingSeconds: 0,
//     isRunning: false,
//     isCompleted: false,
//   }));

// const formatTime = (totalSeconds) => {
//   const mins = Math.floor(totalSeconds / 60);
//   const secs = totalSeconds % 60;
//   return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
// };

// const getTestByName = (testName) =>
//   LOCKED_TEST_CATALOGUE.find((item) => item.name === testName);

// export default function IncubatorGrid() {
//   const [slots, setSlots] = useState(createInitialSlots());
//   const [selectedTest, setSelectedTest] = useState("Cholesterol");
//   const [patientId, setPatientId] = useState("");
//   const [queue, setQueue] = useState([]);
//   const [cols, setCols] = useState(4);

//   const rows = Math.ceil(TOTAL_SLOTS / cols);

//   const selectedTestDuration = useMemo(() => {
//     const found = getTestByName(selectedTest);
//     return found?.duration || "00:00";
//   }, [selectedTest]);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setSlots((prev) =>
//         prev.map((slot) => {
//           if (!slot.isRunning || slot.remainingSeconds <= 0) return slot;

//           const nextRemaining = slot.remainingSeconds - 1;

//           if (nextRemaining <= 0) {
//             return {
//               ...slot,
//               remainingSeconds: 0,
//               isRunning: false,
//               isCompleted: true,
//               status: "Completed",
//             };
//           }

//           return {
//             ...slot,
//             remainingSeconds: nextRemaining,
//           };
//         })
//       );
//     }, 1000);

//     return () => clearInterval(interval);
//   }, []);

//   const nextActionText = useMemo(() => {
//     const freeSlot = slots.find((slot) => !slot.testName);

//     if (queue.length === 0 || !freeSlot) {
//       return "No pending queue or no free slot right now.";
//     }

//     const nextItem = queue[0];
//     return `Next queued test: ${nextItem.testName}${
//       nextItem.patientId ? ` | Patient ID: ${nextItem.patientId}` : ""
//     } → Assign to Slot ${freeSlot.id}`;
//   }, [queue, slots]);

//   const addToQueue = () => {
//     if (!selectedTest) return;

//     const test = getTestByName(selectedTest);

//     const newItem = {
//       id: Date.now(),
//       testName: selectedTest,
//       duration: test?.duration || "00:00",
//       seconds: test?.seconds || 0,
//       patientId: patientId.trim(),
//     };

//     setQueue((prev) => [...prev, newItem]);
//     setPatientId("");
//   };

//   const assignQuickTest = (slotId, testName) => {
//     const test = getTestByName(testName);
//     if (!test) return;

//     setSlots((prev) =>
//       prev.map((slot) =>
//         slot.id === slotId
//           ? {
//               ...slot,
//               testName,
//               patientId: "",
//               status: "Running",
//               durationSeconds: test.seconds,
//               remainingSeconds: test.seconds,
//               isRunning: true,
//               isCompleted: false,
//             }
//           : slot
//       )
//     );
//   };

//   const assignCustomTest = (slotId) => {
//     const customTest = window.prompt("Enter test name:");
//     if (!customTest) return;

//     const customPatientId = window.prompt("Enter patient ID (optional):") || "";
//     const customMinutes = window.prompt("Enter timer in minutes:", "5");

//     const minutes = Number(customMinutes);
//     if (!minutes || minutes <= 0) {
//       alert("Please enter a valid time in minutes.");
//       return;
//     }

//     const totalSeconds = Math.floor(minutes * 60);

//     setSlots((prev) =>
//       prev.map((slot) =>
//         slot.id === slotId
//           ? {
//               ...slot,
//               testName: customTest,
//               patientId: customPatientId,
//               status: "Running",
//               durationSeconds: totalSeconds,
//               remainingSeconds: totalSeconds,
//               isRunning: true,
//               isCompleted: false,
//             }
//           : slot
//       )
//     );
//   };

//   const assignNextFromQueue = () => {
//     if (queue.length === 0) return;

//     const freeSlot = slots.find((slot) => !slot.testName);
//     if (!freeSlot) {
//       alert("No free slot available.");
//       return;
//     }

//     const nextItem = queue[0];

//     setSlots((prev) =>
//       prev.map((slot) =>
//         slot.id === freeSlot.id
//           ? {
//               ...slot,
//               testName: nextItem.testName,
//               patientId: nextItem.patientId,
//               status: "Running",
//               durationSeconds: nextItem.seconds,
//               remainingSeconds: nextItem.seconds,
//               isRunning: true,
//               isCompleted: false,
//             }
//           : slot
//       )
//     );

//     setQueue((prev) => prev.slice(1));
//   };

//   const pauseSlot = (slotId) => {
//     setSlots((prev) =>
//       prev.map((slot) =>
//         slot.id === slotId
//           ? {
//               ...slot,
//               isRunning: false,
//               status: slot.remainingSeconds > 0 ? "Paused" : slot.status,
//             }
//           : slot
//       )
//     );
//   };

//   const resumeSlot = (slotId) => {
//     setSlots((prev) =>
//       prev.map((slot) =>
//         slot.id === slotId && slot.remainingSeconds > 0
//           ? {
//               ...slot,
//               isRunning: true,
//               isCompleted: false,
//               status: "Running",
//             }
//           : slot
//       )
//     );
//   };

//   const clearSlot = (slotId) => {
//     setSlots((prev) =>
//       prev.map((slot) =>
//         slot.id === slotId
//           ? {
//               id: slot.id,
//               testName: "",
//               patientId: "",
//               status: "Unassigned",
//               durationSeconds: 0,
//               remainingSeconds: 0,
//               isRunning: false,
//               isCompleted: false,
//             }
//           : slot
//       )
//     );
//   };

//   const resetAll = () => {
//     setSlots(createInitialSlots());
//     setQueue([]);
//     setSelectedTest("Cholesterol");
//     setPatientId("");
//     setCols(4);
//   };

//   const loadDemoQueue = () => {
//     setQueue([
//       { id: 1, testName: "Cholesterol", duration: "05:00", seconds: 300, patientId: "P1001" },
//       { id: 2, testName: "Glucose", duration: "07:00", seconds: 420, patientId: "P1002" },
//       { id: 3, testName: "Calcium", duration: "01:00", seconds: 60, patientId: "P1003" },
//       { id: 4, testName: "Zinc", duration: "01:00", seconds: 60, patientId: "P1004" },
//     ]);
//   };

//   return (
//     <div className="incubator-page">
//       <div className="incubator-header">
//         <div>
//           <h1 className="incubator-title">Incubator Grid Timers</h1>
//           <p className="incubator-subtitle">
//             Dynamic Slots • Row-major numbering • Locked Test Catalogue
//           </p>
//         </div>

//         <div className="incubator-top-controls">
//           <div className="incubator-counter-wrap">
//             <span className="incubator-counter-label">Rows</span>
//             <input
//               type="number"
//               value={rows}
//               readOnly
//               className="incubator-counter-input"
//             />

//             <span className="incubator-counter-label">Cols</span>
//             <input
//               type="number"
//               min="1"
//               max="7"
//               value={cols}
//               onChange={(e) => {
//                 const value = Number(e.target.value);
//                 if (value >= 1 && value <= 7) {
//                   setCols(value);
//                 }
//               }}
//               className="incubator-counter-input"
//             />
//           </div>

//           <button className="incubator-top-btn" onClick={resetAll}>
//             Reset All
//           </button>

//           <button className="incubator-top-btn" onClick={loadDemoQueue}>
//             Load Demo Queue
//           </button>
//         </div>
//       </div>

//       <div className="incubator-summary-grid">
//         <div className="incubator-panel">
//           <h3 className="incubator-panel-title">Next Action</h3>
//           <p className="incubator-next-action">{nextActionText}</p>

//           {queue.length > 0 && (
//             <button className="incubator-main-btn" onClick={assignNextFromQueue}>
//               Assign Next from Queue
//             </button>
//           )}
//         </div>

//         <div className="incubator-panel">
//           <h3 className="incubator-panel-title">Add to Queue</h3>

//           <select
//             className="incubator-select"
//             value={selectedTest}
//             onChange={(e) => setSelectedTest(e.target.value)}
//           >
//             {LOCKED_TEST_CATALOGUE.map((test) => (
//               <option key={test.name} value={test.name}>
//                 {test.name}
//               </option>
//             ))}
//           </select>

//           <input
//             type="text"
//             placeholder="Patient ID (optional)"
//             value={patientId}
//             onChange={(e) => setPatientId(e.target.value)}
//             className="incubator-input"
//           />

//           <button className="incubator-main-btn" onClick={addToQueue}>
//             Add to Queue ({selectedTestDuration})
//           </button>
//         </div>

//         <div className="incubator-panel">
//           <h3 className="incubator-panel-title">Locked Test Catalogue</h3>
//           <ul className="incubator-catalogue-list">
//             {LOCKED_TEST_CATALOGUE.map((test) => (
//               <li key={test.name}>
//                 {test.name} — {test.duration}
//               </li>
//             ))}
//           </ul>
//         </div>
//       </div>

//       {queue.length > 0 && (
//         <div className="incubator-panel incubator-queue-panel">
//           <h3 className="incubator-panel-title">Queue</h3>
//           <div className="incubator-queue-list">
//             {queue.map((item, index) => (
//               <div key={item.id} className="incubator-queue-item">
//                 <strong>{index + 1}.</strong> {item.testName} — {item.duration}
//                 {item.patientId ? ` | Patient ID: ${item.patientId}` : ""}
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       <div
//         className="incubator-slot-grid"
//         style={{ gridTemplateColumns: `repeat(${cols}, minmax(230px, 1fr))` }}
//       >
//         {slots.map((slot) => (
//           <div key={slot.id} className="incubator-slot-card">
//             <div className="incubator-slot-number">Slot {slot.id}</div>

//             <div
//               className={`incubator-slot-status ${
//                 slot.status === "Completed"
//                   ? "completed"
//                   : slot.status === "Running"
//                   ? "running"
//                   : slot.status === "Paused"
//                   ? "paused"
//                   : ""
//               }`}
//             >
//               {slot.status}
//             </div>

//             <div className="incubator-slot-test">{slot.testName || "—"}</div>

//             <div className="incubator-slot-patient">
//               {slot.patientId ? `Patient ID: ${slot.patientId}` : ""}
//             </div>

//             {slot.testName ? (
//               <div className="incubator-timer-box">
//                 <div className="incubator-timer-label">Timer</div>
//                 <div className="incubator-timer-value">
//                   {formatTime(slot.remainingSeconds)}
//                 </div>
//               </div>
//             ) : null}

//             {!slot.testName ? (
//               <>
//                 {LOCKED_TEST_CATALOGUE.map((test) => (
//                   <button
//                     key={test.name}
//                     className="incubator-slot-btn"
//                     onClick={() => assignQuickTest(slot.id, test.name)}
//                   >
//                     Quick: {test.name}
//                   </button>
//                 ))}

//                 <button
//                   className="incubator-slot-btn incubator-slot-btn-primary"
//                   onClick={() => assignCustomTest(slot.id)}
//                 >
//                   Assign Custom/Test + Patient
//                 </button>
//               </>
//             ) : (
//               <>
//                 {slot.status !== "Completed" && (
//                   <div className="incubator-slot-actions">
//                     {slot.isRunning ? (
//                       <button
//                         className="incubator-slot-btn"
//                         onClick={() => pauseSlot(slot.id)}
//                       >
//                         Pause
//                       </button>
//                     ) : (
//                       <button
//                         className="incubator-slot-btn"
//                         onClick={() => resumeSlot(slot.id)}
//                       >
//                         Resume
//                       </button>
//                     )}
//                   </div>
//                 )}

//                 <button
//                   className="incubator-slot-btn incubator-clear-btn"
//                   onClick={() => clearSlot(slot.id)}
//                 >
//                   Clear Slot
//                 </button>
//               </>
//             )}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }


import React, { useEffect, useMemo, useState } from "react";
import "./IncubatorGrid.css";

const LOCKED_TEST_CATALOGUE = [
  { name: "Cholesterol", duration: "05:00", seconds: 5 * 60 },
  { name: "Glucose", duration: "07:00", seconds: 7 * 60 },
  { name: "Calcium", duration: "01:00", seconds: 1 * 60 },
  { name: "Zinc", duration: "01:00", seconds: 1 * 60 },
  { name: "Triglycerides", duration: "05:00", seconds: 5 * 60 },
  { name: "Uric Acid", duration: "05:00", seconds: 5 * 60 },
  { name: "Creatinine", duration: "05:00", seconds: 5 * 60 },
  { name: "HDL", duration: "05:00", seconds: 5 * 60 },
  { name: "LDL", duration: "05:00", seconds: 5 * 60 },
  { name: "Bilirubin", duration: "05:00", seconds: 5 * 60 },
];

const TEST_PACKAGES = [
  {
    id: "package_1",
    name: "Package 1",
    tests: [
      "Cholesterol",
      "Glucose",
      "Calcium",
      "Zinc",
      "Triglycerides",
      "Uric Acid",
      "Creatinine",
      "HDL",
      "LDL",
      "Bilirubin",
    ],
  },
  {
    id: "package_2",
    name: "Package 2",
    tests: ["Cholesterol", "Glucose"],
  },
  {
    id: "package_3",
    name: "Package 3",
    tests: [
      "Calcium",
      "Zinc",
      "Triglycerides",
      "Uric Acid",
      "Creatinine",
      "HDL",
      "LDL",
    ],
  },
];

const TOTAL_SLOTS = 28;

const createInitialSlots = () =>
  Array.from({ length: TOTAL_SLOTS }, (_, index) => ({
    id: index + 1,
    testName: "",
    patientId: "",
    packageName: "",
    status: "Unassigned",
    durationSeconds: 0,
    remainingSeconds: 0,
    isRunning: false,
    isCompleted: false,
  }));

const getTestByName = (testName) =>
  LOCKED_TEST_CATALOGUE.find((item) => item.name === testName);

const formatTime = (totalSeconds) => {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

export default function IncubatorGrid() {
  const [slots, setSlots] = useState(createInitialSlots());
  const [selectedPackage, setSelectedPackage] = useState("package_1");
  const [patientId, setPatientId] = useState("");
  const [queue, setQueue] = useState([]);
  const [cols, setCols] = useState(4);

  const rows = Math.ceil(TOTAL_SLOTS / cols);

  const selectedPackageInfo = useMemo(() => {
    return TEST_PACKAGES.find((pkg) => pkg.id === selectedPackage);
  }, [selectedPackage]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSlots((prevSlots) =>
        prevSlots.map((slot) => {
          if (!slot.isRunning || slot.remainingSeconds <= 0) {
            return slot;
          }

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

  const addPackageToQueue = () => {
    const selectedPkg = TEST_PACKAGES.find((pkg) => pkg.id === selectedPackage);
    if (!selectedPkg) return;

    if (!patientId.trim()) {
      alert("Please enter Patient ID.");
      return;
    }

    const packageQueueItems = selectedPkg.tests.map((testName, index) => {
      const test = getTestByName(testName);

      return {
        id: `${Date.now()}_${index}_${testName}`,
        packageId: selectedPkg.id,
        packageName: selectedPkg.name,
        testName,
        duration: test?.duration || "00:00",
        seconds: test?.seconds || 0,
        patientId: patientId.trim(),
      };
    });

    setQueue((prev) => [...prev, ...packageQueueItems]);
    setPatientId("");
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

  const assignQuickTest = (slotId, testName) => {
    const test = getTestByName(testName);
    if (!test) return;

    const enteredPatientId = window.prompt("Enter patient ID (optional):") || "";

    setSlots((prev) =>
      prev.map((slot) =>
        slot.id === slotId
          ? {
              ...slot,
              testName,
              patientId: enteredPatientId,
              packageName: "",
              status: "Running",
              durationSeconds: test.seconds,
              remainingSeconds: test.seconds,
              isRunning: true,
              isCompleted: false,
            }
          : slot
      )
    );
  };

  const assignCustomTest = (slotId) => {
    const customTest = window.prompt("Enter test name:");
    if (!customTest) return;

    const customPatientId = window.prompt("Enter patient ID (optional):") || "";
    const customMinutes = window.prompt("Enter timer in minutes:", "5");

    const minutes = Number(customMinutes);
    if (!minutes || minutes <= 0) {
      alert("Please enter valid minutes.");
      return;
    }

    const totalSeconds = Math.floor(minutes * 60);

    setSlots((prev) =>
      prev.map((slot) =>
        slot.id === slotId
          ? {
              ...slot,
              testName: customTest,
              patientId: customPatientId,
              packageName: "Custom",
              status: "Running",
              durationSeconds: totalSeconds,
              remainingSeconds: totalSeconds,
              isRunning: true,
              isCompleted: false,
            }
          : slot
      )
    );
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
    setSlots(createInitialSlots());
    setQueue([]);
    setSelectedPackage("package_1");
    setPatientId("");
    setCols(4);
  };

  const loadDemoQueue = () => {
    const demoItems = [
      {
        id: "demo_1",
        packageId: "package_1",
        packageName: "Package 1",
        testName: "Cholesterol",
        duration: "05:00",
        seconds: 300,
        patientId: "P1001",
      },
      {
        id: "demo_2",
        packageId: "package_1",
        packageName: "Package 1",
        testName: "Glucose",
        duration: "07:00",
        seconds: 420,
        patientId: "P1001",
      },
      {
        id: "demo_3",
        packageId: "package_2",
        packageName: "Package 2",
        testName: "Cholesterol",
        duration: "05:00",
        seconds: 300,
        patientId: "P2001",
      },
      {
        id: "demo_4",
        packageId: "package_3",
        packageName: "Package 3",
        testName: "Calcium",
        duration: "01:00",
        seconds: 60,
        patientId: "P3001",
      },
    ];

    setQueue(demoItems);
  };

  return (
    <div className="incubator-page">
      <div className="incubator-header">
        <div>
          <h1 className="incubator-title">Incubator Grid Timers</h1>
          <p className="incubator-subtitle">
            Dynamic Slots • Row-major numbering • Locked Test Catalogue
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
          <h3 className="incubator-panel-title">Add Package to Queue</h3>

          <select
            className="incubator-select"
            value={selectedPackage}
            onChange={(e) => setSelectedPackage(e.target.value)}
          >
            {TEST_PACKAGES.map((pkg) => (
              <option key={pkg.id} value={pkg.id}>
                {pkg.name} ({pkg.tests.length} tests)
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Patient ID"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            className="incubator-input"
          />

          {selectedPackageInfo && (
            <div className="incubator-package-preview">
              <div className="incubator-package-preview-title">
                {selectedPackageInfo.name} includes {selectedPackageInfo.tests.length} tests
              </div>
              <div className="incubator-package-preview-list">
                {selectedPackageInfo.tests.join(", ")}
              </div>
            </div>
          )}

          <button className="incubator-main-btn" onClick={addPackageToQueue}>
            Add Package to Queue
          </button>
        </div>

        <div className="incubator-panel">
          <h3 className="incubator-panel-title">Locked Test Catalogue</h3>
          <ul className="incubator-catalogue-list">
            {LOCKED_TEST_CATALOGUE.map((test) => (
              <li key={test.name}>
                {test.name} — {test.duration}
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
              {slot.packageName ? `Package: ${slot.packageName}` : ""}
            </div>

            {slot.testName ? (
              <div className="incubator-timer-box">
                <div className="incubator-timer-label">Timer</div>
                <div className="incubator-timer-value">
                  {formatTime(slot.remainingSeconds)}
                </div>
              </div>
            ) : null}

            {!slot.testName ? (
              <>
                {LOCKED_TEST_CATALOGUE.slice(0, 4).map((test) => (
                  <button
                    key={test.name}
                    className="incubator-slot-btn"
                    onClick={() => assignQuickTest(slot.id, test.name)}
                  >
                    Quick: {test.name}
                  </button>
                ))}

                <button
                  className="incubator-slot-btn incubator-slot-btn-primary"
                  onClick={() => assignCustomTest(slot.id)}
                >
                  Assign Custom/Test + Patient
                </button>
              </>
            ) : (
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
            )}
          </div>
        ))}
      </div>
    </div>
  );
}