import { motion } from "framer-motion";
import { getKakaoAuthorizeUrl } from "@/features/auth/api";

/**
 * Standalone login — no Navbar/Footer (rendered outside MainLayout in
 * router.tsx). Hero image + single Kakao action.
 */
export default function LoginPage() {
  const handleKakaoLogin = () => {
    window.location.href = getKakaoAuthorizeUrl();
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <div className="relative hidden flex-1 overflow-hidden lg:block">
        <img
          src="/login-hero.png"
          alt="윤가놈"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-slate-50" />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <div className="mb-8 overflow-hidden rounded-2xl shadow-xl shadow-slate-900/10 lg:hidden">
            <img
              src="/login-hero.png"
              alt="윤가놈"
              className="aspect-[4/3] w-full object-cover"
            />
          </div>

          <div className="glass-panel rounded-3xl p-8 text-center sm:p-10">
            <p className="badge mx-auto mb-4 bg-brand-100 text-brand-700">
              비공식 팬 아카이브
            </p>
            <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              윤가놈의 모든 것
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              카카오 계정으로 로그인하세요.
            </p>

            <button
              type="button"
              onClick={handleKakaoLogin}
              className="mt-8 w-full rounded-xl bg-[#FEE500] px-8 py-4 text-base font-bold text-[#191919] transition-all hover:brightness-95 hover:-translate-y-0.5 active:translate-y-0 active:brightness-90"
            >
              카카오로 로그인
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
