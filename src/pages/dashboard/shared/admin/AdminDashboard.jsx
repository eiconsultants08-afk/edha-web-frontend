import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import {
  getAdminAnalyticsCharts,
  getAdminTestTypeSessions,
} from "../../../../api/api";
import Card from "../../../../components/card/card";
import "./AdminDashboard.css";

const GREEN = "#1A6B40";
const MED_GREEN = "#11865B";
const AMBER = "#A05A00";
const RED = "#B42318";

const PIE_PALETTE = [
  "#1A6B40",
  "#11865B",
  "#2ECC71",
  "#27AE60",
  "#16A085",
  "#F39C12",
  "#E74C3C",
  "#8E44AD",
];

function buildRanges() {
  const now = new Date();
  const ymd = (d) => d.toISOString().split("T")[0];
  const tomorrow = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
  );

  const ranges = [];

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  ranges.push({
    key: "this_month",
    label: "This Month",
    startDate: ymd(monthStart),
    endDate: ymd(monthEnd),
  });

  ranges.push({
    key: "last_30",
    label: "Last 30 Days",
    startDate: ymd(new Date(now - 30 * 864e5)),
    endDate: ymd(tomorrow),
  });

  ranges.push({
    key: "last_7",
    label: "Last 7 Days",
    startDate: ymd(new Date(now - 7 * 864e5)),
    endDate: ymd(tomorrow),
  });

  for (let i = 1; i <= 5; i++) {
    const s = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const e = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

    ranges.push({
      key: `month_${s.getFullYear()}_${s.getMonth()}`,
      label: s.toLocaleString("default", { month: "short", year: "numeric" }),
      startDate: ymd(s),
      endDate: ymd(e),
    });
  }

  return ranges;
}

function SectionCard({ title, children }) {
  return (
    <Card ctype="primary" style={{ padding: "0", overflow: "hidden" }}>
      <div className="analytics-section-header">
        <h3>{title}</h3>
      </div>
      <div className="analytics-section-body">{children}</div>
    </Card>
  );
}

