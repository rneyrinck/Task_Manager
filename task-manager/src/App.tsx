import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Task {
  _id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  dueDate: string;
}

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch tasks from the backend
  useEffect(() => {
    axios.get('http://localhost:5000/api/tasks')
      .then((response) => {
        setTasks(response.data);
      })
      .catch((err) => {
        setError('Failed to fetch tasks');
        console.error(err);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold text-center mb-4">Task Manager</h1>
      {error && <p className="text-red-500 text-center">{error}</p>}
      <div className="max-w-3xl mx-auto bg-white p-4 shadow-md rounded">
        {tasks.length === 0 ? (
          <p className="text-center text-gray-500">No tasks available</p>
        ) : (
          <ul>
            {tasks.map((task) => (
              <li key={task._id} className="border-b py-2">
                <h2 className="font-bold">{task.title}</h2>
                <p>{task.description}</p>
                <p className="text-sm text-gray-500">
                  Priority: {task.priority} | Status: {task.status} | Due: {new Date(task.dueDate).toLocaleDateString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default App;
