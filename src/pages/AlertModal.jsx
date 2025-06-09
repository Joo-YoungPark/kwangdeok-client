import React from "react";
const AlertModal = ({
  message,
  onConfirm,
  onCancel,
  confirmText = "확인",
  cancelText = "취소",
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-80 p-6 shadow-lg">
        <div className="text-lg font-semibold mb-4 text-center">알림</div>
        <div className="text-center text-md font-semibold mb-4">{message}</div>
        <div className="flex justify-center gap-4">
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 text-[16px] font-bold text-gray-600 bg-gray-200 rounded hover:bg-gray-300"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-[16px] font-bold  text-white bg-blue-500 rounded hover:bg-blue-600"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
export default AlertModal;
