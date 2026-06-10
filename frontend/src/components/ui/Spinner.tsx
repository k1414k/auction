type Props = {
  size?: "sm" | "md" | "lg";
  variant?: "default" | "white";
  className?: string;
};

const sizeClasses = {
  sm: "w-4 h-4 border-2",
  md: "w-8 h-8 border-2",
  lg: "w-12 h-12 border-[3px]",
};

const variantClasses = {
  default: "border-gray-200 border-t-blue-500",
  white: "border-white/30 border-t-white",
};

export function Spinner({ size = "md", variant = "default", className = "" }: Props) {
  return (
    <div
      className={`animate-spin rounded-full ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      role="status"
      aria-label="読み込み中"
    />
  );
}
