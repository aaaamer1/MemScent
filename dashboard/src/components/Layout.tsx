// dashboard/src/components/Layout.tsx
import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="dark min-h-screen 
                 bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900
                 text-gray-100
                 flex flex-col"
    >
      <header className="p-4 text-center font-bold text-2xl">
        MemScent Dashboard
      </header>
      <main className="flex-grow flex items-center justify-center p-4">
        {children}
      </main>
      <footer className="p-2 text-center text-gray-400">
      </footer>
    </div>
  );
}
