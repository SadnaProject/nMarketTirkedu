type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  return (
    <div className="container mx-auto flex max-w-6xl flex-col items-center gap-4 bg-primary p-4 pb-12 sm:p-12">
      {children}
    </div>
  );
}
