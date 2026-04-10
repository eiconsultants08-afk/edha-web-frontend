import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getPatientById } from "../../../../api/api";
import AddTestResult from "./AddTestResult";

export default function PatientDetails(){

  const { patient_id } = useParams();
  const [patient,setPatient] = useState(null);

  useEffect(()=>{

    const loadPatient = async ()=>{

      const res = await getPatientById(patient_id);

      if(res.success){
        setPatient(res.data);
      }

    };

    loadPatient();

  },[patient_id]);

  if(!patient){
    return <div>Loading...</div>;
  }

  return(

    <>
    <div>

      <h2>Patient Details</h2>

      <p><b>Patient ID:</b> {patient.patient_id}</p>
      <p><b>Name:</b> {patient.name}</p>
      <p><b>Age:</b> {patient.age}</p>
      <p><b>Gender:</b> {patient.gender}</p>

    </div>
    <AddTestResult />
</>
  );
}