type ButtonProps = {
  children: React.ReactNode;
  variant?: "primary" | "danger" | "secondary";
  size?: "sm" | "md" | "lg";
};

export function Button({ children, variant = "primary", size = "md" }: ButtonProps) {
  const base = "text-white font-black rounded transition-colors mr-2";

  let colorClass = "";
  if (variant === "primary") colorClass = "bg-blue-600 hover:bg-blue-500";
  if (variant === "danger") colorClass = "bg-red-600 hover:bg-red-500";
  if (variant === "secondary") colorClass = "bg-gray-600 hover:bg-gray-500";

  let sizeClass = "";
  if (size === "sm") sizeClass = "px-3 py-1";
  if (size === "md") sizeClass = "px-4 py-2";
  if (size === "lg") sizeClass = "px-6 py-3";

  return (
    <button className={`${base} ${colorClass} ${sizeClass}`}>
      {children}
    </button>
  );
}
