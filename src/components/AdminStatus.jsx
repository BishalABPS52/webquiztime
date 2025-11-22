import React from 'react';

const AdminStatus = ({ status, message }) => {
  return (
    <div className={`p-4 rounded-lg ${status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
      <p>{message}</p>
    </div>
  );
};

export default AdminStatus;
