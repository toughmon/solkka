export default function TopAppBar() {
  return (
    <header className="fixed top-0 left-0 w-full px-6 py-4 flex justify-between items-center bg-[#fbf9f8]/80 dark:bg-[#1a1c1e]/80 backdrop-blur-xl z-50 transition-colors duration-300">
      <div className="flex items-center gap-4">
        <button className="p-2 text-primary dark:text-[#a5c9e0] hover:bg-surface-container/50 transition-all rounded-full">
          <span className="material-symbols-outlined">menu</span>
        </button>
        <h1 className="text-primary dark:text-[#a5c9e0] font-headline font-bold tracking-tighter text-xl">Solkka</h1>
      </div>
      <button className="p-2 text-primary dark:text-[#a5c9e0] hover:bg-surface-container/50 transition-all rounded-full">
        <span className="material-symbols-outlined">notifications</span>
      </button>
    </header>
  );
}
