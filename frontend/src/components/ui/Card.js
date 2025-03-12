import React from "react";

const Card = ({
  children,
  title,
  subtitle,
  footer,
  className = "",
  bodyClassName = "",
  headerClassName = "",
  footerClassName = "",
}) => {
  return (
    <div
      className={`bg-white overflow-hidden shadow-md rounded-lg border border-gray-200 transition-shadow duration-300 hover:shadow-lg ${className}`}
    >
      {(title || subtitle) && (
        <div
          className={`px-4 py-5 sm:px-6 border-b border-gray-200 ${headerClassName}`}
        >
          {title && (
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="mt-1 max-w-2xl text-sm text-gray-500">{subtitle}</p>
          )}
        </div>
      )}
      <div className={`px-4 py-5 sm:p-6 ${bodyClassName}`}>{children}</div>
      {footer && (
        <div
          className={`px-4 py-4 sm:px-6 border-t border-gray-200 ${footerClassName}`}
        >
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
