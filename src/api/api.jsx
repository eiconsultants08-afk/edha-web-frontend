import { get, post,put } from "./http";
import {
  getToken,
  storeToken,
  removeToken,
  checkIfTokenIsExpired,
} from "./token";

import { configuration } from "../shared/utils/configuration";
import { accessTokenType,refreshTokenType } from "../shared/utils/constant";

const environment = "dev";

export const config = configuration[environment];

// Create URL paths
export function getUrl(type, paths = "") {
  
  let path =
    typeof paths === "object" && Array.isArray(paths)
      ? paths.join("/")
      : paths;

  if (type === "") {
    return config.baseUrl + path;
  } else {
    return config.baseUrl + type + "/" + path;
  }
}

// Remove tokens
export function removeAllTokens() {
  removeToken(accessTokenType);
  removeToken(refreshTokenType);
}

// Get valid auth token
export async function getAuthToken() {
  let accessToken = getToken(accessTokenType);

  if (checkIfTokenIsExpired(accessToken)) {

    let refreshToken = getToken(refreshTokenType);

    if (checkIfTokenIsExpired(refreshToken)) {
      removeAllTokens();
      return { isLoginRequired: true };
    }

    const body = { refreshToken };

    const { success, data } = await post(getUrl("auth", "refresh"), body);

    if (success) {
      accessToken = data.accessToken;
      refreshToken = data.refreshToken;

      storeToken(accessTokenType, accessToken);

      if (refreshToken) {
        storeToken(refreshTokenType, refreshToken);
      }

    } else {
      removeAllTokens();
      return { isLoginRequired: true };
    }
  }

  return { isLoginRequired: false, token: accessToken };
}

// LOGIN
export async function login(body) {

  const response = await post(getUrl("auth", "login"), body);

  console.log("LOGIN API RESPONSE:", response);

  if (response && response.data) {

    const accessToken = response.data.accessToken;
    const refreshToken = response.data.refreshToken;

    console.log("AccessToken:", accessToken);
    console.log("RefreshToken:", refreshToken);

    storeToken(accessTokenType, accessToken);
    storeToken(refreshTokenType, refreshToken);

    return {
      success: true,
      message: response.message || "Login successful"
    };

  }

  return {
    success: false,
    message: response.message || "Login failed"
  };
}

// LOGOUT
export async function logout() {

  const { isLoginRequired, token } = await getAuthToken();

  if (isLoginRequired) {
    removeAllTokens();
    return {
      success: false,
      message: "User already logged out",
    };
  }

  const { success, message } = await get(
    getUrl("auth", "logout"),
    token
  );

  if (success) {
    removeAllTokens();
  }

  return {
    success,
    message,
  };
}

//user profile
export async function getUserProfile() {
  const { isLoginRequired, token } = await getAuthToken();
  if (isLoginRequired) {
    removeAllTokens();
    return {
      success: false,
      message: "User is already logged out.",
    };
  }
  return await get(getUrl("user", "profile"), token);
}


/* ---------------- ADMIN APIs ---------------- */

// GET ALL TECHNICIANS
export async function getTechnicians(rows = 10, page = 1) {

  const { isLoginRequired, token } = await getAuthToken();

  if (isLoginRequired) {
    removeAllTokens();
    return { success: false, message: "Login required" };
  }

  return await get(getUrl("admin", `technicians/${rows}/${page}`), token);
}

// CREATE TECHNICIAN
export async function createTechnician(body) {

  const { isLoginRequired, token } = await getAuthToken();

  if (isLoginRequired) {
    removeAllTokens();
    return { success: false, message: "Login required" };
  }

  return await post(getUrl("admin", "add/technician"), body, token);
}

// GET DEVICES
export async function getDevices(rows = 10, page = 1) {

  const { isLoginRequired, token } = await getAuthToken();

  if (isLoginRequired) {
    removeAllTokens();
    return { success: false, message: "Login required" };
  }

  return await get(getUrl("admin", `devices/${rows}/${page}`), token);
}

// GET DEVICE DETAILS
export async function getAdminDevice(device_id) { //getDeviceById previously 

  const { isLoginRequired, token } = await getAuthToken();

  if (isLoginRequired) {
    removeAllTokens();
    return { success: false, message: "Login required" };
  }

  return await get(getUrl("admin", `device/${device_id}`), token);
}

