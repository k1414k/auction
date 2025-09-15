type CardProps = {
  title: string|null;
  subtitle: string|null;
  children: React.ReactNode;
};

export function Card({ title, subtitle, children }: CardProps) {
  return (
        <div className="bg-white rounded-xl shadow-lg p-6 hover:bg-gray-100 cursor-pointer transition">
          <h2 className="text-xl font-semibold mb-2">
            {title}
          </h2>
          <p className="text-gray-600 mb-4">
            {subtitle}
          </p>
          {children}
        </div>
  );
}
