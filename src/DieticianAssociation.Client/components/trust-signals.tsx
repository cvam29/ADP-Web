import Image from "next/image"

const partners = [
  { name: "Academy of Nutrition", logo: "/placeholder.svg?height=60&width=120" },
  { name: "International Nutrition Council", logo: "/placeholder.svg?height=60&width=120" },
  { name: "Health Professional Alliance", logo: "/placeholder.svg?height=60&width=120" },
  { name: "Nutrition Research Institute", logo: "/placeholder.svg?height=60&width=120" },
  { name: "Global Dietetics Board", logo: "/placeholder.svg?height=60&width=120" },
]

export function TrustSignals() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">Trusted by Leading Organizations</h2>
          <p className="text-slate-600">Partnering with top institutions to advance nutrition science</p>
        </div>
        {/* <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 items-center">
          {partners.map((partner, index) => (
            <div key={index} className="flex justify-center">
              <Image
                src={partner.logo || "/placeholder.svg"}
                alt={partner.name}
                width={120}
                height={60}
                className="opacity-60 hover:opacity-100 transition-opacity duration-300 filter grayscale hover:grayscale-0"
              />
            </div>
          ))}
        </div> */}
      </div>
    </section>
  )
}
