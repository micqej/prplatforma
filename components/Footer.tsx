export default function Footer() {
  return (
    <footer className="border-t border-[#e4e2dc] px-10 py-8 flex items-center justify-between mt-10">
      <div className="font-serif text-lg text-[#0e0e0e]">
        PR<span className="text-[#c8502a]">platforma</span>.sk
      </div>
      <div className="text-sm text-[#7a7770]">© {new Date().getFullYear()} — Bezplatné PR články pre slovenské firmy</div>
    </footer>
  )
}
