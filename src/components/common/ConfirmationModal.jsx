import { useState } from "react";

const ConfirmationModal = ({ isOpen, onClose, onConfirm, message, desc, action }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg w-80 sm:w-96 h-44 flex flex-col justify-between">
        <p className="text-center text-gray-800 text-md sm:text-base">{message}</p>
        <p className="text-center text-accent-800 text-sm sm:text-base">{desc}</p>
        <div className="flex justify-between space-x-4">
          <button
            onClick={onClose}
            className="flex-1 text-white bg-accent-400 px-4 py-2 rounded-md hover:bg-gray-400 transition duration-300 text-sm sm:text-base"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-error-400 text-white px-4 py-2 rounded-md hover:bg-red-600 transition duration-300 text-sm sm:text-base"
          >
            {action}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;