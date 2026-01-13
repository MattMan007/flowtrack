import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { workflowAPI, taskAPI } from '../services/api';
import CreateTaskModal from '../components/CreateTaskModal';
import TaskCard from '../components/TaskCard';

function WorkflowPage() {
  const { id } = useParams();
  const [workflow, setWorkflow] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [workflowRes, tasksRes] = await Promise.all([
        workflowAPI.getById(id),
        taskAPI.getAll({ workflowId: id, status: 'active' })
      ]);
      setWorkflow(workflowRes.data.data);
      setTasks(tasksRes.data.data);
    } catch (err) {
      setError('Failed to load workflow data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskCreated = () => {
    setShowCreateModal(false);
    fetchData();
  };

  const handleTaskMoved = async (taskId, newStage) => {
    try {
      await taskAPI.updateStage(taskId, newStage);
      fetchData();
    } catch (err) {
      console.error('Failed to move task:', err);
      alert('Failed to move task');
    }
  };

  const handleTaskCompleted = async (taskId) => {
    try {
      await taskAPI.complete(taskId);
      fetchData();
    } catch (err) {
      console.error('Failed to complete task:', err);
      alert('Failed to complete task');
    }
  };

  const getTasksByStage = (stageName) => {
    return tasks.filter(task => task.currentStage === stageName);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Workflow not found</p>
        <Link to="/" className="text-indigo-600 hover:text-indigo-500 mt-4 inline-block">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link to="/" className="hover:text-gray-700">Dashboard</Link>
            <span>/</span>
            <span className="text-gray-900">{workflow.name}</span>
          </div>
          <h1 className="text-3xl font-semibold text-gray-900">{workflow.name}</h1>
          {workflow.description && (
            <p className="mt-2 text-sm text-gray-700">{workflow.description}</p>
          )}
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Create Task
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="mt-8 overflow-x-auto">
        <div className="inline-flex gap-4 pb-4 min-w-full">
          {workflow.stages.sort((a, b) => a.order - b.order).map((stage) => {
            const stageTasks = getTasksByStage(stage.name);
            return (
              <div key={stage.name} className="flex-shrink-0 w-80">
                <div className="bg-gray-100 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">{stage.name}</h3>
                    <span className="bg-gray-200 text-gray-700 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {stageTasks.length}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {stageTasks.length === 0 ? (
                      <div className="text-center py-8 text-sm text-gray-500">
                        No tasks in this stage
                      </div>
                    ) : (
                      stageTasks.map((task) => (
                        <TaskCard
                          key={task._id}
                          task={task}
                          workflow={workflow}
                          onMove={handleTaskMoved}
                          onComplete={handleTaskCompleted}
                        />
                      ))
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showCreateModal && (
        <CreateTaskModal
          workflow={workflow}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleTaskCreated}
        />
      )}
    </div>
  );
}

export default WorkflowPage;

