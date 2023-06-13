type Props = {
  children: React.ReactNode;
};

export default function Badge({ children }: Props) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-100 px-3 py-1.5 text-xs font-medium text-blue-900 hover:bg-blue-200">
      {children}
    </span>
  );
}

export function GreenBadge({ children }: Props) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1.5 text-xs font-medium text-green-800">
      {children}
    </span>
  );
}

export function RedBadge({ children }: Props) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1.5 text-xs font-medium text-red-800">
      {children}
    </span>
  );
}
