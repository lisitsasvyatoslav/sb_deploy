/**
 * Guest Layout - for unauthenticated pages (login, register, etc.)
 * This is a simple layout without navigation or sidebars
 */
export default function GuestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="App h-screen flex flex-col">
      <div className="lmx__home__content-wrapper flex flex-col flex-1">
        {children}
      </div>
    </div>
  );
}
