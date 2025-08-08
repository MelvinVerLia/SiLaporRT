import React from "react";

interface AccordionProps {
  children: React.ReactNode;
  className?: string;
}

const Accordion: React.FC<AccordionProps> = ({ children, className }) => {
  return <div className={className}>{children}</div>;
};

export default Accordion;
