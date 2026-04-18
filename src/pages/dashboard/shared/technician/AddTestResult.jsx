// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import {
//   registerTestSession,
//   getTestTypes,
//   getPatientById,
//   getPatientTests,
//   searchDevice,
//   getAllPatients,
//   getSessionReport,
// } from "../../../../api/api";
// import Card from "../../../../components/card/card";
// import TextBox from "../../../../components/input/input";
// import Button from "../../../../components/button/button";
// import { FiCopy } from "react-icons/fi";
// import { toast } from "react-toastify";
// import {
//   resolveStatus,
//   getStatusColors,
//   refRangeLabel,
//   getDisplayValue,
// } from "./resultStatus";
// import "./AddTestResult.css";

// export default function AddTestResult() {
//   const params = useParams();
//   const navigate = useNavigate();
//   const routePatientValue = params.patient_id || params.reference_id;

//   const [loading, setLoading] = useState(false);
//   const [pageLoading, setPageLoading] = useState(false);
//   const [testTypeLoading, setTestTypeLoading] = useState(false);
//   const [deviceLoading, setDeviceLoading] = useState(false);

//   const [resolvedPatientId, setResolvedPatientId] = useState(null);
//   const [patientDetails, setPatientDetails] = useState(null);
//   const [testHistory, setTestHistory] = useState([]);
//   const [testTypes, setTestTypes] = useState([]);
//   const [showAddTestForm, setShowAddTestForm] = useState(false);

//   const [verifiedDevice, setVerifiedDevice] = useState(null);
//   const [deviceVerified, setDeviceVerified] = useState(false);

//   const [sessionData, setSessionData] = useState({
//     test_date: new Date().toISOString().split("T")[0],
//     device_id: "",
//     notes: "",
//   });

//   const [selectedTests, setSelectedTests] = useState([]);

//   const [openSessionId, setOpenSessionId] = useState(null);

//   const toggleSession = (id) => {
//     setOpenSessionId((prev) => (prev === id ? null : id));
//   };

//   useEffect(() => {
//     loadTestTypes();
//   }, []);

//   useEffect(() => {
//     const init = async () => {
//       if (!routePatientValue) return;

//       const patient = await loadPatientAndHistory(routePatientValue);

//       if (patient?.patient_id) {
//         setResolvedPatientId(patient.patient_id);
//       }
//     };

//     init();
//   }, [routePatientValue]);

//   const loadPatientAndHistory = async (routeValue) => {
//     try {
//       setPageLoading(true);

//       let realPatientId = null;
//       let patientData = null;

//       if (!isNaN(routeValue)) {
//         const listRes = await getAllPatients(100, 1);

//         if (listRes?.success) {
//           const rows = Array.isArray(listRes?.data?.rows)
//             ? listRes.data.rows
//             : [];
//           const matched = rows.find(
//             (item) => String(item.patient_code) === String(routeValue),
//           );

//           if (!matched) {
//             setPatientDetails(null);
//             setTestHistory([]);
//             toast.error("Patient not found");
//             return null;
//           }

//           realPatientId = matched.patient_id;
//         } else {
//           setPatientDetails(null);
//           setTestHistory([]);
//           toast.error(listRes?.message || "Failed to fetch patient list");
//           return null;
//         }
//       } else {
//         realPatientId = routeValue;
//       }

//       const detailRes = await getPatientById(realPatientId);

//       if (detailRes?.success && detailRes?.data) {
//         patientData = detailRes.data;
//         setPatientDetails(patientData);
//       } else {
//         setPatientDetails(null);
//         setTestHistory([]);
//         toast.error(detailRes?.message || "Failed to load patient details");
//         return null;
//       }

//       const historyRes = await getPatientTests(realPatientId, 50, 1);

//       if (historyRes?.success) {
//         const history = Array.isArray(historyRes?.data?.rows)
//           ? historyRes.data.rows
//           : Array.isArray(historyRes?.data)
//             ? historyRes.data
//             : [];

//         setTestHistory(history);
//       } else {
//         setTestHistory([]);
//       }

//       return patientData;
//     } catch (error) {
//       console.error("Error loading patient and history:", error);
//       setPatientDetails(null);
//       setTestHistory([]);
//       toast.error("Something went wrong");
//       return null;
//     } finally {
//       setPageLoading(false);
//     }
//   };

//   const loadTestHistory = async (patientId) => {
//     try {
//       const res = await getPatientTests(patientId, 50, 1);

//       const history = Array.isArray(res?.data?.rows)
//         ? res.data.rows
//         : Array.isArray(res?.data)
//           ? res.data
//           : [];

//       setTestHistory(history);
//     } catch (error) {
//       console.error("Error loading test history:", error);
//       setTestHistory([]);
//     }
//   };

//   const loadTestTypes = async () => {
//     try {
//       setTestTypeLoading(true);

//       const res = await getTestTypes();
//       const apiData = Array.isArray(res?.data) ? res.data : [];

//       const options = apiData.map((item) => ({
//         id: item.test_type_id,
//         name: item.name,
//         unit: item.unit,
//         normal_min: item.normal_min,
//         normal_max: item.normal_max,
//         threshold_value: item.threshold_value,
//       }));

//       setTestTypes(options);
//     } catch (error) {
//       console.error("Error loading test types:", error);
//       setTestTypes([]);
//     } finally {
//       setTestTypeLoading(false);
//     }
//   };

//   const handleSessionChange = (e) => {
//     const { name, value } = e.target;

//     setSessionData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));

//     if (name === "device_id") {
//       setDeviceVerified(false);
//       setVerifiedDevice(null);
//     }
//   };

