import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-zinc-200 bg-white px-6 py-8 dark:border-zinc-800 dark:bg-black">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="inline-block">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            EDM Infographics
          </h1>
        </Link>
        <p className="mt-1 text-zinc-600 dark:text-zinc-400">
          Electronic Direct Mail infographics.
        </p>
      </div>
    </header>
  );
}
