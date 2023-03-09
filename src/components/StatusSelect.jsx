import React from "react";

const possibleStatus = [
  { id: "backlog", label: "Backlog" },
  { id: "todo", label: "To-do" },
  { id: "inProgress", label: "In Progress" },
  { id: "done", label: "Done" },
  { id: "cancelled", label: "Cancelled" },
];

const StatusSelect = ({ value, onChange, noEmptyOption = false }) => {
  return (
    <select value={value} onChange={onChange} className="status-select">
      {noEmptyOption ? null : <option value={""}>Select a status</option>}
      {possibleStatus?.map((status) => (
        <option key={status.id} value={status.id}>
          {status.label}
        </option>
      ))}
    </select>
  );
};

export default StatusSelect;
