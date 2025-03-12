import React from "react";

const Badge = ({
  children,
  variant = "default",
  size = "md",
  className = "",
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case "primary":
        return "bg-indigo-100 text-indigo-800";
      case "secondary":
        return "bg-gray-100 text-gray-800";
      case "success":
        return "bg-green-100 text-green-800";
      case "danger":
        return "bg-red-100 text-red-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "info":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "text-xs px-2 py-0.5";
      case "md":
        return "text-xs px-2.5 py-0.5";
      case "lg":
        return "text-sm px-3 py-1";
      default:
        return "text-xs px-2.5 py-0.5";
    }
  };

  const classes = `inline-flex items-center font-medium rounded-full ${getVariantClasses()} ${getSizeClasses()} ${className}`;

  return <span className={classes}>{children}</span>;
};

export default Badge;
