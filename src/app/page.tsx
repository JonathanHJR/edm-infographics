import Image from "next/image";
import Link from "next/link";
import { infographics } from "@/data/infographics";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {infographics.map((infographic) => (
          <Link
            key={infographic.id}
            href={`/infographics/${infographic.id}`}
            className="group flex flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950"
          >
            <div
              className="relative w-full bg-zinc-100 dark:bg-zinc-900"
              style={{
                aspectRatio: `${infographic.width} / ${infographic.height}`,
              }}
            >
              <Image
                src={infographic.src}
                alt={infographic.title}
                fill
                className="object-cover object-top transition-transform group-hover:scale-[1.02]"
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              />
            </div>
            <div className="flex flex-1 flex-col gap-1 p-4">
              <h2 className="font-medium text-zinc-950 dark:text-zinc-50">
                {infographic.title}
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {infographic.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