//   const handleVerifyDevice = async () => {
//     if (!sessionData.device_id?.trim()) {
//       toast.error("Please enter Device ID");
//       return;
//     }

//     try {
//       setDeviceLoading(true);

//       const res = await searchDevice(sessionData.device_id.trim());
//       const device = res?.data || null;

//       if (res?.success && device) {
//         setVerifiedDevice(device);
//         setDeviceVerified(true);
//         toast.success("Device verified successfully");
//       } else {
//         setVerifiedDevice(null);
//         setDeviceVerified(false);
//         toast.error(res?.message || "Device not found");
//       }
//     } catch (error) {
//       console.error("Device verification error:", error);
//       setVerifiedDevice(null);
//       setDeviceVerified(false);
//       toast.error("Invalid or unauthorized device");
//     } finally {
//       setDeviceLoading(false);
//     }
//   };

//   const handleTestCheck = (testId) => {
//     setSelectedTests((prev) => {
//       if (prev.includes(testId)) {
//         return prev.filter((id) => id !== testId);
//       }
//       return [...prev, testId];
//     });
//   };

//   const resetForm = () => {
//     setSessionData({
//       test_date: new Date().toISOString().split("T")[0],
//       device_id: "",
//       notes: "",
//     });
//     setSelectedTests([]);
//     setVerifiedDevice(null);
//     setDeviceVerified(false);
//   };

//   const handleCopyReferenceId = async () => {
//     try {
//       const code =
//         patientDetails?.patient_code != null
//           ? String(patientDetails.patient_code).padStart(5, "0")
//           : "";

//       await navigator.clipboard.writeText(code);
//       toast.success("Patient ID copied");
//     } catch (error) {
//       console.error("Copy failed:", error);
//       toast.error("Failed to copy patient ID");
//     }
//   };

//   const handleSubmit = async (e) => {
//     if (e) e.preventDefault();

//     if (!resolvedPatientId) {
//       toast.error("Patient details not loaded");
//       return;
//     }

//     if (!sessionData.test_date) {
//       toast.error("Test date is required");
//       return;
//     }

//     if (!deviceVerified) {
//       toast.error("Please verify Device ID first");
//       return;
//     }

//     if (selectedTests.length === 0) {
//       toast.error("Please select at least one test");
//       return;
//     }

//     const body = {
//       patient_id: resolvedPatientId,
//       test_date: new Date(sessionData.test_date).toISOString(),
//       device_id: sessionData.device_id.trim(),
//       notes: sessionData.notes?.trim() || null,
//       test_type_ids: selectedTests,
//     };

//     try {
//       setLoading(true);

//       const res = await registerTestSession(body);

//       if (res?.success) {
//         toast.success(res?.message || "Test session registered successfully");
//         resetForm();
//         setShowAddTestForm(false);
//         await loadTestHistory(resolvedPatientId);
//       } else {
//         toast.error(res?.message || "Failed to register test session");
//       }
//     } catch (error) {
//       console.error("Register test session error:", error);
//       toast.error("Something went wrong while registering test session");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const formatDate = (dateStr) => {
//     if (!dateStr) return "----";
//     const date = new Date(dateStr);
//     return date.toLocaleDateString("en-GB", {
//       day: "2-digit",
//       month: "short",
//       year: "numeric",
//     });
//   };

//   const formatDateTime = (dateStr) => {
//     if (!dateStr) return "----";
//     const date = new Date(dateStr);
//     return date.toLocaleString("en-GB", {
//       day: "2-digit",
//       month: "short",
//       year: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   };

//   const sortedHistory = [...testHistory].sort(
//     (a, b) => new Date(b.test_date) - new Date(a.test_date),
//   );

//   const pendingSessions = sortedHistory.filter(
//     (item) => item.status === "PENDING",
//   );
//   const completedSessions = sortedHistory.filter(
//     (item) => item.status === "COMPLETED" || !item.status,
//   );

//   const handleDownloadPdf = async (historyId) => {
//     try {
//       const res = await getSessionReport(historyId);

//       const pdfBase64 = res?.data?.pdf_base64;
//       if (!pdfBase64) {
//         toast.error(res?.message || "Failed to download PDF");
//         return;
//       }

//       const byteCharacters = atob(pdfBase64);
//       const byteNumbers = new Array(byteCharacters.length);

//       for (let i = 0; i < byteCharacters.length; i++) {
//         byteNumbers[i] = byteCharacters.charCodeAt(i);
//       }

//       const byteArray = new Uint8Array(byteNumbers);
//       const blob = new Blob([byteArray], { type: "application/pdf" });

//       const url = window.URL.createObjectURL(blob);
//       const link = document.createElement("a");
//       link.href = url;

//       const filePatientId =
//         patientDetails?.patient_code != null
//           ? String(patientDetails.patient_code).padStart(5, "0")
//           : "patient";

//       link.download = `${filePatientId}.pdf`;

//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//       window.URL.revokeObjectURL(url);
//     } catch (error) {
//       console.error("Download PDF error:", error);
//       toast.error("Failed to download PDF");
//     }
//   };

//   const handleDownloadCsv = (session) => {
//     try {
//       const rows = (session.results || []).map((item) => {
//         const tt = item.testType || item || {};
//         const status = resolveStatus(item, tt, patientDetails?.gender);
//         const range = refRangeLabel(tt, patientDetails?.gender);
//         const value = getDisplayValue(item);

//         return {
//           Date: formatDateTime(session.test_date),
//           TestName: tt.name || item.test_name || "Test",
//           Result: value,
//           Unit: tt.unit || item.unit || "-",
//           Range: range || "-",
//           Status: status || "-",
//           Notes: session.notes || "-",
//         };
//       });

