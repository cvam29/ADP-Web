'use client'

import { Check } from "lucide-react"

interface StepperProps {
  steps: string[]
  currentStep: number
}

export function FormStepper({ steps, currentStep }: StepperProps) {
  return (
    <div className="w-full">
      {/* Desktop */}
      <div className="hidden sm:flex items-center">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep
          const isActive = index === currentStep
          return (
            <div key={index} className="flex items-center flex-1 min-w-0">
              <div className="flex items-center gap-3 shrink-0">
                {/* Circle */}
                <div
                  className={`
                    flex items-center justify-center w-9 h-9 rounded-full text-sm font-semibold transition-all duration-300
                    ${isCompleted ? "bg-primary text-primary-foreground"
                      : isActive ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                      : "bg-muted text-muted-foreground"}
                  `}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : <span>{index + 1}</span>}
                </div>
                {/* Label */}
                <span
                  className={`text-sm font-medium whitespace-nowrap transition-colors ${
                    isActive ? "text-foreground" : isCompleted ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {step}
                </span>
              </div>

              {/* Connector */}
              {index < steps.length - 1 && (
                <div className="flex-1 mx-4 h-px transition-colors duration-300 min-w-4">
                  <div className={`h-full ${isCompleted ? "bg-primary" : "bg-border"}`} />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Mobile */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-foreground">{steps[currentStep]}</span>
          <span className="text-xs text-muted-foreground font-medium">{currentStep + 1} / {steps.length}</span>
        </div>
        <div className="flex gap-1.5">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                index < currentStep ? "bg-primary" : index === currentStep ? "bg-primary/60" : "bg-border"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
