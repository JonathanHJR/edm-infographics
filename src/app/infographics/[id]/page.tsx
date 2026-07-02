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
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
      <Link
        href="/"
        className="text-sm font-semibold text-accent transition-colors hover:text-navy"
      >
        ← Back to gallery
      </Link>

      <h1 className="mt-4 text-2xl font-bold tracking-tight text-navy">
        {infographic.title}
      </h1>
      <p className="mt-1 text-zinc-600">{infographic.description}</p>

      <div className="mt-6 overflow-hidden rounded-xl border border-zinc-200 shadow-sm">
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
        className="mt-6 inline-flex items-center justify-center rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent"
      >
        View original / download
      </a>
    </main>
  );
}