//       if (rows.length === 0) {
//         toast.error("No data available for CSV");
//         return;
//       }

//       const headers = Object.keys(rows[0]);

//       const csvContent = [
//         headers.join(","),
//         ...rows.map((row) =>
//           headers
//             .map((header) => {
//               const cell = row[header] ?? "";
//               const escaped = String(cell).replace(/"/g, '""');
//               return `"${escaped}"`;
//             })
//             .join(","),
//         ),
//       ].join("\n");

//       const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
//       const url = window.URL.createObjectURL(blob);

//       const link = document.createElement("a");
//       link.href = url;

//       const filePatientId =
//         patientDetails?.patient_code != null
//           ? String(patientDetails.patient_code).padStart(5, "0")
//           : "patient";

//       link.download = `${filePatientId}.csv`;

//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);

//       window.URL.revokeObjectURL(url);
//     } catch (error) {
//       console.error("CSV download error:", error);
//       toast.error("Failed to download CSV");
//     }
//   };

//   return (
//     <div className="add-test-page">
//       <Card ctype="primary" style={{ padding: "20px", marginBottom: "20px" }}>
//         <h2 className="section-title">Patient Information</h2>

//         {pageLoading ? (
//           <p>Loading patient details...</p>
//         ) : patientDetails ? (
//           <div className="patient-info-grid">
//             <div className="info-box">
//               <span className="info-label">Name</span>
//               <span className="info-value">{patientDetails.name}</span>
//             </div>

//             <div className="info-box">
//               <span className="info-label">Patient ID</span>
//               <div className="patient-id-row">
//                 <span className="info-value">
//                   {patientDetails.patient_code != null
//                     ? String(patientDetails.patient_code).padStart(5, "0")
//                     : "----"}
//                 </span>
//                 <FiCopy
//                   className="copy-icon"
//                   onClick={handleCopyReferenceId}
//                   title="Copy"
//                 />
//               </div>
//             </div>

//             <div className="info-box">
//               <span className="info-label">Gender</span>
//               <span className="info-value">
//                 {patientDetails.gender || "----"}
//               </span>
//             </div>

//             <div className="info-box">
//               <span className="info-label">Date of Birth</span>
//               <span className="info-value">
//                 {formatDate(patientDetails.dob)}
//               </span>
//             </div>

//             <div className="info-box">
//               <span className="info-label">Registered On</span>
//               <span className="info-value">
//                 {formatDateTime(patientDetails.created_at)}
//               </span>
//             </div>

//             <div className="info-box">
//               <span className="info-label">Organization</span>
//               <span className="info-value">
//                 {patientDetails.org_name || "----"}
//               </span>
//             </div>

//             <div className="info-box">
//               <span className="info-label">Email</span>
//               <span className="info-value">{patientDetails.email || "-"}</span>
//             </div>

//             <div className="info-box">
//               <span className="info-label">Address</span>
//               <span className="info-value">
//                 {patientDetails.address || "-"}
//               </span>
//             </div>
//           </div>
//         ) : (
//           <p>No patient details found</p>
//         )}
//       </Card>

//       <div className="history-header">
//         <h2 className="section-title">Test History</h2>

//         <Button
//           btntype="button"
//           btnClass="primary"
//           btnTitle={showAddTestForm ? "Close" : "+ Add Test"}
//           btnClick={() => setShowAddTestForm((prev) => !prev)}
//         />
//       </div>

//       {showAddTestForm && (
//         <Card ctype="primary" style={{ padding: "20px", marginBottom: "20px" }}>
//           <h2 className="section-title">Register Test Session</h2>

//           <div className="session-form-grid">
//             <TextBox
//               label="Test Date"
//               name="test_date"
//               type="date"
//               value={sessionData.test_date}
//               onChange={handleSessionChange}
//               required
//               inputDivClass="add-test-result-field"
//             />

//             <div className="device-verify-row">
//               <TextBox
//                 label="Device ID"
//                 name="device_id"
//                 type="text"
//                 value={sessionData.device_id}
//                 onChange={handleSessionChange}
//                 placeholder="Enter device ID"
//                 inputDivClass="add-test-result-field"
//               />

//               <Button
//                 btntype="button"
//                 btnClass="primary"
//                 btnTitle={deviceLoading ? "Verifying..." : "Verify"}
//                 btnClick={handleVerifyDevice}
//                 disabled={deviceLoading}
//               />
//             </div>
//           </div>

//           {verifiedDevice && (
//             <div className="verified-device-box">
//               <p>
//                 <strong>Device ID:</strong> {verifiedDevice.device_id}
//               </p>
//               <p>
//                 <strong>Model:</strong> {verifiedDevice.model || "----"}
//               </p>
//               <p>
//                 <strong>Status:</strong> {verifiedDevice.status || "----"}
//               </p>
//               <p>
//                 <strong>Firmware:</strong>{" "}
//                 {verifiedDevice.firmware_version || "----"}
//               </p>
//             </div>
//           )}

//           <div className="notes-row">
//             <TextBox
//               label="Session Notes (optional)"
//               name="notes"
//               type="text"
//               value={sessionData.notes}
//               onChange={handleSessionChange}
//               placeholder="Any observations for this session..."
//               inputDivClass="add-test-result-field"
//             />
//           </div>

//           <div
//             className={`measurements-section ${!deviceVerified ? "disabled-section" : ""}`}
//           >
//             <h3>Select Tests</h3>
//             <p>
//               {deviceVerified
//                 ? "Choose tests to be performed in this session."
//                 : "Verify device first to enable test selection."}
//             </p>

