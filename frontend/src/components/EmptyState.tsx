import { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export default function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center border border-dashed border-gray-700 rounded-2xl p-10 bg-gray-900/60 gap-3 min-h-[220px]">
      {icon && <div className="text-fury-orange">{icon}</div>}
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      <p className="text-gray-400 max-w-md">{description}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

