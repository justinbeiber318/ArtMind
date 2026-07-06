export default function TableRow({ children }) {
  return (
    <tr className="border-b border-[#1a1a1a] hover:bg-[#d4af5f]/10 transition-colors duration-150 group">
      {children}
    </tr>
  );
}
