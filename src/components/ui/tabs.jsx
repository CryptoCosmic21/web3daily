import React, { useState } from "react";

export function Tabs({ defaultValue, children }) {
  const [activeTab, setActiveTab] = useState(defaultValue);

  const tabTriggers = React.Children.toArray(children).filter(
    (child) => child.type.displayName === "TabsTrigger"
  );
  const tabContents = React.Children.toArray(children).filter(
    (child) => child.type.displayName === "TabsContent"
  );

  return (
    <div className="w-full">
      <div className="flex space-x-2 border-b border-gray-700 dark:border-gray-600">
        {tabTriggers.map((trigger) =>
          React.cloneElement(trigger, {
            isActive: trigger.props.value === activeTab,
            onClick: () => setActiveTab(trigger.props.value),
          })
        )}
      </div>
      <div className="mt-4">
        {tabContents.find((content) => content.props.value === activeTab)}
      </div>
    </div>
  );
}

export function TabsList({ children }) {
  return <div className="flex gap-2 flex-wrap">{children}</div>;
}

export function TabsTrigger({ value, children, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none ${
        isActive
          ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg"
          : "bg-gray-800 text-gray-300 hover:bg-gray-700"
      }`}
    >
      {children}
    </button>
  );
}

TabsTrigger.displayName = "TabsTrigger";

export function TabsContent({ value, children }) {
  return <div>{children}</div>;
}

TabsContent.displayName = "TabsContent";