//             {testTypeLoading ? (
//               <p>Loading test types...</p>
//             ) : testTypes.length === 0 ? (
//               <p>No test types available</p>
//             ) : deviceVerified ? (
//               <div className="measurement-list">
//                 {testTypes.map((test) => {
//                   const isChecked = selectedTests.includes(test.id);

//                   return (
//                     <div key={test.id} className="measurement-item">
//                       <label
//                         className={`measurement-label ${isChecked ? "selected" : ""}`}
//                       >
//                         <div className="measurement-left">
//                           <input
//                             type="checkbox"
//                             checked={isChecked}
//                             onChange={() => handleTestCheck(test.id)}
//                           />
//                           <span>{test.name}</span>
//                         </div>

//                         <span className="measurement-unit">
//                           {test.unit || ""}
//                         </span>
//                       </label>
//                     </div>
//                   );
//                 })}
//               </div>
//             ) : null}
//           </div>

//           <div className="session-action-buttons">
//             <Button
//               btntype="button"
//               btnClass="secondary"
//               btnTitle="Cancel"
//               btnClick={() => {
//                 resetForm();
//                 setShowAddTestForm(false);
//               }}
//             />

//             <Button
//               btntype="button"
//               btnClass="primary"
//               btnTitle={loading ? "Registering..." : "Register Test Session"}
//               btnClick={handleSubmit}
//               disabled={loading || testTypeLoading || deviceLoading}
//             />
//           </div>
//         </Card>
//       )}

//       <div className="history-list">
//         {testHistory.length === 0 ? (
//           <Card ctype="primary" style={{ padding: "20px" }}>
//             <p>No test history found</p>
//           </Card>
//         ) : (
//           <>
//             {pendingSessions.length > 0 && (
//               <>
//                 <h3 style={{ marginBottom: "12px" }}>Pending Sessions</h3>

//                 {pendingSessions.map((session) => (
//                   <Card
//                     key={session.history_id}
//                     ctype="primary"
//                     style={{ padding: "20px", marginBottom: "20px" }}
//                   >
//                     <div
//                       className="history-session-header"
//                       style={{ marginBottom: "12px" }}
//                     >
//                       <strong>{formatDateTime(session.test_date)}</strong>
//                     </div>

//                     <div style={{ marginBottom: "16px" }}>
//                       <strong>Tests:</strong>{" "}
//                       {(session.results || [])
//                         .map((r) => r.test_name || r.testType?.name || "Test")
//                         .join(", ") || "—"}
//                     </div>

//                     <Button
//                       btntype="button"
//                       btnClass="primary"
//                       btnTitle="Start Test"
//                       btnClick={() =>
//                         navigate(
//                           `/technician/start-test/${session.history_id}`,
//                           {
//                             state: {
//                               session,
//                               patientGender: patientDetails?.gender,
//                             },
//                           },
//                         )
//                       }
//                     />
//                   </Card>
//                 ))}
//               </>
//             )}

//             {completedSessions.map((session) => {
//               const isOpen = openSessionId === session.history_id;

//               return (
//                 <Card
//                   key={session.history_id}
//                   ctype="primary"
//                   style={{
//                     padding: "0px",
//                     marginBottom: "20px",
//                     overflow: "hidden",
//                   }}
//                 >
//                   {/* HEADER (Clickable) */}
//                   <div
//                     className="history-accordion-header"
//                     onClick={() => toggleSession(session.history_id)}
//                   >
//                     <div className="history-accordion-left">
//                       <span>📅</span>
//                       <strong>{formatDateTime(session.test_date)}</strong>
//                     </div>

//                     <div className="history-accordion-right">
//                       <Button
//                         btntype="button"
//                         btnClass="primary"
//                         btnTitle="CSV"
//                         btnClick={(e) => {
//                           e.stopPropagation();
//                           handleDownloadCsv(session);
//                         }}
//                       />

//                       <Button
//                         btntype="button"
//                         btnClass="secondary"
//                         btnTitle="PDF"
//                         btnClick={(e) => {
//                           e.stopPropagation();
//                           handleDownloadPdf(session.history_id);
//                         }}
//                       />

//                       <span className="accordion-arrow">
//                         {isOpen ? "▲" : "▼"}
//                       </span>
//                     </div>
//                   </div>

//                   {/* BODY (Dropdown) */}
//                   {isOpen && (
//                     <div className="history-accordion-body">
//                       {session.notes && (
//                         <div className="history-test-notes">
//                           {session.notes}
//                         </div>
//                       )}

//                       <div className="history-tests">
//                         {(session.results || []).length === 0 ? (
//                           <p className="history-empty-text">
//                             No measurements recorded
//                           </p>
//                         ) : (
//                           <div className="history-table-wrap">
//                             <table className="history-table">
//                               <thead>
//                                 <tr>
//                                   <th>Test Name</th>
//                                   <th>Result</th>
//                                   <th>Unit</th>
//                                   <th>Range</th>
//                                   <th>Status</th>
//                                 </tr>
//                               </thead>

//                               <tbody>
//                                 {(session.results || []).map((item, index) => {
//                                   const tt = item.testType || item || {};
//                                   const status = resolveStatus(
//                                     item,
//                                     tt,
//                                     patientDetails?.gender,
//                                   );
//                                   const colors = getStatusColors(status);
//                                   const range = refRangeLabel(
//                                     tt,
//                                     patientDetails?.gender,
//                                   );
//                                   const value = getDisplayValue(item);

//                                   return (
//                                     <tr key={index}>
//                                       <td>
//                                         {tt.name || item.test_name || "Test"}
//                                       </td>

