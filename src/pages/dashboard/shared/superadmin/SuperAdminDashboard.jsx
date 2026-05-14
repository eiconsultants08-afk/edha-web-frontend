import React, { useEffect, useState } from "react";
import "./SuperAdminDashboard.css";

import {
  getSuperAdminDashboard,
  getSuperAdminAnalytics,
} from "../../../../api/api";

import Chart from "react-apexcharts";

export default function SuperAdminDashboard() {
  const [data, setData] = useState({});
  const [analytics, setAnalytics] = useState({});
  const [detailsModal, setDetailsModal] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    const dashboardRes = await getSuperAdminDashboard();
    if (dashboardRes.success) {
      setData(dashboardRes.data || {});
    }

    const analyticsRes = await getSuperAdminAnalytics();
    if (analyticsRes.success) {
      setAnalytics(analyticsRes.data || {});
    }
  }

  function openDetails(title, total, tests) {
    setDetailsModal({
      title,
      total,
      tests: tests || [],
    });
  }

  const makeBarOptions = (categories) => ({
    chart: {
      toolbar: { show: false },
    },
    colors: ["#0b9444"],
    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        type: "vertical",
        shadeIntensity: 0.4,
        opacityFrom: 0.95,
        opacityTo: 0.65,
        stops: [0, 100],
      },
    },
    plotOptions: {
      bar: {
        borderRadius: 8,
        columnWidth: "50%",
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories,
    },
  });

  const makeHorizontalBarOptions = (categories) => ({
    chart: {
      toolbar: { show: false },
    },
    colors: ["#0b9444"],
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 6,
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories,
    },
    tooltip: {
      y: {
        formatter: (value) => `${value} tests`,
      },
    },
    grid: {
      borderColor: "#e5e7eb",
    },
  });

  const makePieOptions = (labels) => ({
    labels,
    legend: {
      position: "bottom",
    },
    dataLabels: {
      enabled: true,
    },
    chart: {
      toolbar: { show: false },
    },
  });

  const makeLineOptions = (categories) => ({
    chart: {
      toolbar: { show: false },
    },
    colors: ["#0b9444"],
    stroke: {
      curve: "smooth",
      width: 3,
    },
    markers: {
      size: 4,
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories,
    },
    grid: {
      borderColor: "#e5e7eb",
    },
  });

  const getLabels = (items = []) => items.map((item) => item.name);
  const getCounts = (items = []) =>
    items.map((item) => Number(item.count || 0));

  return (
    <div className="superadmin-page">
      <h2 className="superadmin-title">Super Admin Dashboard</h2>

      <div className="superadmin-cards">
        <div className="superadmin-card">
          <h3>Total Organizations</h3>
          <p>{data.total_organizations || 0}</p>
        </div>

        <div className="superadmin-card">
          <h3>Total Devices</h3>
          <p>{data.total_devices || 0}</p>
        </div>

        <div className="superadmin-card">
          <h3>Total Technicians</h3>
          <p>{data.total_technicians || 0}</p>
        </div>

        <div className="superadmin-card">
          <h3>Total Tests</h3>
          <p>{data.total_tests || 0}</p>
        </div>

        <div className="superadmin-card">
          <h3>Total Patients</h3>
          <p>{data.total_patients || 0}</p>
        </div>
      </div>

      <div className="dashboard-charts">
        <div className="chart-card">
          <h3>Most Used Devices</h3>
          <Chart
            type="bar"
            height={320}
            options={{
              ...makeHorizontalBarOptions(
                getLabels(analytics.mostUsedDevices || []),
              ),
              chart: {
                toolbar: { show: false },
                events: {
                  dataPointSelection: function (event, chartContext, config) {
                    const item = (analytics.mostUsedDevices || [])[
                      config.dataPointIndex
                    ];
                    openDetails(item?.name, item?.count, item?.tests);
                  },
                },
              },
            }}
            series={[
              {
                name: "Tests",
                data: getCounts(analytics.mostUsedDevices || []),
              },
            ]}
          />
        </div>

        <div className="chart-card">
          <h3>Most Performed Tests</h3>
          <Chart
            type="bar"
            height={320}
            options={makeBarOptions(
              getLabels(analytics.mostPerformedTests || []),
            )}
            series={[
              {
                name: "Performed",
                data: getCounts(analytics.mostPerformedTests || []),
              },
            ]}
          />
        </div>

        <div className="chart-card">
          <h3>Organization by Tests</h3>
          <Chart
            type="bar"
            height={320}
            options={{
              ...makeBarOptions(
                getLabels(analytics.organizationActivity || []),
              ),
              chart: {
                toolbar: { show: false },
                events: {
                  dataPointSelection: function (event, chartContext, config) {
                    const item = (analytics.organizationActivity || [])[
                      config.dataPointIndex
                    ];
                    openDetails(item?.name, item?.count, item?.tests);
                  },
                },
              },
            }}
            series={[
              {
                name: "Tests",
                data: getCounts(analytics.organizationActivity || []),
              },
            ]}
          />
        </div>

        <div className="chart-card">
          <h3>Organization by Patients</h3>
          <Chart
            type="bar"
            height={320}
            options={makeBarOptions(
              getLabels(analytics.organizationPatients || []),
            )}
            series={[
              {
                name: "Patients",
                data: getCounts(analytics.organizationPatients || []),
              },
            ]}
          />
        </div>

        <div className="chart-card">
          <h3>Monthly Test Trend</h3>
          <Chart
            type="area"
            height={320}
            options={makeLineOptions(
              getLabels(analytics.monthlyTestTrend || []),
            )}
            series={[
              {
                name: "Tests",
                data: getCounts(analytics.monthlyTestTrend || []),
              },
            ]}
          />
        </div>

        <div className="chart-card">
          <h3>Test Category Breakdown</h3>
          <Chart
            type="donut"
            height={320}
            options={makePieOptions(
              getLabels(analytics.testCategoryBreakdown || []),
            )}
            series={getCounts(analytics.testCategoryBreakdown || [])}
          />
        </div>

        <div className="chart-card">
          <h3>Organization-wise Activity</h3>
          <Chart
            type="pie"
            height={320}
            options={makePieOptions(
              getLabels(analytics.organizationActivity || []),
            )}
            series={getCounts(analytics.organizationActivity || [])}
          />
        </div>

        <div className="chart-card">
          <h3>Test Completion Rate</h3>
          <Chart
            type="donut"
            height={320}
            options={makePieOptions(
              getLabels(analytics.testCompletionRate || []),
            )}
            series={getCounts(analytics.testCompletionRate || [])}
          />
        </div>

        <div className="chart-card">
          <h3>Gender-wise Patient Analysis</h3>
          <Chart
            type="donut"
            height={320}
            options={makePieOptions(getLabels(analytics.genderAnalysis || []))}
            series={getCounts(analytics.genderAnalysis || [])}
          />
        </div>
      </div>

      {detailsModal && (
        <div className="analytics-modal-overlay">
          <div className="analytics-modal">
            <div className="analytics-modal-header">
              <div>
                <h3>{detailsModal.title}</h3>
                <p>Total Tests: {detailsModal.total || 0}</p>
              </div>

              <button onClick={() => setDetailsModal(null)}>×</button>
            </div>

            <div className="analytics-modal-body">
              {detailsModal.tests.length === 0 ? (
                <p>No test details</p>
              ) : (
                detailsModal.tests.map((item, index) => (
                  <div className="analytics-modal-row" key={index}>
                    <span>{item.test_name}</span>
                    <strong>{item.test_count}</strong>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}