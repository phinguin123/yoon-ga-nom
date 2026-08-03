import { FaYoutube, FaTwitch, FaInstagram } from "react-icons/fa";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="container-page flex flex-col items-center gap-4 py-10 text-sm text-slate-500 sm:flex-row sm:justify-between">
        <p>© {new Date().getFullYear()} 윤가놈.gg — 팬 제작 아카이브 · 공식 채널 아님</p>
        <div className="flex items-center gap-4">
          <a href="#" aria-label="YouTube" className="transition-colors hover:text-red-500">
            <FaYoutube className="h-5 w-5" />
          </a>
          <a href="#" aria-label="Twitch" className="transition-colors hover:text-violet-500">
            <FaTwitch className="h-5 w-5" />
          </a>
          <a href="#" aria-label="Instagram" className="transition-colors hover:text-pink-500">
            <FaInstagram className="h-5 w-5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