//                                       <td style={{ color: colors.fg }}>
//                                         {value}
//                                       </td>

//                                       <td>{tt.unit || item.unit || "-"}</td>

//                                       <td>{range || "-"}</td>

//                                       <td>
//                                         {status ? (
//                                           <span
//                                             className="history-status-badge"
//                                             style={{
//                                               background: colors.bg,
//                                               color: colors.fg,
//                                             }}
//                                           >
//                                             {status}
//                                           </span>
//                                         ) : (
//                                           "-"
//                                         )}
//                                       </td>
//                                     </tr>
//                                   );
//                                 })}
//                               </tbody>
//                             </table>
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   )}
//                 </Card>
//               );
//             })}
//           </>
//         )}
//       </div>
//     </div>
//   );
// }

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  registerTestSession,
  getTestTypes,
  getPatientById,
  getPatientTests,
  searchDevice,
  getAllPatients,
  getSessionReport,
} from "../../../../api/api";
import Card from "../../../../components/card/card";
import TextBox from "../../../../components/input/input";
import Button from "../../../../components/button/button";
import { FiCopy } from "react-icons/fi";
import { toast } from "react-toastify";
import {
  resolveStatus,
  getStatusColors,
  refRangeLabel,
  getDisplayValue,
} from "./resultStatus";
import "./AddTestResult.css";

