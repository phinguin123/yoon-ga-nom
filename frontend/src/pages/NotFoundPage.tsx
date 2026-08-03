import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="font-display text-7xl font-extrabold text-brand-200">404</p>
      <h1 className="mt-4 font-display text-2xl font-bold text-slate-900">
        페이지를 찾을 수 없어요
      </h1>
      <p className="mt-2 text-slate-500">주소를 다시 확인하거나 홈으로 돌아가주세요.</p>
      <Link to="/" className="btn-primary mt-6">
        홈으로 가기
      </Link>
    </div>
  );
}
