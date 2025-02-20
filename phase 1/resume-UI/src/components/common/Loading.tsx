import { LoadingProps } from "../../types";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  text?: string;
}

export const Loading = ({ size = "md", text }: LoadingProps) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div
        className={`${sizeClasses[size]} border-2 border-primary-600 border-t-transparent rounded-full animate-spin`}
      />
      {text && <p className="mt-4 text-white/70 text-sm font-medium">{text}</p>}
    </div>
  );
};

export default Loading;