// GET UNASSIGNED DEVICES
export async function getUnassignedDevices(rows = 10, page = 1) {

  const { isLoginRequired, token } = await getAuthToken();

  if (isLoginRequired) {
    removeAllTokens();
    return { success: false, message: "Login required" };
  }

  return await get(getUrl("admin", `devices-not-assign/${rows}/${page}`), token);
}

export async function getAdminAnalyticsCharts(params = {}) {
  const { isLoginRequired, token } = await getAuthToken();

  if (isLoginRequired) {
    removeAllTokens();
    return { success: false, message: "Login required" };
  }

  const query = new URLSearchParams(params).toString();
  const path = query
    ? getUrl("admin", `analytics/charts?${query}`)
    : getUrl("admin", "analytics/charts");

  return await get(path, token);
}

// GET TEST TYPE SESSIONS FOR ADMIN DASHBOARD
export async function getAdminTestTypeSessions(
  testTypeName,
  startDate,
  endDate
) {
  const { isLoginRequired, token } = await getAuthToken();

  if (isLoginRequired) {
    removeAllTokens();
    return { success: false, message: "Login required" };
  }

  const query = new URLSearchParams({
    testTypeName,
    startDate,
    endDate,
  }).toString();

  return await get(getUrl("admin", `analytics/test-type-sessions?${query}`), token);
}

export async function getAdminPatients(rows = 10, page = 1) {
  const { isLoginRequired, token } = await getAuthToken();

  if (isLoginRequired) {
    removeAllTokens();
    return { success: false, message: "Login required" };
  }

  return await get(getUrl("admin", `patients/${rows}/${page}`), token);
}

// GET ADMIN PATIENT BY ID
export async function getPatientByIdAdmin(patient_id) {
  const { isLoginRequired, token } = await getAuthToken();

  if (isLoginRequired) {
    removeAllTokens();
    return { success: false, message: "Login required" };
  }

  return await get(getUrl("admin", `patient/${patient_id}`), token);
}

// ADD ADMIN PATIENT
export async function addAdminPatient(body) {
  const { isLoginRequired, token } = await getAuthToken();

  if (isLoginRequired) {
    removeAllTokens();
    return { success: false, message: "Login required" };
  }

  return await post(getUrl("admin", "add/patient"), body, token);
}

// DOWNLOAD ADMIN EXCEL REPORT
export async function downloadAdminCsvReport(params = {}) {
  const { isLoginRequired, token } = await getAuthToken();

  if (isLoginRequired) {
    removeAllTokens();
    return { success: false, message: "Login required" };
  }

  const query = new URLSearchParams(params).toString();

  const url = query
    ? getUrl("admin", `reports/csv?${query}`)
    : getUrl("admin", "reports/csv");

  return await get(url, token);
}

// DOWNLOAD ADMIN PDF REPORT
export async function downloadAdminPdfReport(params = {}) {
  const { isLoginRequired, token } = await getAuthToken();

  if (isLoginRequired) {
    removeAllTokens();
    return { success: false, message: "Login required" };
  }

  const query = new URLSearchParams(params).toString();

  const url = query
    ? getUrl("admin", `reports/pdf?${query}`)
    : getUrl("admin", "reports/pdf");

  return await get(url, token);
}


/* ---------------- TECHNICIAN APIs ---------------- */

  export async function getAllPatients(rows, page) {

  const { isLoginRequired, token } = await getAuthToken();


  if (isLoginRequired) {
    removeAllTokens();
    return { success: false, message: "Login required" };
  }

  const url = getUrl("technician", `patients/${rows}/${page}`);
  // console.log("Final URL:", url);

  const response = await get(url, token);

  // console.log("Patients API response:", response);

  return response;
}

/* CREATE PATIENT */
export async function addPatient(body) {

  const { isLoginRequired, token } = await getAuthToken();

  if (isLoginRequired) {
    removeAllTokens();
    return { success: false, message: "User is already logged out." };
  }

  return await post(getUrl("technician", "add/patient"), body, token);
}

