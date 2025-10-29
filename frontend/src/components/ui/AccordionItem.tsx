import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

interface AccordionItemProps {
  question: string;
  answer: string;
  number: number;
}

const AccordionItem: React.FC<AccordionItemProps> = ({
  question,
  answer,
  number,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        className="flex items-center gap-4 w-full py-5 text-left font-semibold text-gray-900 hover:text-primary-600 transition-colors duration-200 hover:cursor-pointer group"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-sm group-hover:bg-primary-600 group-hover:text-white transition-colors duration-200">
          {String(number).padStart(2, "0")}
        </div>
        <div className="flex-1 flex justify-between items-center gap-4">
          <span className="flex-1">{question}</span>
          <ChevronDown
            className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 mt-0.5 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>
      {isOpen && (
        <div className="pb-6 pt-1 pl-14 pr-12 text-gray-600 leading-relaxed">
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
};

export default AccordionItem;
