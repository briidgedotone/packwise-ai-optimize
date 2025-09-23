import { InformationCircleIcon } from '@heroicons/react/24/outline';

interface CSVColumn {
  name: string;
  description?: string;
}

interface CSVFormatGuideProps {
  title: string;
  description: string;
  columns: CSVColumn[];
  sampleData: Record<string, string | number>[];
  className?: string;
}

export const CSVFormatGuide = ({
  title,
  description,
  columns,
  sampleData,
  className = ""
}: CSVFormatGuideProps) => {
  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-3 mb-3">
        <InformationCircleIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="font-semibold text-blue-900 mb-1">{title}</h3>
          <p className="text-blue-700 text-sm">{description}</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border border-blue-200 rounded-md bg-white text-sm">
          <thead className="bg-blue-100">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className="px-3 py-2 text-left font-medium text-blue-900 border-r border-blue-200 last:border-r-0"
                >
                  {column.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sampleData.map((row, rowIndex) => (
              <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-blue-25'}>
                {columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className="px-3 py-2 text-gray-900 border-r border-blue-200 last:border-r-0"
                  >
                    {row[column.name]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};