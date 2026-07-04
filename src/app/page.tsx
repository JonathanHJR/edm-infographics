import Image from "next/image";
import Link from "next/link";
import { infographics } from "@/data/infographics";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {infographics.map((infographic) => (
          <Link
            key={infographic.id}
            href={`/infographics/${infographic.id}`}
            className="group flex flex-col rounded-xl border border-zinc-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
          >
            <div
              className="relative w-full overflow-hidden rounded-t-xl bg-zinc-100"
              style={{
                aspectRatio: `${infographic.width} / ${infographic.height}`,
              }}
            >
              <Image
                src={infographic.src}
                alt={infographic.title}
                fill
                className="object-contain transition-transform duration-300 group-hover:scale-[1.03]"
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              />
            </div>
            <div className="flex flex-1 flex-col gap-1.5 border-t border-zinc-100 p-5">
              <h2 className="font-semibold text-navy">{infographic.title}</h2>
              <p className="text-sm leading-relaxed text-zinc-600">
                {infographic.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
