import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useLoginPromptStore } from "../store/useLoginPromptStore";

/**
 * Global "로그인이 필요해요" confirm dialog — shown whenever `useRequireAuth`
 * gates an action (liking a drip, commenting, ...) for a logged-out fan.
 * Mounted once in `MainLayout` so it can pop up above any page.
 */
export function LoginRequiredDialog() {
  const isOpen = useLoginPromptStore((state) => state.isOpen);
  const close = useLoginPromptStore((state) => state.close);
  const navigate = useNavigate();

  const handleConfirm = () => {
    close();
    navigate("/login");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={close}
            aria-hidden="true"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="login-required-title"
            initial={{ opacity: 0, scale: 0.94, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 4 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="relative w-full max-w-[340px] rounded-2xl border border-white/10 bg-[#1c1c22] p-6 text-center shadow-2xl"
          >
            <h2 id="login-required-title" className="text-[17px] font-bold text-white">
              로그인이 필요해요
            </h2>
            <p className="mt-2 text-[14px] text-white/60">로그인 페이지로 이동할까요?</p>

            <div className="mt-6 flex gap-2.5">
              <button
                type="button"
                onClick={close}
                className="flex-1 rounded-xl border border-white/15 bg-transparent py-2.5 text-[14px] font-semibold text-white/80 transition-colors hover:bg-white/5"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="flex-1 rounded-xl bg-[#7c6cf6] py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-[#8b7cf8]"
              >
                확인
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
