import React, { useContext } from "react";
import { Route, Routes } from "react-router-dom";
import Login from "../pages/login/Login";
import Error from "../pages/error/error";
import { AuthContext } from "../context/AuthProvider";
import Technicians from "../pages/dashboard/shared/admin/technicians/Technicians";
import AdminDashboard from "../pages/dashboard/shared/admin/AdminDashboard";
import Devices from "../pages/dashboard/shared/admin/devices/Devices";
import Patients from "../pages/dashboard/shared/technician/Patients";
import PatientDetails from "../pages/dashboard/shared/technician/PatientDetails";
import CreatePatient from "../pages/dashboard/shared/technician/CreatePatient";
import AddTestResult from "../pages/dashboard/shared/technician/AddTestResult";
import UARTConsole from "../pages/dashboard/shared/technician/UARTConsole";
import EditTestResult from "../pages/dashboard/shared/technician/EditTestResult";
import Profile from "../pages/dashboard/shared/technician/Profile";
import TechnicianDetails from "../pages/dashboard/shared/admin/technicians/TechnicianDetails";
import AssignDeviceTechnician from "../pages/dashboard/shared/admin/devices/AssignDeviceTechnician";
import DevicesDetails from "../pages/dashboard/shared/admin/devices/DevicesDetails";
import AdminProfile from "../pages/dashboard/shared/admin/AdminProfile";
import IncubatorGrid from "../pages/dashboard/shared/technician/IncubatorGrid";
import AdminPatients from "../pages/dashboard/shared/admin/patients/Patients";
import AdminPatientDetails from "../pages/dashboard/shared/admin/AdminPatientDetails";
import SuperAdminDashboard from "../pages/dashboard/shared/superadmin/SuperAdminDashboard";
import Organizations from "../pages/dashboard/shared/superadmin/organizations/Organizations";
import Tests from "../pages/dashboard/shared/superadmin/tests/Tests";
import SuperAdminProfile from "../pages/dashboard/shared/superadmin/SuperAdminProfile";
import SuperAdminTechnicians from "../pages/dashboard/shared/superadmin/technicians/Technicians";
import Admins from "../pages/dashboard/shared/superadmin/admins/Admins";
import SuperAdminDevices from "../pages/dashboard/shared/superadmin/devices/SuperAdminDevices";

export default function Routing() {

  const { auth } = useContext(AuthContext);
  const role = auth?.role;

  return (
    <Routes>

      {/* PUBLIC ROUTES */}
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />

      {/* ADMIN ROUTES */}
      {role === "ADMIN" && (
        <>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />

          <Route path="/technicians" element={<Technicians />} />

          <Route
            path="/technician/:technician_id"
            element={<TechnicianDetails />}
          />

          <Route path="/devices" element={<Devices />} />

          <Route path="/device/:device_id" element={<DevicesDetails />} />

          <Route
            path="/devices/assign/:device_id"
            element={<AssignDeviceTechnician />}
          />

          <Route path="/admin/profile" element={<AdminProfile />} />

          <Route path="/patients" element={<AdminPatients />} />

          <Route
            path="/patient/:patient_id"
            element={<AdminPatientDetails />}
          />
        </>
      )}

      {/* TECHNICIAN ROUTES */}
      {role === "TECHNICIAN" && (
        <>

          <Route path="/technician/patients" element={<Patients />} />

          <Route
            path="/technician/patient/:patient_id"
            element={<PatientDetails />}
          />

          <Route
            path="/technician/create-patient"
            element={<CreatePatient />}
          />

          <Route
            path="/technician/add-test-result/:reference_id"
            element={<AddTestResult />}
          />

          <Route
            path="/technician/start-test/:history_id"
            element={<EditTestResult />}
          />

          <Route path="/technician/uart-console" element={<UARTConsole />} />

          <Route path="/technician/profile" element={<Profile />} />

          <Route
            path="/technician/incubator-grid"
            element={<IncubatorGrid />}
          />
        </>
      )}

      {/* SUPER ADMIN ROUTES */}

      {role === "SUPER_ADMIN" && (
        <>
          <Route
            path="/superadmin/dashboard"
            element={<SuperAdminDashboard />}
          />

          <Route path="/superadmin/organizations" element={<Organizations />} />

          <Route
            path="/superadmin/technicians"
            element={<SuperAdminTechnicians />}
          />

          <Route path="/superadmin/tests" element={<Tests />} />

          <Route path="/superadmin/profile" element={<SuperAdminProfile />} />

          <Route path="/superadmin/admins" element={<Admins />} />

          <Route path="/superadmin/devices" element={<SuperAdminDevices />} />
        </>
      )}

      {/* ERROR ROUTE */}
      <Route path="*" element={<Error />} />

    </Routes>
  );
}