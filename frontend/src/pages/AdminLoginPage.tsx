import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "@/features/admin/api";
import { useAdminLogin } from "@/features/admin/hooks/useAdminAuth";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const loginMutation = useAdminLogin();

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    loginMutation.mutate(password, {
      onSuccess: () => navigate("/admin", { replace: true }),
      onError: (error) => {
        toast.error(getApiErrorMessage(error, "로그인에 실패했습니다."));
      },
    });
  };

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-10">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-600">
            <Lock className="h-6 w-6" />
          </span>
          <h1 className="font-display text-xl font-bold text-slate-900">관리자 로그인</h1>
          <p className="mt-1 text-sm text-slate-400">챌린지 영상을 관리하려면 로그인하세요.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="비밀번호"
            autoFocus
            required
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
          />
          <button type="submit" disabled={loginMutation.isPending} className="btn-primary w-full">
            {loginMutation.isPending ? "확인 중..." : "로그인"}
          </button>
        </form>
      </div>
    </div>
  );
}
