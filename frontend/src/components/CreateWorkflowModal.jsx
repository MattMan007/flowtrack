import { useState } from 'react';
import { workflowAPI } from '../services/api';

function CreateWorkflowModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    stages: ['']
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleStageChange = (index, value) => {
    const newStages = [...formData.stages];
    newStages[index] = value;
    setFormData({ ...formData, stages: newStages });
  };

  const addStage = () => {
    setFormData({
      ...formData,
      stages: [...formData.stages, '']
    });
  };

  const removeStage = (index) => {
    if (formData.stages.length > 1) {
      const newStages = formData.stages.filter((_, i) => i !== index);
      setFormData({ ...formData, stages: newStages });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const filteredStages = formData.stages.filter(s => s.trim() !== '');
    
    if (filteredStages.length === 0) {
      setError('Please add at least one stage');
      setLoading(false);
      return;
    }

    try {
      await workflowAPI.create({
        name: formData.name,
        description: formData.description,
        stages: filteredStages.map((name, index) => ({ name, order: index }))
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create workflow');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed z-10 inset-0 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Create New Workflow
            </h3>
            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Workflow Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description (optional)
                </label>
                <textarea
                  name="description"
                  id="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stages
                </label>
                {formData.stages.map((stage, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={stage}
                      onChange={(e) => handleStageChange(index, e.target.value)}
                      placeholder={`Stage ${index + 1}`}
                      className="flex-1 block border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                    {formData.stages.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeStage(index)}
                        className="px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addStage}
                  className="mt-2 text-sm text-indigo-600 hover:text-indigo-500"
                >
                  + Add Stage
                </button>
              </div>

              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Workflow'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateWorkflowModal;

