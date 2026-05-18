import { useState, useEffect, useRef } from "react";
import "./UARTConsole.css";
import { saveUartResult } from "../../../../api/api";

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
  const bufferRef = useRef("");

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

      const patientId =
        parsed.patient_id ||
        parsed.patientId ||
        parsed.reference_id ||
        parsed.referenceId;

      const testName =
        parsed.test ||
        parsed.testId ||
        parsed.test_name ||
        parsed["Test Name"] ||
        parsed["test name"];

      const value =
        parsed.val ??
        parsed.value ??
        parsed.value_num ??
        parsed["val"] ??
        parsed["Value"];

      if (!patientId || !testName) {
        return null;
      }

      return {
        id: crypto.randomUUID(),
        patientId: String(patientId),
        test: String(testName).toUpperCase(),
        fullName: parsed["Full Name"] || parsed.fullName || "",
        value,
        unit: parsed.unit || parsed["unit"] || "",
        raw: parsed.raw ?? parsed.raw_value ?? parsed["raw"] ?? null,
        method: parsed.Method || parsed.method || "",
        status: "PENDING",
        error: null,
      };
    } catch (err) {
      return null;
    }
  }

  function addIncomingTest(data) {
    setTests((prev) => [data, ...prev]);

    addLog(
      `Captured: Patient ${data.patientId} | ${data.test} = ${data.value} ${data.unit || ""}`,
    );
  }

  function processIncomingText(text) {
    bufferRef.current += text;

    const lines = bufferRef.current.split(/\r?\n/);
    bufferRef.current = lines.pop() || "";

    lines.forEach((line) => {
      const cleanLine = line.trim();

      if (!cleanLine) return;

      addLog(`JSON => ${cleanLine}`);

      const parsed = normalizePayload(cleanLine);

      if (parsed) {
        addIncomingTest(parsed);
      } else {
        addLog(`Could not parse UART test format: ${cleanLine}`);
      }
    });
  }

  async function handleDone(item) {
    try {
      setTests((prev) =>
        prev.map((t) =>
          t.id === item.id ? { ...t, status: "SAVING", error: null } : t,
        ),
      );

      const response = await saveUartResult({
        patient_id: item.patientId,
        test: item.test,
        val: item.value,
        unit: item.unit,
        raw: item.raw,
      });

      if (
        !response?.success &&
        response?.status !== 200 &&
        response?.status !== 201
      ) {
        throw new Error(response?.message || "Failed to save UART result");
      }

      setTests((prev) =>
        prev.map((t) =>
          t.id === item.id
            ? {
                ...t,
                status: "SAVED",
                result_id: response?.data?.result_id,
                history_id: response?.data?.history_id,
              }
            : t,
        ),
      );

      addLog(`Saved: Patient ${item.patientId} | ${item.test}`);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to save UART result";

      setTests((prev) =>
        prev.map((t) =>
          t.id === item.id
            ? {
                ...t,
                status: "ERROR",
                error: message,
              }
            : t,
        ),
      );

      addLog(`Save failed: ${message}`);
    }
  }

  async function startReading() {
    try {
      readerRef.current = portRef.current.readable.getReader();
      addLog("Reader started");

      const decoder = new TextDecoder();

      while (keepReadingRef.current) {
        const { value, done } = await readerRef.current.read();

        if (done) {
          addLog("Reader closed");
          break;
        }

        if (!value || !value.length) continue;

        const ascii = decoder.decode(value, { stream: true });

        addLog(`ASCII => ${ascii.trim()}`);

        processIncomingText(ascii);
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
        `Port selected | Vendor: ${info.usbVendorId || "N/A"} | Product: ${
          info.usbProductId || "N/A"
        }`,
      );

      const baudRates = [115200];

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
      bufferRef.current = "";
      setConnected(true);

      addLog("Device connected successfully");
      addLog("Waiting for device data...");

      startReading();
    } catch (err) {
      console.error("Serial connection error:", err);
      addLog(
        `Connection failed: ${err?.name || "Error"} - ${
          err?.message || "Unknown error"
        }`,
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
              <th>Test</th>
              <th>Value</th>
              <th>Unit</th>
              <th>Raw</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {tests.length === 0 && (
              <tr>
                <td colSpan="7" className="empty-row">
                  No tests recorded
                </td>
              </tr>
            )}

            {tests.map((test) => (
              <tr key={test.id}>
                <td>{test.patientId}</td>
                <td>{test.test}</td>
                <td>{test.value}</td>
                <td>{test.unit}</td>
                <td>{test.raw ?? "-"}</td>
                <td>
                  <span
                    className={
                      test.status === "SAVED"
                        ? "status-saved"
                        : test.status === "ERROR"
                          ? "status-error"
                          : ""
                    }
                  >
                    {test.status}
                  </span>

                  {test.status === "ERROR" && (
                    <div className="error-text">{test.error}</div>
                  )}
                </td>
                <td>
                  <button
                    className="save-btn"
                    disabled={
                      test.status === "SAVING" || test.status === "SAVED"
                    }
                    onClick={() => handleDone(test)}
                  >
                    {test.status === "SAVING"
                      ? "Saving..."
                      : test.status === "SAVED"
                        ? "Saved"
                        : "DONE"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
