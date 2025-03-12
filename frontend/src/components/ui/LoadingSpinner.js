import React from "react";

const LoadingSpinner = ({ size = "md", color = "indigo", className = "" }) => {
  const getSizeClasses = () => {
    switch (size) {
      case "xs":
        return "h-3 w-3";
      case "sm":
        return "h-4 w-4";
      case "md":
        return "h-8 w-8";
      case "lg":
        return "h-12 w-12";
      case "xl":
        return "h-16 w-16";
      default:
        return "h-8 w-8";
    }
  };

  const getColorClasses = () => {
    switch (color) {
      case "indigo":
        return "border-indigo-500";
      case "blue":
        return "border-blue-500";
      case "green":
        return "border-green-500";
      case "red":
        return "border-red-500";
      case "yellow":
        return "border-yellow-500";
      case "gray":
        return "border-gray-500";
      case "white":
        return "border-white";
      default:
        return "border-indigo-500";
    }
  };

  return (
    <div className={`${className} flex justify-center items-center`}>
      <div
        className={`${getSizeClasses()} ${getColorClasses()} animate-spin rounded-full border-2 border-t-transparent`}
      />
    </div>
  );
};

export default LoadingSpinner;
