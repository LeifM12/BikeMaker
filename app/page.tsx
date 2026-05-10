import Link from "next/link";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="grain absolute inset-0" />
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-[640px] w-[640px] -translate-x-1/2 rounded-full opacity-30 blur-3xl"
        style={{ background: "radial-gradient(closest-side,#dc2626,transparent)" }}
      />

      <header className="relative z-10 flex items-center justify-between px-6 py-5 md:px-10">
        <div className="flex items-center gap-2 font-display text-lg tracking-tight">
          <span className="inline-block size-2 rounded-full bg-accent" />
          <span className="font-semibold">BikeMaker</span>
        </div>
        <nav className="hidden items-center gap-7 text-sm text-neutral-400 md:flex">
          <a href="#how" className="hover:text-bone">How it works</a>
          <a href="#parts" className="hover:text-bone">Catalog</a>
          <Link
            href="/build"
            className="rounded-full bg-bone px-4 py-2 text-sm font-medium text-ink hover:bg-white"
          >
            Start building
          </Link>
        </nav>
      </header>

      <section className="relative z-10 mx-auto max-w-6xl px-6 pt-16 pb-24 md:px-10 md:pt-28">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900/40 px-3 py-1 text-xs text-neutral-300">
          <span className="size-1.5 rounded-full bg-emerald-400" />
          Compatibility-checked. Ready to order.
        </div>
        <h1 className="font-display text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl">
          Build the mountain bike <br className="hidden md:block" />
          you actually <span className="text-accent">want to ride.</span>
        </h1>
        <p className="mt-6 max-w-xl text-base text-neutral-400 md:text-lg">
          Pick from real parts — frames, forks, drivetrains, wheels — and we'll only show
          you components that physically fit together. Visualize, save, and source your dream
          enduro or downhill build.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/build?discipline=enduro"
            className="group inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-base font-medium text-white transition hover:bg-red-700"
          >
            Build an Enduro
            <span className="transition group-hover:translate-x-0.5">→</span>
          </Link>
          <Link
            href="/build?discipline=downhill"
            className="group inline-flex items-center justify-center gap-2 rounded-full border border-neutral-700 px-6 py-3 text-base font-medium text-bone transition hover:border-bone"
          >
            Build a Downhill
            <span className="transition group-hover:translate-x-0.5">→</span>
          </Link>
        </div>
      </section>

      <section
        id="how"
        className="relative z-10 mx-auto max-w-6xl px-6 pb-24 md:px-10"
      >
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              n: "01",
              t: "Pick a frame",
              d: "Frame defines wheel size, axle standards, BB, headtube and shock fitment.",
            },
            {
              n: "02",
              t: "Add compatible parts",
              d: "We filter forks, wheels, drivetrains and brakes that physically fit your frame.",
            },
            {
              n: "03",
              t: "Build it for real",
              d: "Save your spec, see weight & price, and shop the exact parts that work together.",
            },
          ].map((s) => (
            <div
              key={s.n}
              className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-6"
            >
              <div className="mb-4 text-xs text-neutral-500">{s.n}</div>
              <div className="mb-1 font-display text-lg font-medium">{s.t}</div>
              <div className="text-sm text-neutral-400">{s.d}</div>
            </div>
          ))}
        </div>
      </section>

      <footer className="relative z-10 border-t border-neutral-900 px-6 py-6 text-xs text-neutral-500 md:px-10">
        Built with Next.js, Supabase &amp; Vercel · BikeMaker
      </footer>
    </main>
  );
}
