// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ReportBox = ({ report, selectedReport, setSelectedReport }: any) => {
  return (
    <div
      key={report.id}
      onClick={() => setSelectedReport(report)}
      className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
        selectedReport?.id === report.id
          ? "bg-primary-50 dark:bg-gray-700 border-l-4 border-primary-600"
          : ""
      }`}
    >
      <h3 className="font-medium text-gray-900 dark:text-white line-clamp-1">
        {report.title}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
        {report.description}
      </p>
    </div>
  );
};

export default ReportBox;
