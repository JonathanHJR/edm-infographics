import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { infographics } from "@/data/infographics";

function getInfographic(id: string) {
  return infographics.find((infographic) => infographic.id === id);
}

export function generateStaticParams() {
  return infographics.map((infographic) => ({ id: infographic.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const infographic = getInfographic(id);

  if (!infographic) {
    return {};
  }

  return {
    title: infographic.title,
    description: infographic.description,
    openGraph: {
      title: infographic.title,
      description: infographic.description,
      images: [infographic.src],
    },
  };
}

export default async function InfographicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const infographic = getInfographic(id);

  if (!infographic) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
      <Link
        href="/"
        className="text-sm font-medium text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
      >
        ← Back to gallery
      </Link>

      <h1 className="mt-4 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
        {infographic.title}
      </h1>
      <p className="mt-1 text-zinc-600 dark:text-zinc-400">
        {infographic.description}
      </p>

      <div className="mt-6 overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
        <Image
          src={infographic.src}
          alt={infographic.title}
          width={infographic.width}
          height={infographic.height}
          className="w-full h-auto"
          priority
        />
      </div>

      <a
        href={infographic.src}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-flex items-center justify-center rounded-full bg-zinc-950 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-300"
      >
        View original / download
      </a>
    </main>
  );
}
