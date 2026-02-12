// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ReportBox = ({ report, selectedReport, setSelectedReport }: any) => {
  const isSelected = selectedReport?.id === report.id;

  return (
    <div
      key={report.id}
      onClick={() => setSelectedReport(report)}
      className={`p-4 cursor-pointer transition-colors rounded-md ${
        isSelected
          ? "bg-primary-100 dark:bg-primary-500/15 border-l-4 border-b-0 border-primary-700 dark:border-primary-400 shadow-sm"
          : "hover:bg-gray-50 dark:hover:bg-gray-700"
      }`}
    >
      <h3
        className={`text-gray-900 dark:text-white line-clamp-1 ${
          isSelected ? "font-semibold" : "font-medium"
        }`}
      >
        {report.title}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
        {report.description}
      </p>
    </div>
  );
};

export default ReportBox;