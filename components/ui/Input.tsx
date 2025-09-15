type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export function Input({ label, className = "", ...props }: InputProps) {
  return (
    <div className="flex flex-col text-left">
      {label && 
        <label className="mb-1 text-sm font-semibold text-gray-800">
          {label}
        </label>
      }
      <input
        className={`border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 ${className}`}
        {...props}
      />
    </div>
  );
}