/* ADD TEST RESULT */
export async function addPatientTestResult(body) {

  const { isLoginRequired, token } = await getAuthToken();

  if (isLoginRequired) {
    removeAllTokens();
    return { success: false, message: "User is already logged out." };
  }

  return await post(getUrl("technician", "patient/add-test"), body, token);
}

/* DEVICE LOOKUP */
export async function getTechnicianDeviceById(device_id) {

  const { isLoginRequired, token } = await getAuthToken();

  if (isLoginRequired) {
    removeAllTokens();
    return { success: false, message: "User is already logged out." };
  }

  return await get(getUrl("technician", ["device", device_id]), token);
}

/* ADD UART TEST RESULT */
export async function saveUartPatientTestResult(body) {
  const { isLoginRequired, token } = await getAuthToken();

  if (isLoginRequired) {
    removeAllTokens();
    return { success: false, message: "User is already logged out." };
  }

  return await post(getUrl("technician", "/uart/test-result"), body, token);
}

/* GET PATIENT BY REFERENCE ID */
export async function getPatientByReferenceId(reference_id) {
  const { isLoginRequired, token } = await getAuthToken();

  if (isLoginRequired) {
    removeAllTokens();
    return { success: false, message: "User is already logged out." };
  }

  return await get(
    getUrl("technician", ["patient", "reference", reference_id]),
    token
  );
}

/* GET PATIENT TEST HISTORY */
export async function getPatientTestHistory(patient_id) {
  const { isLoginRequired, token } = await getAuthToken();

  if (isLoginRequired) {
    removeAllTokens();
    return { success: false, message: "User is already logged out." };
  }

  return await get(
    getUrl("technician", ["patient", patient_id, "test-history"]),
    token
  );
}

export async function getPatientById(patient_id) {
  const { isLoginRequired, token } = await getAuthToken();

  if (isLoginRequired) {
    removeAllTokens();
    return { success: false, message: "User is already logged out." };
  }

  return await get(getUrl("technician", ["patient", patient_id]), token);
}

export async function registerTestSession(body) {
  const { isLoginRequired, token } = await getAuthToken();

  if (isLoginRequired) {
    removeAllTokens();
    return { success: false, message: "User is already logged out." };
  }

  return await post(getUrl("technician", ["patient", "add-test"]), body, token);
}

export async function searchDevice(device_id) {
  const { isLoginRequired, token } = await getAuthToken();

  if (isLoginRequired) {
    removeAllTokens();
    return { success: false, message: "User is already logged out." };
  }

  return await get(getUrl("technician", ["device", "search", device_id]), token);
}

export async function getTestTypes() {
  const { isLoginRequired, token } = await getAuthToken();

  if (isLoginRequired) {
    removeAllTokens();
    return { success: false, message: "User is already logged out." };
  }

  return await get(getUrl("technician", "test-types"), token);
}

export async function getPatientTests(patient_id, rows = 50, page = 1) {
  const { isLoginRequired, token } = await getAuthToken();

  if (isLoginRequired) {
    removeAllTokens();
    return { success: false, message: "User is already logged out." };
  }

  return await get(
    getUrl("technician", ["patient", patient_id, "tests", rows, page]),
    token
  );
}

export async function completeTestSession(history_id, body) {
  const { isLoginRequired, token } = await getAuthToken();

  if (isLoginRequired) {
    removeAllTokens();
    return { success: false, message: "User is already logged out." };
  }

  return await put(
    getUrl("technician", ["session", history_id, "complete"]),
    body,
    token
  );
}

export async function getSessionReport(history_id) {
  const { isLoginRequired, token } = await getAuthToken();

  if (isLoginRequired) {
    removeAllTokens();
    return { success: false, message: "User is already logged out." };
  }

  return await get(
    getUrl("technician", ["session", history_id, "report"]),
    token
  );
}

export async function getTechnicianDetail(technician_id) {
  const { isLoginRequired, token } = await getAuthToken();

  if (isLoginRequired) {
    removeAllTokens();
    return { success: false, message: "Login required" };
  }

  return await get(getUrl("admin", `technician/${technician_id}`), token);
}

export async function assignDeviceToTechnician(device_id, body) {
  const { isLoginRequired, token } = await getAuthToken();

  if (isLoginRequired) {
    removeAllTokens();
    return { success: false, message: "Login required" };
  }

  return await put(getUrl("admin", `device/${device_id}/assign`), body, token);
}

