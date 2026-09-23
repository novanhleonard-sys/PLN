

export function AppShell({ children, header }: { children: React.ReactNode, header?: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-cream relative overflow-hidden">
      {header && (
        <header className="absolute top-0 left-0 right-0 z-30 p-4 pointer-events-none">
          <div className="pointer-events-auto">
            {header}
          </div>
        </header>
      )}
      <main className="flex-1 w-full h-screen relative">
        {children}
      </main>
    </div>
  );
}
