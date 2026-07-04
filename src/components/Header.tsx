import Link from "next/link";

export function Header() {
  return (
    <header className="border-b-2 border-accent bg-navy px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/"
          className="inline-block rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-light focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-light">
            Electronic Direct Mail
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-white">
            EDM Infographics
          </h1>
        </Link>
      </div>
    </header>
  );
}
