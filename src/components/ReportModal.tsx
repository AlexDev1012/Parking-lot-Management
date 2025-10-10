const ReportModal = ({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay background */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-10"
        onClick={onClose}
      />

      {/* Modal - adjusted width and height */}
      <div
        className="fixed bg-white z-20 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
        drop-shadow-xl rounded-lg w-[90%] max-w-2xl h-[50%] max-h-[80vh] overflow-y-auto"
      >
        <div className="flex flex-col p-8 h-full">
          {/* Header with close button */}
          <div className="flex justify-end mb-4">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
              aria-label="Close modal"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex flex-1 flex-col text-gray-800">{children}</div>
        </div>
      </div>
    </>
  );
};

export default ReportModal;
