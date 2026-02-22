/** Hero section: title and tagline for the landing page. */
export function LandingHero() {
  return (
    <div className="mb-12 text-center">
      <div className="mb-4 flex justify-center">
        <span className="badge border-amber-400/40 bg-amber-400/10 text-amber-200">
          Real-time safety intelligence
        </span>
      </div>
      <h1 className="text-3xl font-semibold tracking-tight text-slate-100 sm:text-4xl">
        AI Security Ops for Physical Spaces
      </h1>
      <p className="mt-3 text-base text-slate-300 sm:text-lg">
        Turn raw footage into actionable security intelligence with live alerts
        and natural-language Q&A.
      </p>
    </div>
  );
}
