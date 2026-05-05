import { useState, useEffect, useRef } from "react";
import "./UARTConsole.css";
// import { addUartTestResult } from "../../../../api/api";

export default function UARTConsole() {
  const consoleRef = useRef(null);

  const [consoleLogs, setConsoleLogs] = useState([
    "UART Console Ready",
    "Click CONNECT to start",
  ]);

  const [tests, setTests] = useState([]);
  const [connected, setConnected] = useState(false);

  const portRef = useRef(null);
  const readerRef = useRef(null);
  const keepReadingRef = useRef(false);

  function addLog(message) {
    setConsoleLogs((prev) => [...prev, message]);
  }

  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [consoleLogs]);

  function clearConsole() {
    setConsoleLogs(["UART Console cleared"]);
  }

  function normalizePayload(line) {
    try {
      const parsed = JSON.parse(line);

      return {
        patientId:
          parsed.patient_id ||
          parsed.patientId ||
          parsed.reference_id ||
          parsed.referenceId,
        testId: parsed.test || parsed.testId,
        value: parsed.val ?? parsed.value,
        unit: parsed.unit || "",
        raw: parsed.raw ?? null,
      };
    } catch (err) {
      return null;
    }
  }

  async function saveIncomingTest(data) {
    try {
      const body = {
        patient_id: data.patientId,
        test_id: String(data.testId).toUpperCase(),
        value: data.value,
        unit: data.unit,
        raw_value: data.raw,
      };

      const response = await addUartTestResult(body);
      const success = response?.success;

      setTests((prev) => [
        {
          patientId: data.patientId,
          testId: String(data.testId).toUpperCase(),
          value: data.value,
          unit: data.unit,
          raw: data.raw,
          status: success ? "Saved" : "Failed",
        },
        ...prev,
      ]);

      if (success) {
        addLog(
          `Saved: Patient ${data.patientId} | ${String(data.testId).toUpperCase()} = ${data.value} ${data.unit || ""}`,
        );
      } else {
        addLog(
          `Save failed: Patient ${data.patientId} | ${String(data.testId).toUpperCase()}`,
        );
      }
    } catch (err) {
      console.error("Save error:", err);

      setTests((prev) => [
        {
          patientId: data.patientId,
          testId: String(data.testId).toUpperCase(),
          value: data.value,
          unit: data.unit,
          raw: data.raw,
          status: "Failed",
        },
        ...prev,
      ]);

      addLog(
        `Error saving: Patient ${data.patientId} | ${String(data.testId).toUpperCase()}`,
      );
    }
  }

  async function startReading() {
  try {
    readerRef.current = portRef.current.readable.getReader();
    addLog("Reader started");

    while (keepReadingRef.current) {
      const { value, done } = await readerRef.current.read();

      if (done) {
        addLog("Reader closed");
        break;
      }

      if (!value || !value.length) continue;

      // value is Uint8Array
      const hex = Array.from(value)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join(" ");

      const ascii = Array.from(value)
        .map((b) => (b >= 32 && b <= 126 ? String.fromCharCode(b) : "."))
        .join("");

      // addLog(`BYTES => ${hex}`);
      addLog(`ASCII => ${ascii}`);
    }
  } catch (err) {
    console.error("Read error:", err);
    addLog(`Read error: ${err?.message || "Unknown error"}`);
  } finally {
    try {
      if (readerRef.current) {
        readerRef.current.releaseLock();
        readerRef.current = null;
      }
    } catch (err) {
      console.error("Release lock error:", err);
    }
  }
}

  async function connectDevice() {
    try {
      if (!("serial" in navigator)) {
        addLog("Web Serial API not supported in this browser");
        return;
      }

      addLog("Requesting serial port access...");

      const port = await navigator.serial.requestPort();
      const info = port.getInfo();

      addLog(
        `Port selected | Vendor: ${info.usbVendorId || "N/A"} | Product: ${info.usbProductId || "N/A"}`,
      );

      // const baudRates = [9600, 115200, 57600, 38400]; //115200 use this
      const baudRates = [115200]

      let opened = false;
      let lastError = null;

      for (const baudRate of baudRates) {
        try {
          addLog(`Trying baud rate: ${baudRate}`);

          await port.open({
            baudRate,
            dataBits: 8,
            stopBits: 1,
            parity: "none",
            flowControl: "none",
          });

          addLog(`Port opened successfully at ${baudRate}`);
          opened = true;
          break;
        } catch (err) {
          lastError = err;
          addLog(`Failed at ${baudRate}: ${err?.message || "Unknown error"}`);
        }
      }

      if (!opened) {
        throw lastError || new Error("Could not open serial port");
      }

      portRef.current = port;
      keepReadingRef.current = true;
      setConnected(true);

      addLog("Device connected successfully");
      addLog("Waiting for device data...");

      startReading();
    } catch (err) {
      console.error("Serial connection error:", err);
      addLog(
        `Connection failed: ${err?.name || "Error"} - ${err?.message || "Unknown error"}`,
      );
      setConnected(false);
      keepReadingRef.current = false;
    }
  }

  async function disconnectDevice() {
    try {
      keepReadingRef.current = false;

      if (readerRef.current) {
        try {
          await readerRef.current.cancel();
        } catch (err) {
          console.error("Reader cancel error:", err);
        }

        try {
          readerRef.current.releaseLock();
        } catch (err) {
          console.error("Release lock error:", err);
        }

        readerRef.current = null;
      }

      if (portRef.current) {
        try {
          await portRef.current.close();
        } catch (err) {
          console.error("Port close error:", err);
        }
        portRef.current = null;
      }

      setConnected(false);
      addLog("Device disconnected");
    } catch (err) {
      console.error("Disconnect error:", err);
      addLog(`Disconnect error: ${err?.message || "Unknown error"}`);
    }
  }

  useEffect(() => {
    return () => {
      disconnectDevice();
    };
  }, []);

  return (
    <div className="uart-container">
      <h2>UART Console</h2>

      <div className="uart-buttons">
        <button
          className="connect-btn"
          onClick={connected ? disconnectDevice : connectDevice}
        >
          {connected ? "Disconnect Device" : "Connect Device"}
        </button>

        <button className="clear-btn" onClick={clearConsole}>
          Clear
        </button>
      </div>

      <div className="uart-console" ref={consoleRef}>
        {consoleLogs.map((log, index) => (
          <div key={index}>{log}</div>
        ))}
      </div>

      <div className="uart-table">
        <h3>Captured Tests</h3>

        <table>
          <thead>
            <tr>
              <th>Patient ID</th>
              <th>Test ID</th>
              <th>Value</th>
              <th>Unit</th>
              <th>Raw</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {tests.length === 0 && (
              <tr>
                <td colSpan="6" className="empty-row">
                  No tests recorded
                </td>
              </tr>
            )}

            {tests.map((test, index) => (
              <tr key={index}>
                <td>{test.patientId}</td>
                <td>{test.testId}</td>
                <td>{test.value}</td>
                <td>{test.unit}</td>
                <td>{test.raw ?? "-"}</td>
                <td>{test.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
