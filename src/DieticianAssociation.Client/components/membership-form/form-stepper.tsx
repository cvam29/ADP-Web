'use client'

interface StepperProps {
  steps: string[]
  currentStep: number
}

export function FormStepper({ steps, currentStep }: StepperProps) {
  return (
    <div className="mb-12">
      {/* Desktop View */}
      <div className="hidden sm:flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center flex-1">
            {/* Step Circle */}
            <div
              className={`
                flex items-center justify-center w-12 h-12 rounded-full font-bold text-sm
                transition-all duration-300 relative z-10
                ${
                  index < currentStep
                    ? 'bg-emerald-600 text-white shadow-lg'
                    : index === currentStep
                    ? 'bg-emerald-600 text-white ring-4 ring-emerald-200 shadow-lg'
                    : 'bg-gray-100 text-gray-500'
                }
              `}
            >
              {index < currentStep ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                index + 1
              )}
            </div>

            {/* Step Label */}
            <div className="ml-4 flex-1 pr-4">
              <p
                className={`text-sm font-semibold transition-colors whitespace-nowrap overflow-hidden text-ellipsis ${
                  index <= currentStep ? 'text-emerald-700' : 'text-gray-400'
                }`}
              >
                {step}
              </p>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className="absolute left-0 right-0 top-6 h-1 -z-10 ml-6 mr-6" style={{ width: `calc(100% - 3rem)` }}>
                <div
                  className={`h-full transition-all duration-300 ${
                    index < currentStep ? 'bg-emerald-600' : 'bg-gray-200'
                  }`}
                ></div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Mobile View */}
      <div className="sm:hidden">
        <div className="flex items-center justify-center mb-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-600 mb-2">{currentStep + 1}</div>
            <div className="text-sm font-semibold text-gray-700">{steps[currentStep]}</div>
          </div>
        </div>
        <div className="flex gap-1">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-1 flex-1 rounded-full transition-all ${
                index < currentStep ? 'bg-emerald-600' : index === currentStep ? 'bg-emerald-500' : 'bg-gray-200'
              }`}
            ></div>
          ))}
        </div>
      </div>
    </div>
  )
}
