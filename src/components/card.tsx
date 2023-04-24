type Props = {
  children: React.ReactNode;
};

export default function Card({ children }: Props) {
  return (
    <div className="flex flex-col rounded-xl border bg-white p-4 drop-shadow-md md:p-5">
      {children}
    </div>
  );
}
