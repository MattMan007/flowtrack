import { useState, useEffect } from 'react';
import { workflowAPI, analyticsAPI } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

function AnalyticsPage() {
  const [workflows, setWorkflows] = useState([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [stageDuration, setStageDuration] = useState(null);
  const [bottlenecks, setBottlenecks] = useState([]);
  const [tasksCompleted, setTasksCompleted] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWorkflows();
  }, []);

  useEffect(() => {
    if (selectedWorkflow) {
      fetchAnalytics();
    }
  }, [selectedWorkflow]);

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      const response = await workflowAPI.getAll();
      const workflowData = response.data.data;
      setWorkflows(workflowData);
      if (workflowData.length > 0) {
        setSelectedWorkflow(workflowData[0]._id);
      }
    } catch (err) {
      setError('Failed to load workflows');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [durationRes, bottleneckRes, completedRes] = await Promise.all([
        analyticsAPI.getStageDuration(selectedWorkflow),
        analyticsAPI.getBottlenecks(selectedWorkflow),
        analyticsAPI.getTasksCompleted({ groupBy: 'day' })
      ]);

      setStageDuration(durationRes.data.data);
      setBottlenecks(bottleneckRes.data.data);
      setTasksCompleted(completedRes.data.data);
    } catch (err) {
      setError('Failed to load analytics data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatStageDurationData = () => {
    if (!stageDuration) return [];
    return Object.entries(stageDuration).map(([stage, data]) => ({
      stage,
      hours: parseFloat(data.averageHours.toFixed(2)),
      tasks: data.taskCount
    }));
  };

  const formatTasksCompletedData = () => {
    return tasksCompleted.slice(-14).map(item => ({
      date: item.date,
      count: item.count
    }));
  };

  if (loading && workflows.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (workflows.length === 0) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No workflows</h3>
          <p className="mt-1 text-sm text-gray-500">
            Create a workflow to start tracking analytics.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-3xl font-semibold text-gray-900">Analytics</h1>
          <p className="mt-2 text-sm text-gray-700">
            Workflow insights and performance metrics
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <select
            value={selectedWorkflow || ''}
            onChange={(e) => setSelectedWorkflow(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            {workflows.map((workflow) => (
              <option key={workflow._id} value={workflow._id}>
                {workflow.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading analytics...</div>
        </div>
      ) : (
        <div className="mt-8 space-y-8">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Average Time Per Stage
            </h2>
            {formatStageDurationData().length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No data available yet. Tasks need to move through stages to generate analytics.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={formatStageDurationData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="stage" />
                  <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="hours" fill="#4F46E5" name="Average Hours" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Bottleneck Detection
            </h2>
            {bottlenecks.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No bottleneck data available yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead>
                    <tr>
                      <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                        Stage
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Average Duration
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Tasks Processed
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {bottlenecks.map((item, index) => (
                      <tr key={item.stage}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                          {item.stage}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {item.averageHours.toFixed(2)} hours
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {item.taskCount}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          {index === 0 ? (
                            <span className="inline-flex rounded-full bg-red-100 px-2 text-xs font-semibold leading-5 text-red-800">
                              Bottleneck
                            </span>
                          ) : index === 1 ? (
                            <span className="inline-flex rounded-full bg-yellow-100 px-2 text-xs font-semibold leading-5 text-yellow-800">
                              Watch
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
                              Normal
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Tasks Completed Over Time (Last 14 Days)
            </h2>
            {formatTasksCompletedData().length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No completed tasks yet.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={formatTasksCompletedData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#4F46E5" name="Tasks Completed" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AnalyticsPage;

