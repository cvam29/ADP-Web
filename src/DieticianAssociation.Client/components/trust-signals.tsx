const stats = [
  { value: "5,000+", label: "Active Members" },
  { value: "15+", label: "Years of Excellence" },
  { value: "50+", label: "Events Per Year" },
  { value: "98%", label: "Member Satisfaction" },
]

export function TrustSignals() {
  return (
    <section className="py-16 bg-secondary/40 border-y border-border">
      <div className="container mx-auto px-4">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-10">
          Trusted by professionals across India
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-0 sm:divide-x sm:divide-border">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center px-10 text-center">
              <span className="text-4xl font-bold tracking-tight text-primary">
                {stat.value}
              </span>
              <span className="text-sm text-muted-foreground mt-1">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
