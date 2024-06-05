const FailedTaskCard = ({ tasks }) => {
  return (
    <ul role="list" className="space-y-5 mt-8">
      {tasks.map((task) => (
        <li
          key={task.id}
          className="overflow-hidden rounded-md bg-white px-6 py-4 shadow"
        >
          <div>
            <h3 className="text-lg font-semibold">{task.task}</h3>
            <p className="text-sm text-gray-500">Role: {task.role}</p>
            <p className="text-sm text-gray-500">
              Start: {task.start} | End: {task.end}
            </p>
            <pre className="mt-2 text-sm text-gray-800 whitespace-pre-wrap">
              {task.stdout}
            </pre>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default FailedTaskCard;
