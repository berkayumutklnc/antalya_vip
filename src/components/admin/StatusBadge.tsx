export default function StatusBadge({ status }: { status: string }) {
  const cls = (() => {
    switch (status) {
      case "pending": return "bg-yellow-900/30 text-yellow-300 border-yellow-700/40";
      case "confirmed": return "bg-green-900/30 text-green-300 border-green-700/40";
      case "canceled": return "bg-red-900/30 text-red-300 border-red-700/40";
      case "completed": return "bg-sky-900/30 text-sky-300 border-sky-700/40";
      case "no_show": return "bg-orange-900/30 text-orange-300 border-orange-700/40";
      default: return "bg-neutral-800 text-neutral-200 border-neutral-700/40";
    }
  })();
  return <span className={`px-2 py-0.5 rounded border text-xs font-medium ${cls}`}>{status}</span>;
}
