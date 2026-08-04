import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { loginWithKakao } from "@/features/auth/api";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { getApiErrorMessage } from "@/features/admin/api";

/** Lands here after Kakao redirects back with `?code=...` (see `KAKAO_REDIRECT_URI`). */
export default function KakaoCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const [error, setError] = useState<string | null>(null);
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const code = searchParams.get("code");
    const kakaoError = searchParams.get("error");

    if (kakaoError || !code) {
      setError("카카오 로그인이 취소되었습니다.");
      return;
    }

    loginWithKakao(code)
      .then((session) => {
        setSession(session.accessToken, session.user);
        toast.success(`${session.user.nickname}님, 환영해요!`);
        navigate("/", { replace: true });
      })
      .catch((err) => {
        setError(getApiErrorMessage(err, "카카오 로그인에 실패했습니다."));
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 px-4 text-center">
      {error ? (
        <>
          <p className="text-sm font-semibold text-slate-900">{error}</p>
          <button type="button" onClick={() => navigate("/login")} className="btn-secondary">
            다시 로그인하기
          </button>
        </>
      ) : (
        <>
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
          <p className="text-sm text-slate-400">로그인 처리 중...</p>
        </>
      )}
    </div>
  );
}