export default function AddTestResult() {
  const params = useParams();
  const navigate = useNavigate();
  const routePatientValue = params.patient_id || params.reference_id;

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [testTypeLoading, setTestTypeLoading] = useState(false);
  const [deviceLoading, setDeviceLoading] = useState(false);

  const [resolvedPatientId, setResolvedPatientId] = useState(null);
  const [patientDetails, setPatientDetails] = useState(null);
  const [testHistory, setTestHistory] = useState([]);
  const [testTypes, setTestTypes] = useState([]);
  const [showAddTestForm, setShowAddTestForm] = useState(false);

  const [verifiedDevice, setVerifiedDevice] = useState(null);
  const [deviceVerified, setDeviceVerified] = useState(false);

  const [sessionData, setSessionData] = useState({
    test_date: new Date().toISOString().split("T")[0],
    device_id: "",
    notes: "",
  });

  const [selectedTests, setSelectedTests] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [openSessionId, setOpenSessionId] = useState(null);

  const toggleSession = (id) => {
    setOpenSessionId((prev) => (prev === id ? null : id));
  };

  useEffect(() => {
    loadTestTypes();
  }, []);

  useEffect(() => {
    const init = async () => {
      if (!routePatientValue) return;

      const patient = await loadPatientAndHistory(routePatientValue);

      if (patient?.patient_id) {
        setResolvedPatientId(patient.patient_id);
      }
    };

    init();
  }, [routePatientValue]);

  const categoryOptions = useMemo(() => {
    return [...new Set(testTypes.map((item) => item.category).filter(Boolean))];
  }, [testTypes]);

  const filteredTests = useMemo(() => {
    if (!selectedCategory) return [];
    return testTypes.filter((item) => item.category === selectedCategory);
  }, [testTypes, selectedCategory]);

  const loadPatientAndHistory = async (routeValue) => {
    try {
      setPageLoading(true);

      let realPatientId = null;
      let patientData = null;

      if (!isNaN(routeValue)) {
        const listRes = await getAllPatients(100, 1);

        if (listRes?.success) {
          const rows = Array.isArray(listRes?.data?.rows)
            ? listRes.data.rows
            : [];
          const matched = rows.find(
            (item) => String(item.patient_code) === String(routeValue),
          );

          if (!matched) {
            setPatientDetails(null);
            setTestHistory([]);
            toast.error("Patient not found");
            return null;
          }

          realPatientId = matched.patient_id;
        } else {
          setPatientDetails(null);
          setTestHistory([]);
          toast.error(listRes?.message || "Failed to fetch patient list");
          return null;
        }
      } else {
        realPatientId = routeValue;
      }

      const detailRes = await getPatientById(realPatientId);

      if (detailRes?.success && detailRes?.data) {
        patientData = detailRes.data;
        setPatientDetails(patientData);
      } else {
        setPatientDetails(null);
        setTestHistory([]);
        toast.error(detailRes?.message || "Failed to load patient details");
        return null;
      }

      const historyRes = await getPatientTests(realPatientId, 50, 1);

      if (historyRes?.success) {
        const history = Array.isArray(historyRes?.data?.rows)
          ? historyRes.data.rows
          : Array.isArray(historyRes?.data)
            ? historyRes.data
            : [];

        setTestHistory(history);
      } else {
        setTestHistory([]);
      }

      return patientData;
    } catch (error) {
      console.error("Error loading patient and history:", error);
      setPatientDetails(null);
      setTestHistory([]);
      toast.error("Something went wrong");
      return null;
    } finally {
      setPageLoading(false);
    }
  };

  const loadTestHistory = async (patientId) => {
    try {
      const res = await getPatientTests(patientId, 50, 1);

      const history = Array.isArray(res?.data?.rows)
        ? res.data.rows
        : Array.isArray(res?.data)
          ? res.data
          : [];

      setTestHistory(history);
    } catch (error) {
      console.error("Error loading test history:", error);
      setTestHistory([]);
    }
  };

  const loadTestTypes = async () => {
    try {
      setTestTypeLoading(true);

      const res = await getTestTypes();
      const apiData = Array.isArray(res?.data) ? res.data : [];

      const options = apiData.map((item) => ({
        id: item.test_type_id,
        name: item.name,
        unit: item.unit,
        normal_min: item.normal_min,
        normal_max: item.normal_max,
        threshold_value: item.threshold_value,
        category: item.category || "Other",
      }));

      setTestTypes(options);

      const firstCategory =
        [...new Set(options.map((item) => item.category).filter(Boolean))][0] ||
        "";

      setSelectedCategory(firstCategory);

      const defaultSelected = options
        .filter((item) => item.category === firstCategory)
        .map((item) => item.id);

      setSelectedTests(defaultSelected);
    } catch (error) {
      console.error("Error loading test types:", error);
      setTestTypes([]);
      setSelectedTests([]);
      setSelectedCategory("");
    } finally {
      setTestTypeLoading(false);
    }
  };

  const handleSessionChange = (e) => {
    const { name, value } = e.target;

    setSessionData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "device_id") {
      setDeviceVerified(false);
      setVerifiedDevice(null);
    }
  };

  const handleVerifyDevice = async () => {
    if (!sessionData.device_id?.trim()) {
      toast.error("Please enter Device ID");
      return;
    }

    try {
      setDeviceLoading(true);

      const res = await searchDevice(sessionData.device_id.trim());
      const device = res?.data || null;

      if (res?.success && device) {
        setVerifiedDevice(device);
        setDeviceVerified(true);

        const firstCategory =
          [
            ...new Set(testTypes.map((item) => item.category).filter(Boolean)),
          ][0] || "";

        setSelectedCategory(firstCategory);

        const defaultSelected = testTypes
          .filter((item) => item.category === firstCategory)
          .map((item) => item.id);

        setSelectedTests(defaultSelected);
        toast.success("Device verified successfully");
      } else {
        setVerifiedDevice(null);
        setDeviceVerified(false);
        toast.error(res?.message || "Device not found");
      }
    } catch (error) {
      console.error("Device verification error:", error);
      setVerifiedDevice(null);
      setDeviceVerified(false);
      toast.error("Invalid or unauthorized device");
    } finally {
      setDeviceLoading(false);
    }
  };

  const handleTestCheck = (testId) => {
    setSelectedTests((prev) => {
      if (prev.includes(testId)) {
        return prev.filter((id) => id !== testId);
      }
      return [...prev, testId];
    });
  };

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setSelectedCategory(category);

    const categoryTestIds = testTypes
      .filter((item) => item.category === category)
      .map((item) => item.id);

    setSelectedTests(categoryTestIds);
  };

  const resetForm = () => {
    const firstCategory =
      [...new Set(testTypes.map((item) => item.category).filter(Boolean))][0] ||
      "";

    setSessionData({
      test_date: new Date().toISOString().split("T")[0],
      device_id: "",
      notes: "",
    });

    setSelectedCategory(firstCategory);

    const defaultSelected = testTypes
      .filter((item) => item.category === firstCategory)
      .map((item) => item.id);

    setSelectedTests(defaultSelected);
    setVerifiedDevice(null);
    setDeviceVerified(false);
  };

  const handleCopyReferenceId = async () => {
    try {
      const code =
        patientDetails?.patient_code != null
          ? String(patientDetails.patient_code).padStart(5, "0")
          : "";

      await navigator.clipboard.writeText(code);
      toast.success("Patient ID copied");
    } catch (error) {
      console.error("Copy failed:", error);
      toast.error("Failed to copy patient ID");
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!resolvedPatientId) {
      toast.error("Patient details not loaded");
      return;
    }

    if (!sessionData.test_date) {
      toast.error("Test date is required");
      return;
    }

    if (!deviceVerified) {
      toast.error("Please verify Device ID first");
      return;
    }

    if (selectedTests.length === 0) {
      toast.error("Please select at least one test");
      return;
    }

    const body = {
      patient_id: resolvedPatientId,
      test_date: new Date(sessionData.test_date).toISOString(),
      device_id: sessionData.device_id.trim(),
      notes: sessionData.notes?.trim() || null,
      category: selectedCategory,
      test_type_ids: selectedTests,
    };

    try {
      setLoading(true);

      const res = await registerTestSession(body);

      if (res?.success) {
        toast.success(res?.message || "Test session registered successfully");
        resetForm();
        setShowAddTestForm(false);
        await loadTestHistory(resolvedPatientId);
      } else {
        toast.error(res?.message || "Failed to register test session");
      }
    } catch (error) {
      console.error("Register test session error:", error);
      toast.error("Something went wrong while registering test session");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "----";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "----";
    const date = new Date(dateStr);
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const sortedHistory = [...testHistory].sort(
    (a, b) => new Date(b.test_date) - new Date(a.test_date),
  );

  const pendingSessions = sortedHistory.filter(
    (item) => item.status === "PENDING",
  );
  const completedSessions = sortedHistory.filter(
    (item) => item.status === "COMPLETED" || !item.status,
  );

  const handleDownloadPdf = async (historyId) => {
    try {
      const res = await getSessionReport(historyId);

      const pdfBase64 = res?.data?.pdf_base64;
      if (!pdfBase64) {
        toast.error(res?.message || "Failed to download PDF");
        return;
      }

      const byteCharacters = atob(pdfBase64);
      const byteNumbers = new Array(byteCharacters.length);

      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/pdf" });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      const filePatientId =
        patientDetails?.patient_code != null
          ? String(patientDetails.patient_code).padStart(5, "0")
          : "patient";

      link.download = `${filePatientId}.pdf`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download PDF error:", error);
      toast.error("Failed to download PDF");
    }
  };

  const handleDownloadCsv = (session) => {
    try {
      const rows = (session.results || []).map((item) => {
        const tt = item.testType || item || {};
        const status = resolveStatus(item, tt, patientDetails?.gender);
        const range = refRangeLabel(tt, patientDetails?.gender);
        const value = getDisplayValue(item);

        return {
          Date: formatDateTime(session.test_date),
          TestName: tt.name || item.test_name || "Test",
          Result: value,
          Unit: tt.unit || item.unit || "-",
          Range: range || "-",
          Status: status || "-",
          Notes: session.notes || "-",
        };
      });

      if (rows.length === 0) {
        toast.error("No data available for CSV");
        return;
      }

      const headers = Object.keys(rows[0]);

      const csvContent = [
        headers.join(","),
        ...rows.map((row) =>
          headers
            .map((header) => {
              const cell = row[header] ?? "";
              const escaped = String(cell).replace(/"/g, '""');
              return `"${escaped}"`;
            })
            .join(","),
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;

      const filePatientId =
        patientDetails?.patient_code != null
          ? String(patientDetails.patient_code).padStart(5, "0")
          : "patient";

      link.download = `${filePatientId}.csv`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("CSV download error:", error);
      toast.error("Failed to download CSV");
    }
  };

  return (
    <div className="add-test-page">
      <Card ctype="primary" style={{ padding: "20px", marginBottom: "20px" }}>
        <h2 className="section-title">Patient Information</h2>

        {pageLoading ? (
          <p>Loading patient details...</p>
        ) : patientDetails ? (
          <div className="patient-info-grid">
            <div className="info-box">
              <span className="info-label">Name</span>
              <span className="info-value">{patientDetails.name}</span>
            </div>

            <div className="info-box">
              <span className="info-label">Patient ID</span>
              <div className="patient-id-row">
                <span className="info-value">
                  {patientDetails.patient_code != null
                    ? String(patientDetails.patient_code).padStart(5, "0")
                    : "----"}
                </span>
                <FiCopy
                  className="copy-icon"
                  onClick={handleCopyReferenceId}
                  title="Copy"
                />
              </div>
            </div>

            <div className="info-box">
              <span className="info-label">Gender</span>
              <span className="info-value">
                {patientDetails.gender || "----"}
              </span>
            </div>

            <div className="info-box">
              <span className="info-label">Date of Birth</span>
              <span className="info-value">
                {formatDate(patientDetails.dob)}
              </span>
            </div>

            <div className="info-box">
              <span className="info-label">Registered On</span>
              <span className="info-value">
                {formatDateTime(patientDetails.created_at)}
              </span>
            </div>

            <div className="info-box">
              <span className="info-label">Organization</span>
              <span className="info-value">
                {patientDetails.org_name || "----"}
              </span>
            </div>

            <div className="info-box">
              <span className="info-label">Email</span>
              <span className="info-value">{patientDetails.email || "-"}</span>
            </div>

            <div className="info-box">
              <span className="info-label">Address</span>
              <span className="info-value">
                {patientDetails.address || "-"}
              </span>
            </div>
          </div>
        ) : (
          <p>No patient details found</p>
        )}
      </Card>

      <div className="history-header">
        <h2 className="section-title">Test History</h2>

        <Button
          btntype="button"
          btnClass="primary"
          btnTitle={showAddTestForm ? "Close" : "+ Add Test"}
          btnClick={() => setShowAddTestForm((prev) => !prev)}
        />
      </div>

      {showAddTestForm && (
        <Card ctype="primary" style={{ padding: "20px", marginBottom: "20px" }}>
          <h2 className="section-title">Register Test Session</h2>

          <div className="session-form-grid">
            <TextBox
              label="Test Date"
              name="test_date"
              type="date"
              value={sessionData.test_date}
              onChange={handleSessionChange}
              required
              inputDivClass="add-test-result-field"
            />

            <div className="device-verify-row">
              <TextBox
                label="Device ID"
                name="device_id"
                type="text"
                value={sessionData.device_id}
                onChange={handleSessionChange}
                placeholder="Enter device ID"
                inputDivClass="add-test-result-field"
              />

              <Button
                btntype="button"
                btnClass="primary"
                btnTitle={deviceLoading ? "Verifying..." : "Verify"}
                btnClick={handleVerifyDevice}
                disabled={deviceLoading}
              />
            </div>
          </div>

          {verifiedDevice && (
            <div className="verified-device-box">
              <p>
                <strong>Device ID:</strong> {verifiedDevice.device_id}
              </p>
              <p>
                <strong>Model:</strong> {verifiedDevice.model || "----"}
              </p>
              <p>
                <strong>Status:</strong> {verifiedDevice.status || "----"}
              </p>
              <p>
                <strong>Firmware:</strong>{" "}
                {verifiedDevice.firmware_version || "----"}
              </p>
            </div>
          )}

          {/* <div className="notes-row">
            <TextBox
              label="Session Notes (optional)"
              name="notes"
              type="text"
              value={sessionData.notes}
              onChange={handleSessionChange}
              placeholder="Any observations for this session..."
              inputDivClass="add-test-result-field"
            />
          </div> */}

          <div
            className={`measurements-section ${!deviceVerified ? "disabled-section" : ""}`}
          >
            <h3>Select Tests</h3>
            <p>
              {deviceVerified
                ? "Choose tests to be performed in this session."
                : "Verify device first to enable test selection."}
            </p>

            {testTypeLoading ? (
              <p>Loading test types...</p>
            ) : testTypes.length === 0 ? (
              <p>No test types available</p>
            ) : deviceVerified ? (
              <>
                <div className="sample-type-dropdown-wrap">
                  <label className="sample-type-label">Category</label>
                  <select
                    className="sample-type-dropdown"
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                  >
                    {categoryOptions.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="measurement-list">
                  {filteredTests.length === 0 ? (
                    <p>No tests available for selected category</p>
                  ) : (
                    filteredTests.map((test) => {
                      const isChecked = selectedTests.includes(test.id);

                      return (
                        <div key={test.id} className="measurement-item">
                          <label
                            className={`measurement-label ${isChecked ? "selected" : ""}`}
                          >
                            <div className="measurement-left">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleTestCheck(test.id)}
                              />
                              <span>{test.name}</span>
                            </div>

                            <span className="measurement-unit">
                              {test.unit || ""}
                            </span>
                          </label>
                        </div>
                      );
                    })
                  )}
                </div>
              </>
            ) : null}
          </div>

          <div className="session-action-buttons">
            <Button
              btntype="button"
              btnClass="secondary"
              btnTitle="Cancel"
              btnClick={() => {
                resetForm();
                setShowAddTestForm(false);
              }}
            />

            <Button
              btntype="button"
              btnClass="primary"
              btnTitle={loading ? "Registering..." : "Register Test Session"}
              btnClick={handleSubmit}
              disabled={loading || testTypeLoading || deviceLoading}
            />
          </div>
        </Card>
      )}

      <div className="history-list">
        {testHistory.length === 0 ? (
          <Card ctype="primary" style={{ padding: "20px" }}>
            <p>No test history found</p>
          </Card>
        ) : (
          <>
            {pendingSessions.length > 0 && (
              <>
                <h3 style={{ marginBottom: "12px" }}>Pending Sessions</h3>

                {pendingSessions.map((session) => (
                  <Card
                    key={session.history_id}
                    ctype="primary"
                    style={{ padding: "20px", marginBottom: "20px" }}
                  >
                    <div
                      className="history-session-header"
                      style={{ marginBottom: "12px" }}
                    >
                      <strong>{formatDateTime(session.test_date)}</strong>
                    </div>

                    <div style={{ marginBottom: "16px" }}>
                      <strong>Tests:</strong>{" "}
                      {(session.results || [])
                        .map((r) => r.test_name || r.testType?.name || "Test")
                        .join(", ") || "—"}
                    </div>

                    <Button
                      btntype="button"
                      btnClass="primary"
                      btnTitle="Start Test"
                      btnClick={() =>
                        navigate(
                          `/technician/start-test/${session.history_id}`,
                          {
                            state: {
                              session,
                              patientGender: patientDetails?.gender,
                            },
                          },
                        )
                      }
                    />
                  </Card>
                ))}
              </>
            )}

            {completedSessions.map((session) => {
              const isOpen = openSessionId === session.history_id;

              return (
                <Card
                  key={session.history_id}
                  ctype="primary"
                  style={{
                    padding: "0px",
                    marginBottom: "20px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    className="history-accordion-header"
                    onClick={() => toggleSession(session.history_id)}
                  >
                    <div className="history-accordion-left">
                      <span>📅</span>
                      <strong>{formatDateTime(session.test_date)}</strong>
                    </div>

                    <div className="history-accordion-right">
                      <Button
                        btntype="button"
                        btnClass="primary"
                        btnTitle="CSV"
                        btnClick={(e) => {
                          e.stopPropagation();
                          handleDownloadCsv(session);
                        }}
                      />

                      <Button
                        btntype="button"
                        btnClass="secondary"
                        btnTitle="PDF"
                        btnClick={(e) => {
                          e.stopPropagation();
                          handleDownloadPdf(session.history_id);
                        }}
                      />

                      <span className="accordion-arrow">
                        {isOpen ? "▲" : "▼"}
                      </span>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="history-accordion-body">
                      {session.notes && (
                        <div className="history-test-notes">
                          {session.notes}
                        </div>
                      )}

                      <div className="history-tests">
                        {(session.results || []).length === 0 ? (
                          <p className="history-empty-text">
                            No measurements recorded
                          </p>
                        ) : (
                          <div className="history-table-wrap">
                            <table className="history-table">
                              <thead>
                                <tr>
                                  <th>Test Name</th>
                                  <th>Result</th>
                                  <th>Unit</th>
                                  <th>Range</th>
                                  <th>Status</th>
                                  <th>Method</th>
                                </tr>
                              </thead>

                              <tbody>
                                {(session.results || []).map((item, index) => {
                                  const tt = item.testType || item || {};
                                  const status = resolveStatus(
                                    item,
                                    tt,
                                    patientDetails?.gender,
                                  );
                                  const colors = getStatusColors(status);
                                  const range = refRangeLabel(
                                    tt,
                                    patientDetails?.gender,
                                  );
                                  const value = getDisplayValue(item);

                                  return (
                                    <tr
                                      key={
                                        item.result_id ||
                                        `${session.history_id}-${index}`
                                      }
                                    >
                                      <td>
                                        {tt.name || item.test_name || "Test"}
                                      </td>

                                      <td style={{ color: colors.fg }}>
                                        {value}
                                      </td>

                                      <td>{tt.unit || item.unit || "-"}</td>

                                      <td>{range || "-"}</td>

                                      <td>
                                        {status ? (
                                          <span
                                            className="history-status-badge"
                                            style={{
                                              background: colors.bg,
                                              color: colors.fg,
                                            }}
                                          >
                                            {status}
                                          </span>
                                        ) : (
                                          "-"
                                        )}
                                      </td>
                                      {/* <td>{item.method || item.method_options || "-"}</td> */}

                                      <td>
                                        {Array.isArray(tt.method_options)
                                          ? tt.method_options.join(", ")
                                          : tt.method_options ||
                                            item.method ||
                                            "-"}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