function EmptyState({ message = "No data available for this period" }) {
  return <div className="analytics-empty">{message}</div>;
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="analytics-tooltip">
      <div className="analytics-tooltip-label">{label}</div>
      {payload.map((entry, index) => (
        <div key={index} className="analytics-tooltip-row">
          <span>{entry.name}:</span>
          <strong>{entry.value}</strong>
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const ranges = useMemo(buildRanges, []);
  const [selectedRange, setSelectedRange] = useState(ranges[0]);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionsModal, setSessionsModal] = useState(null);
  const [sessionModalLoading, setSessionModalLoading] = useState(false);

  const loadCharts = async (range) => {
    try {
      setLoading(true);

      const res = await getAdminAnalyticsCharts({
        startDate: range.startDate,
        endDate: range.endDate,
      });

      if (res?.success) {
        setCharts(res.data);
      } else {
        setCharts(null);
      }
    } catch (error) {
      console.error("Analytics load error:", error);
      setCharts(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCharts(selectedRange);
  }, [selectedRange]);

  const openTypeSessions = async (testTypeName) => {
    try {
      setSessionModalLoading(true);
      setSessionsModal({ name: testTypeName, sessions: [] });

      const res = await getAdminTestTypeSessions(
        testTypeName,
        selectedRange.startDate,
        selectedRange.endDate,
      );

      setSessionsModal({
        name: testTypeName,
        sessions: res?.success ? res.data || [] : [],
      });
    } catch (error) {
      console.error("Test type session modal error:", error);
      setSessionsModal({ name: testTypeName, sessions: [] });
    } finally {
      setSessionModalLoading(false);
    }
  };

  const sessionStatusData = useMemo(() => {
    if (!charts?.session_status) return [];
    return [
      {
        name: "Completed",
        value: Number(charts.session_status.completed || 0),
      },
      {
        name: "Pending",
        value: Number(charts.session_status.pending || 0),
      },
    ];
  }, [charts]);

  const dailyTestsData = useMemo(() => {
    return (charts?.daily_tests || []).map((item) => ({
      label: item.label,
      count: Number(item.count || 0),
    }));
  }, [charts]);

  const testsPerDeviceData = useMemo(() => {
    return (charts?.tests_per_device || []).map((item) => ({
      label: item.label,
      count: Number(item.count || 0),
    }));
  }, [charts]);

  const weeklyPatientsData = useMemo(() => {
    return (charts?.weekly_patients || []).map((item) => ({
      label: item.label,
      count: Number(item.count || 0),
    }));
  }, [charts]);

  const technicianActivityData = useMemo(() => {
    return (charts?.technician_activity || []).map((item) => ({
      label: item.label,
      count: Number(item.count || 0),
    }));
  }, [charts]);

  const testTypeDistributionData = useMemo(() => {
    return (charts?.test_type_distribution || []).map((item, index) => ({
      name: item.label,
      value: Number(item.count || 0),
      color: PIE_PALETTE[index % PIE_PALETTE.length],
    }));
  }, [charts]);

  const abnormalRatesData = useMemo(() => {
    return (charts?.abnormal_rates || []).map((item) => {
      const total = Number(item.total || 0);
      const abnormal = Number(item.abnormal || 0);
      const percent = total > 0 ? Math.round((abnormal / total) * 100) : 0;

      return {
        ...item,
        percent,
      };
    });
  }, [charts]);

  if (loading) {
    return <div className="analytics-loading">Loading analytics...</div>;
  }

  return (
    <div className="analytics-page">
      <div className="analytics-topbar">
        <div>
          <h2 className="analytics-title">Analytics Dashboard</h2>
          <p className="analytics-subtitle">
            Overview of testing activity and technician performance
          </p>
        </div>

        <select
          className="analytics-range-select"
          value={selectedRange.key}
          onChange={(e) => {
            const selected = ranges.find((r) => r.key === e.target.value);
            if (selected) setSelectedRange(selected);
          }}
        >
          {ranges.map((range) => (
            <option key={range.key} value={range.key}>
              {range.label}
            </option>
          ))}
        </select>
      </div>

      <div className="analytics-grid">
        <div className="analytics-grid-item">
          <SectionCard title="Daily Test Volume">
            {dailyTestsData.length ? (
              <div className="chart-box">
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={dailyTestsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke={MED_GREEN}
                      strokeWidth={3}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyState />
            )}
          </SectionCard>
        </div>

        <div className="analytics-grid-item">
          <SectionCard title="Session Status">
            {sessionStatusData.some((x) => x.value > 0) ? (
              <div className="chart-box">
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={sessionStatusData}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={90}
                      label
                    >
                      <Cell fill={MED_GREEN} />
                      <Cell fill="#F59E0B" />
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyState />
            )}
          </SectionCard>
        </div>

        <div className="analytics-grid-item">
          <SectionCard title="Tests per Device">
            {testsPerDeviceData.length ? (
              <div className="chart-box">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={testsPerDeviceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="count"
                      fill={MED_GREEN}
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyState />
            )}
          </SectionCard>
        </div>

        <div className="analytics-grid-item">
          <SectionCard title="Test Type Distribution">
            {testTypeDistributionData.length ? (
              <div className="chart-box">
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={testTypeDistributionData}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={90}
                      label
                    >
                      {testTypeDistributionData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>

                <div className="analytics-chip-list">
                  {testTypeDistributionData.map((item, index) => (
                    <button
                      key={index}
                      type="button"
                      className="analytics-chip"
                      onClick={() => openTypeSessions(item.name)}
                    >
                      <span
                        className="analytics-chip-dot"
                        style={{ backgroundColor: item.color }}
                      />
                      {item.name} ({item.value})
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState />
            )}
          </SectionCard>
        </div>

        <div className="analytics-grid-item">
          <SectionCard title="Abnormal Rate by Test Type">
            {abnormalRatesData.length ? (
              <div className="abnormal-list">
                {abnormalRatesData.map((item, index) => (
                  <div key={index} className="abnormal-item">
                    <div className="abnormal-header">
                      <span>{item.label}</span>
                      <strong>{item.percent}%</strong>
                    </div>

                    <div className="abnormal-track">
                      <div
                        className="abnormal-fill"
                        style={{
                          width: `${item.percent}%`,
                          background:
                            item.percent > 50
                              ? RED
                              : item.percent > 25
                                ? AMBER
                                : MED_GREEN,
                        }}
                      />
                    </div>

                    <div className="abnormal-meta">
                      {item.abnormal}/{item.total} abnormal
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState />
            )}
          </SectionCard>
        </div>

        <div className="analytics-grid-item">
          <SectionCard title="New Patients per Week">
            {weeklyPatientsData.length ? (
              <div className="chart-box">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={weeklyPatientsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" fill={GREEN} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyState />
            )}
          </SectionCard>
        </div>

        <div className="analytics-grid-item">
          <SectionCard title="Technician Activity">
            {technicianActivityData.length ? (
              <div className="chart-box">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={technicianActivityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="count"
                      fill={MED_GREEN}
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyState />
            )}
          </SectionCard>
        </div>
      </div>

      {sessionsModal && (
        <div
          className="analytics-modal-backdrop"
          onClick={() => setSessionsModal(null)}
        >
          <div className="analytics-modal" onClick={(e) => e.stopPropagation()}>
            <div className="analytics-modal-header">
              <h3>Sessions — {sessionsModal.name}</h3>
              <button onClick={() => setSessionsModal(null)}>✕</button>
            </div>

            {sessionModalLoading ? (
              <div className="analytics-empty">Loading sessions...</div>
            ) : sessionsModal.sessions?.length ? (
              <div className="analytics-session-list">
                {sessionsModal.sessions.map((item) => (
                  <div key={item.history_id} className="analytics-session-item">
                    <div>
                      <div className="analytics-session-patient">
                        {item.patient_name}
                      </div>
                      <div className="analytics-session-tech">
                        {item.technician_name}
                      </div>
                    </div>

                    <div className="analytics-session-right">
                      <div>
                        {new Date(item.test_date).toLocaleDateString("en-IN")}
                      </div>
                      <span className="analytics-session-status">
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message="No sessions found for this period" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