export async function deleteRequest(url, token) {
  try {
    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };
    const res = await axios.delete(url, config);
    return handleResponse(res);
  } catch (error) {
    return handleError(error);
  }
}

export async function removeTechnicianById(technician_id) {
  const { isLoginRequired, token } = await getAuthToken();

  if (isLoginRequired) {
    removeAllTokens();
    return { success: false, message: "Login required" };
  }

  return await deleteRequest(getUrl("admin", `technician/${technician_id}`), token);
}

/* ---------------- SUPER ADMIN APIs ---------------- */

export async function getSuperAdminDashboard() {
  const { isLoginRequired, token } = await getAuthToken();
  if (isLoginRequired) {
    removeAllTokens();
    return { success: false, message: "Login required" };
  }

  return await get(getUrl("superadmin", "dashboard"), token);
}

// Organizations
export async function getSuperAdminOrganizations(rows = 10, page = 1) {
  const { isLoginRequired, token } = await getAuthToken();
  if (isLoginRequired) {
    removeAllTokens();
    return { success: false, message: "Login required" };
  }

  return await get(getUrl("superadmin", `organizations/${rows}/${page}`), token);
}

export async function getSuperAdminOrganizationById(org_id) {
  const { isLoginRequired, token } = await getAuthToken();
  if (isLoginRequired) {
    removeAllTokens();
    return { success: false, message: "Login required" };
  }

  return await get(getUrl("superadmin", `organization/${org_id}`), token);
}

export async function createSuperAdminOrganization(body) {
  const { isLoginRequired, token } = await getAuthToken();
  if (isLoginRequired) {
    removeAllTokens();
    return { success: false, message: "Login required" };
  }

  return await post(getUrl("superadmin", "add/organization"), body, token);
}

export async function updateSuperAdminOrganization(org_id, body) {
  const { isLoginRequired, token } = await getAuthToken();
  if (isLoginRequired) {
    removeAllTokens();
    return { success: false, message: "Login required" };
  }

  return await put(getUrl("superadmin", `organization/${org_id}`), body, token);
}

// Technicians
export async function getSuperAdminTechnicians(rows = 10, page = 1) {
  const { isLoginRequired, token } = await getAuthToken();
  if (isLoginRequired) {
    removeAllTokens();
    return { success: false, message: "Login required" };
  }

  return await get(getUrl("superadmin", `technicians/${rows}/${page}`), token);
}

export async function getSuperAdminTechnicianById(technician_id) {
  const { isLoginRequired, token } = await getAuthToken();
  if (isLoginRequired) {
    removeAllTokens();
    return { success: false, message: "Login required" };
  }

  return await get(getUrl("superadmin", `technician/${technician_id}`), token);
}

export async function createSuperAdminTechnician(body) {
  const { isLoginRequired, token } = await getAuthToken();
  if (isLoginRequired) {
    removeAllTokens();
    return { success: false, message: "Login required" };
  }

  return await post(getUrl("superadmin", "add/technician"), body, token);
}

export async function updateSuperAdminTechnician(technician_id, body) {
  const { isLoginRequired, token } = await getAuthToken();
  if (isLoginRequired) {
    removeAllTokens();
    return { success: false, message: "Login required" };
  }

  return await put(getUrl("superadmin", `technician/${technician_id}`), body, token);
}

// Tests
export async function getSuperAdminTests(rows = 10, page = 1) {
  const { isLoginRequired, token } = await getAuthToken();
  if (isLoginRequired) {
    removeAllTokens();
    return { success: false, message: "Login required" };
  }

  return await get(getUrl("superadmin", `tests/${rows}/${page}`), token);
}

export async function getSuperAdminTestById(test_type_id) {
  const { isLoginRequired, token } = await getAuthToken();
  if (isLoginRequired) {
    removeAllTokens();
    return { success: false, message: "Login required" };
  }

  return await get(getUrl("superadmin", `test/${test_type_id}`), token);
}

export async function updateSuperAdminTest(test_type_id, body) {
  const { isLoginRequired, token } = await getAuthToken();
  if (isLoginRequired) {
    removeAllTokens();
    return { success: false, message: "Login required" };
  }

  return await put(getUrl("superadmin", `test/${test_type_id}`), body, token);
}

