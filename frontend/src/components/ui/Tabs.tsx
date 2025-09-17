import React, { useState, createContext, useContext } from "react";
import { cn } from "../../utils/cn";

// Context to share state between List, Trigger, and Content
interface TabsContextProps {
  value: string;
  setValue: (val: string) => void;
}
const TabsContext = createContext<TabsContextProps | null>(null);

interface TabsProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

const Tabs: React.FC<TabsProps> = ({
  defaultValue,
  value: controlledValue,
  onValueChange,
  children,
  className,
}) => {
  const [internalValue, setInternalValue] = useState(defaultValue || "");

  const value = controlledValue !== undefined ? controlledValue : internalValue;

  const setValue = (val: string) => {
    if (controlledValue === undefined) {
      setInternalValue(val);
    }
    onValueChange?.(val);
  };

  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div className={cn("w-full", className)}>{children}</div>
    </TabsContext.Provider>
  );
};

const TabsList: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => {
  return (
    <div className={cn("flex border-b border-gray-200", className)}>
      {children}
    </div>
  );
};

const TabsTrigger: React.FC<{ value: string; children: React.ReactNode }> = ({
  value,
  children,
}) => {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("TabsTrigger must be used within Tabs");

  const active = ctx.value === value;

  return (
    <button
      onClick={() => ctx.setValue(value)}
      className={cn(
        "px-4 py-2 text-sm font-medium transition-colors hover:cursor-pointer",

        active
          ? "text-blue-600 border-b-2 border-blue-600"
          : "text-gray-500 hover:text-gray-700"
      )}
    >
      {children}
    </button>
  );
};

const TabsContent: React.FC<{ value: string; children: React.ReactNode }> = ({
  value,
  children,
}) => {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("TabsContent must be used within Tabs");

  if (ctx.value !== value) return null;

  return <div className="mt-4">{children}</div>;
};

export { Tabs, TabsList, TabsTrigger, TabsContent };
