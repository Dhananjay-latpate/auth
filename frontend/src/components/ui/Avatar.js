import React from "react";

const Avatar = ({
  name,
  src,
  size = "md",
  variant = "circle",
  backgroundColor = "bg-indigo-600",
  textColor = "text-white",
  className = "",
}) => {
  // Get initials from name
  const getInitials = (name) => {
    if (!name) return "?";
    const names = name.trim().split(" ");
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return `${names[0].charAt(0)}${names[names.length - 1].charAt(
      0
    )}`.toUpperCase();
  };

  // Size classes
  const getSizeClasses = () => {
    switch (size) {
      case "xs":
        return "h-6 w-6 text-xs";
      case "sm":
        return "h-8 w-8 text-sm";
      case "md":
        return "h-10 w-10 text-base";
      case "lg":
        return "h-12 w-12 text-lg";
      case "xl":
        return "h-16 w-16 text-xl";
      case "2xl":
        return "h-20 w-20 text-2xl";
      default:
        return "h-10 w-10 text-base";
    }
  };

  // Shape classes
  const getShapeClasses = () => {
    switch (variant) {
      case "circle":
        return "rounded-full";
      case "square":
        return "rounded";
      default:
        return "rounded-full";
    }
  };

  const avatarClasses = `${getSizeClasses()} ${getShapeClasses()} flex items-center justify-center font-medium ${backgroundColor} ${textColor} ${className}`;

  return (
    <div className={avatarClasses}>
      {src ? (
        <img
          src={src}
          alt={name || "Avatar"}
          className={`${getShapeClasses()} h-full w-full object-cover`}
        />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  );
};

export default Avatar;