export async function getSuperAdminAnalytics() {
  const { isLoginRequired, token } = await getAuthToken();

  if (isLoginRequired) {
    removeAllTokens();
    return { success: false, message: "Login required" };
  }

  return await get(getUrl("superadmin", "analytics"), token);
}

// Plans
export async function getSuperAdminPlans(rows = 10, page = 1) {
  const { isLoginRequired, token } = await getAuthToken();

  if (isLoginRequired) {
    removeAllTokens();
    return { success: false, message: "Login required" };
  }

  return await get(getUrl("superadmin", `plans/${rows}/${page}`), token);
}

export async function getSuperAdminPlanById(plan_id) {
  const { isLoginRequired, token } = await getAuthToken();

  if (isLoginRequired) {
    removeAllTokens();
    return { success: false, message: "Login required" };
  }

  return await get(getUrl("superadmin", `plan/${plan_id}`), token);
}

export async function createSuperAdminPlan(body) {
  const { isLoginRequired, token } = await getAuthToken();

  if (isLoginRequired) {
    removeAllTokens();
    return { success: false, message: "Login required" };
  }

  return await post(getUrl("superadmin", "add/plan"), body, token);
}

export async function updateSuperAdminPlan(plan_id, body) {
  const { isLoginRequired, token } = await getAuthToken();

  if (isLoginRequired) {
    removeAllTokens();
    return { success: false, message: "Login required" };
  }

  return await put(getUrl("superadmin", `plan/${plan_id}`), body, token);
}

// Admins
export async function getSuperAdminAdmins(rows = 10, page = 1) {
  const { isLoginRequired, token } = await getAuthToken();

  if (isLoginRequired) {
    removeAllTokens();
    return { success: false, message: "Login required" };
  }

  return await get(getUrl("superadmin", `admins/${rows}/${page}`), token);
}

export async function getSuperAdminAdminById(admin_id) {
  const { isLoginRequired, token } = await getAuthToken();

  if (isLoginRequired) {
    removeAllTokens();
    return { success: false, message: "Login required" };
  }

  return await get(getUrl("superadmin", `admin/${admin_id}`), token);
}

export async function createSuperAdminAdmin(body) {
  const { isLoginRequired, token } = await getAuthToken();

  if (isLoginRequired) {
    removeAllTokens();
    return { success: false, message: "Login required" };
  }

  return await post(getUrl("superadmin", "add/admin"), body, token);
}

export async function updateSuperAdminAdmin(admin_id, body) {
  const { isLoginRequired, token } = await getAuthToken();

  if (isLoginRequired) {
    removeAllTokens();
    return { success: false, message: "Login required" };
  }

  return await put(getUrl("superadmin", `admin/${admin_id}`), body, token);
}


// Super Admin Devices
export async function getSuperAdminDevices(rows = 10, page = 1) {
  const { isLoginRequired, token } = await getAuthToken();

  if (isLoginRequired) {
    removeAllTokens();
    return { success: false, message: "Login required" };
  }

  return await get(getUrl("superadmin", `devices/${rows}/${page}`), token);
}

export async function getSuperAdminDeviceById(device_id) {
  const { isLoginRequired, token } = await getAuthToken();

  if (isLoginRequired) {
    removeAllTokens();
    return { success: false, message: "Login required" };
  }

  return await get(getUrl("superadmin", `device/${device_id}`), token);
}

export async function createSuperAdminDevice(body) {
  const { isLoginRequired, token } = await getAuthToken();

  if (isLoginRequired) {
    removeAllTokens();
    return { success: false, message: "Login required" };
  }

  return await post(getUrl("superadmin", "add/device"), body, token);
}

export async function updateSuperAdminDevice(device_id, body) {
  const { isLoginRequired, token } = await getAuthToken();

  if (isLoginRequired) {
    removeAllTokens();
    return { success: false, message: "Login required" };
  }

  return await put(getUrl("superadmin", `device/${device_id}`), body, token);
}

export async function addSuperAdminTest(body) {
  const { isLoginRequired, token } = await getAuthToken();

  if (isLoginRequired) {
    removeAllTokens();
    return { success: false, message: "Login required" };
  }

  return await post(getUrl("superadmin", "add/test"), body, token);
}