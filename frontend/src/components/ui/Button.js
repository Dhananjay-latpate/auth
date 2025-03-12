import React from "react";
import Link from "next/link";

const Button = ({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  className = "",
  href,
  isLoading = false,
  disabled = false,
  onClick,
  ...props
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case "primary":
        return "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 border-transparent";
      case "secondary":
        return "bg-white text-gray-700 hover:bg-gray-50 focus:ring-indigo-500 border-gray-300";
      case "success":
        return "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 border-transparent";
      case "danger":
        return "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 border-transparent";
      case "outline":
        return "bg-transparent text-indigo-600 hover:bg-indigo-50 focus:ring-indigo-500 border-indigo-600";
      default:
        return "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 border-transparent";
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case "xs":
        return "px-2.5 py-1.5 text-xs";
      case "sm":
        return "px-3 py-2 text-sm";
      case "md":
        return "px-4 py-2 text-sm";
      case "lg":
        return "px-4 py-2 text-base";
      case "xl":
        return "px-6 py-3 text-base";
      default:
        return "px-4 py-2 text-sm";
    }
  };

  const baseClasses =
    "inline-flex justify-center items-center border font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200";
  const disabledClasses = "opacity-60 cursor-not-allowed";

  const classes = `${baseClasses} ${getVariantClasses()} ${getSizeClasses()} ${
    disabled || isLoading ? disabledClasses : ""
  } ${className}`;

  // If href is provided, render as Link
  if (href) {
    return (
      <Link href={href} className={classes} {...props}>
        {isLoading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Loading...
          </>
        ) : (
          children
        )}
      </Link>
    );
  }

  // Otherwise render as button
  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || isLoading}
      onClick={onClick}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      {isLoading ? "Loading..." : children}
    </button>
  );
};

export default Button;
