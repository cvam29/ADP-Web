const stats = [
  { value: "5,000+", label: "Active Members" },
  { value: "15+", label: "Years of Excellence" },
  { value: "50+", label: "Events Per Year" },
  { value: "98%", label: "Member Satisfaction" },
]

export function TrustSignals() {
  return (
    <section className="py-16 bg-zinc-50 dark:bg-zinc-900/40 border-y border-zinc-200 dark:border-zinc-800">
      <div className="container mx-auto px-4">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-10">
          Trusted by professionals across India
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-0 sm:divide-x sm:divide-zinc-300 dark:sm:divide-zinc-700">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center px-10 text-center">
              <span className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                {stat.value}
              </span>
              <span className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
