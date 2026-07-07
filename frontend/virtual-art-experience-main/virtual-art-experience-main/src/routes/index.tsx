import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";

// No head() here: the home route inherits title/description/og/twitter from
// __root.tsx, and ships no og:image so serve-time hosting can inject the
// project's social preview (explicit og:image or latest screenshot).
export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen" style={{ background: "#0f1524", color: "#f5efdd" }}>
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="font-serif text-xl tracking-wide">Maison d'Art</div>
        <nav className="flex items-center gap-6 text-sm">
          <Link to="/virtual-gallery" className="rounded-md px-4 py-2 font-medium" style={{ background: "#d9b23a", color: "#1a1f30" }}>
            3D Gallery
          </Link>
        </nav>
      </header>
      <section className="mx-auto max-w-4xl px-6 py-24 text-center">
        <p className="text-xs uppercase tracking-[0.3em]" style={{ color: "#d9b23a" }}>Now Showing</p>
        <h1 className="mt-4 font-serif text-5xl leading-tight md:text-6xl">A Virtual Museum, Reimagined</h1>
        <p className="mx-auto mt-6 max-w-2xl text-base opacity-80">
          Step inside an immersive 3D exhibition room. Walk among the masterpieces, approach any painting, and let the details unfold.
        </p>
        <div className="mt-10">
          <Link
            to="/virtual-gallery"
            className="inline-block rounded-md px-8 py-4 text-sm font-semibold tracking-wide"
            style={{ background: "#d9b23a", color: "#1a1f30" }}
          >
            Enter the Virtual Gallery →
          </Link>
        </div>
      </section>
    </div>
  );
}
