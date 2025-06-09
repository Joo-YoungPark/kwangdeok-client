const ConfirmModal = ({ message, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-80 p-6 shadow-lg">
        <div className="text-center text-lg font-medium mb-4">{message}</div>
        <div className="flex justify-center gap-4">
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm text-gray-600 bg-gray-200 rounded hover:bg-gray-300"
            >
              취소
            </button>
          )}
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm text-white bg-blue-500 rounded hover:bg-blue-600"
          >
            확인인
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
