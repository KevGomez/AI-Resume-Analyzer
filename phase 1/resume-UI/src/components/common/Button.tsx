import React from "react";
import { Loading } from "./Loading";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  isLoading?: boolean;
  loadingText?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  isLoading = false,
  loadingText,
  className = "",
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

  const variantClasses = {
    primary: "bg-primary-500/20 text-primary-400 hover:bg-primary-500/30",
    secondary: "bg-dark-300/30 text-white/90 hover:bg-dark-300/50",
    danger: "bg-red-500/20 text-red-400 hover:bg-red-500/30",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm rounded-md",
    md: "px-4 py-2 text-sm rounded-lg",
    lg: "px-6 py-3 text-base rounded-lg",
  };

  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    fullWidth ? "w-full" : "",
    className,
  ].join(" ");

  return (
    <button
      className={classes}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <>
          <Loading size="sm" className="mr-2" />
          {loadingText || children}
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
