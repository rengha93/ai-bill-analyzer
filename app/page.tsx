import Workspace from "./components/Workspace";

export default function DashboardPage() {
  return (
    <main className="flex flex-col w-full h-screen bg-gray-50 items-center">
      <header className="w-full p-4 bg-white border-b border-gray-200 shadow-sm flex justify-center sticky top-0 z-10 shrink-0">
        <div className="w-full max-w-4xl flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight text-gray-800">
            AI Bill Analyzer
          </h1>
        </div>
      </header>

      <Workspace />
    </main>
  );
}
