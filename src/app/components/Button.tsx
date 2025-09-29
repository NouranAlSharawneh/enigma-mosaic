import React from "react";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "tertiary" | "link" | "default";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const Button = ({
  children,
  onClick,
  variant = "primary",
  size = "medium",
  disabled = false,
  className = "",
  style = {},
}: ButtonProps) => {
  const baseClasses =
    "font-semibold rounded-3xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50";

  const variantClasses = {
    primary:
      "bg-primary-200 text-white hover:bg-primary-100 active:bg-primary-300",
    secondary:
      "bg-white text-primary-200 border-2 border-primary-200 hover:bg-primary-100/10",
    tertiary:
      "bg-transparent text-primary-200 border-2 border-primary-200 hover:bg-primary-100/10",
    link: "bg-transparent text-primary-200",
    default:
      "bg-secondary-200 text-white transition duration-400 active:from-secondary-200 active:to-secondary-300",
  };

  const sizeClasses = {
    small: "px-4 py-2 text-sm",
    medium: "px-6 py-3 text-base",
    large: "p-12 text-4xl",
  };

  const disabledClasses = disabled
    ? "opacity-50 cursor-not-allowed"
    : "cursor-pointer";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={style}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
