import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <main className="min-h-screen bg-[#F4F1E8] px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto flex min-h-[80vh] w-full max-w-[860px] items-center justify-center rounded-[30px] border border-[#E3DDCF] bg-[#F8F5EC] px-6 py-10 shadow-[0_26px_70px_-42px_rgba(6,63,36,0.55)] sm:px-10">
        <div className="text-center">
          <p className="font-serif text-[92px] font-semibold leading-[0.85] tracking-tight text-[#0D2A1F] sm:text-[110px]">404</p>
          <h1 className="mt-3 font-serif text-[42px] font-semibold leading-tight text-[#0D2A1F] sm:text-[48px]">Page not found</h1>
          <p className="mt-2 text-[30px] text-[#3F5B4D]">This page doesn&apos;t exist.</p>

          <Link
            href="/"
            className="mt-6 inline-flex items-center justify-center rounded-[16px] bg-gradient-to-r from-[#045D34] via-[#06512F] to-[#013B24] px-7 py-3 text-[22px] font-semibold text-white shadow-[0_20px_32px_-22px_rgba(0,55,33,0.9)] transition hover:brightness-110"
          >
            Go home
          </Link>
        </div>
      </div>
    </main>
  );
}
