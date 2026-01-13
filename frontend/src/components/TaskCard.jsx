import { useState } from 'react';

function TaskCard({ task, workflow, onMove, onComplete }) {
  const [showMoveMenu, setShowMoveMenu] = useState(false);

  const availableStages = workflow.stages.filter(s => s.name !== task.currentStage);

  const handleMove = (newStage) => {
    onMove(task._id, newStage);
    setShowMoveMenu(false);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <h4 className="font-medium text-gray-900 flex-1">{task.title}</h4>
        <button
          onClick={() => setShowMoveMenu(!showMoveMenu)}
          className="text-gray-400 hover:text-gray-600"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
      </div>

      {task.description && (
        <p className="mt-2 text-sm text-gray-600 line-clamp-3">{task.description}</p>
      )}

      <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
        <span>By {task.createdBy?.name}</span>
        <span>{new Date(task.createdAt).toLocaleDateString()}</span>
      </div>

      {showMoveMenu && (
        <div className="mt-3 border-t pt-3">
          <p className="text-xs font-medium text-gray-700 mb-2">Move to:</p>
          <div className="space-y-1">
            {availableStages.map((stage) => (
              <button
                key={stage.name}
                onClick={() => handleMove(stage.name)}
                className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded"
              >
                {stage.name}
              </button>
            ))}
            <button
              onClick={() => onComplete(task._id)}
              className="w-full text-left px-3 py-1.5 text-sm text-green-700 hover:bg-green-50 rounded font-medium"
            >
              Mark as Complete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TaskCard;

