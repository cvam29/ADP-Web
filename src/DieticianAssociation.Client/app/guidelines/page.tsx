"use client";

import { useState } from "react";
import {
  ChevronDown,
  ExternalLink,
  BookOpen,
  Heart,
  Baby,
  Activity,
  Droplet,
  Apple,
  Stethoscope,
  FlaskConical,
} from "lucide-react";
import Link from "next/link";

interface GuidelineItem {
  title: string;
  description: string;
  url: string;
}

interface GuidelineSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  guidelines: GuidelineItem[];
}

export default function GuidelinesPage() {
  const [expandedSections, setExpandedSections] = useState<string[]>([
    "diabetes",
  ]);
  

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId],
    );
  };

  const sections: GuidelineSection[] = [
    {
      id: "diabetes",
      title: "Diabetes – Clinical & Nutrition Guidelines",
      icon: <Droplet className="w-6 h-6" />,
      color: "emerald",
      guidelines: [
        {
          title:
            "American Diabetes Association (ADA) - Standards of Care in Diabetes",
          description:
            "Official annual clinical guideline including medical nutrition therapy, eating patterns, weight management, and lifestyle care.",
          url: "https://professional.diabetes.org/standards-of-care",
        },
        {
          title: "ADA Standards of Care – Full PDF (Diabetes Care Supplement)",
          description:
            "Comprehensive PDF used globally for clinical reference and teaching.",
          url: "https://diabetesjournals.org/care/issue",
        },
        {
          title:
            "RSSDI–ICMR Consensus Guidelines on Nutrition Management of Diabetes (India)",
          description:
            "India‑specific dietary recommendations for children, adolescents, young adults, and adults, aligned with Indian food patterns.",
          url: "https://ijddc.org/",
        },
      ],
    },
    {
      id: "ckd",
      title: "Chronic Kidney Disease (CKD) & Renal Nutrition",
      icon: <Activity className="w-6 h-6" />,
      color: "blue",
      guidelines: [
        {
          title: "KDOQI Clinical Practice Guideline for Nutrition in CKD",
          description:
            "Gold‑standard guideline covering protein, energy, electrolytes, micronutrients, and nutrition assessment in CKD.",
          url: "https://www.kidney.org/professionals/kdoqi/guidelines",
        },
        {
          title: "KDOQI Nutrition Evidence Tables (PDF)",
          description:
            "Detailed evidence summaries supporting CKD nutrition recommendations.",
          url: "https://www.kidney.org/professionals/guidelines",
        },
      ],
    },
    {
      id: "general-nutrition",
      title: "General Nutrition & Dietary Guidelines (India)",
      icon: <Apple className="w-6 h-6" />,
      color: "orange",
      guidelines: [
        {
          title: "ICMR – Dietary Guidelines for Indians (Latest Edition)",
          description:
            "Covers balanced diets, My Plate for India, salt/sugar/fat moderation, and life‑stage nutrition.",
          url: "https://www.nin.res.in/",
        },
        {
          title: "Recommended Dietary Allowances (RDA) for Indians",
          description:
            "Authoritative reference for macro‑ and micronutrient requirements.",
          url: "https://www.nin.res.in/",
        },
      ],
    },
    {
      id: "medical-nutrition",
      title: "Medical Nutrition Therapy & Dietetics Practice",
      icon: <Stethoscope className="w-6 h-6" />,
      color: "purple",
      guidelines: [
        {
          title:
            "Academy of Nutrition and Dietetics - Nutrition Care Manual & Practice Guidelines",
          description:
            "Evidence‑based guidance for nutrition assessment, diagnosis, intervention, and monitoring.",
          url: "https://www.nutritioncaremanual.org/",
        },
        {
          title: "Diabetes Nutrition Practice Guideline (Summary Access)",
          description:
            "Focused guidance for dietitians providing diabetes care.",
          url: "https://eguideline.guidelinecentral.com/",
        },
      ],
    },
    {
      id: "cardiovascular",
      title: "Cardiovascular & Metabolic Health",
      icon: <Heart className="w-6 h-6" />,
      color: "red",
      guidelines: [
        {
          title:
            "American Heart Association (AHA) - Dietary Recommendations for Cardiovascular Health",
          description:
            "Guidelines on heart‑healthy diets, fats, sodium, and lifestyle.",
          url: "https://www.heart.org/",
        },
        {
          title: "WHO – Healthy Diet & NCD Prevention Guidelines",
          description:
            "International recommendations for salt, sugar, fats, and population nutrition.",
          url: "https://www.who.int/health-topics/nutrition",
        },
      ],
    },
    {
      id: "maternal-child",
      title: "Maternal, Child & Adolescent Nutrition",
      icon: <Baby className="w-6 h-6" />,
      color: "pink",
      guidelines: [
        {
          title:
            "WHO & UNICEF - Maternal, Infant & Young Child Nutrition Guidelines",
          description:
            "Breastfeeding, complementary feeding, and maternal nutrition standards.",
          url: "https://www.who.int/teams/nutrition-and-food-safety",
        },
        {
          title: "ICMR – Nutrition Guidelines for Pregnancy & Lactation",
          description: "India‑specific recommendations for maternal health.",
          url: "https://www.nin.res.in/",
        },
      ],
    },
    {
      id: "lab-interpretation",
      title: "Lab Interpretation & Clinical Correlation",
      icon: <FlaskConical className="w-6 h-6" />,
      color: "indigo",
      guidelines: [
        {
          title: "ADA & KDOQI - Biochemical Parameters",
          description:
            "HbA1c, lipid profile, renal markers, electrolytes – interpretation within nutrition care.",
          url: "https://professional.diabetes.org/standards-of-care",
        },
      ],
    },
  ];

  const getColorClasses = (color: string) => {
    const colorMap: Record<
      string,
      { bg: string; border: string; text: string; hover: string }
    > = {
      emerald: {
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        text: "text-emerald-700",
        hover: "hover:bg-emerald-100",
      },
      blue: {
        bg: "bg-blue-50",
        border: "border-blue-200",
        text: "text-blue-700",
        hover: "hover:bg-blue-100",
      },
      orange: {
        bg: "bg-orange-50",
        border: "border-orange-200",
        text: "text-orange-700",
        hover: "hover:bg-orange-100",
      },
      purple: {
        bg: "bg-purple-50",
        border: "border-purple-200",
        text: "text-purple-700",
        hover: "hover:bg-purple-100",
      },
      red: {
        bg: "bg-red-50",
        border: "border-red-200",
        text: "text-red-700",
        hover: "hover:bg-red-100",
      },
      pink: {
        bg: "bg-pink-50",
        border: "border-pink-200",
        text: "text-pink-700",
        hover: "hover:bg-pink-100",
      },
      indigo: {
        bg: "bg-indigo-50",
        border: "border-indigo-200",
        text: "text-indigo-700",
        hover: "hover:bg-indigo-100",
      },
    };
    return colorMap[color] || colorMap.emerald;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 text-white">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="flex items-center gap-4 mb-4">
            <BookOpen className="w-10 h-10 md:w-12 md:h-12" />
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">
              ADP Professional Nutrition & Dietetics Guidelines Library
            </h1>
          </div>
          <p className="text-emerald-50 text-lg md:text-xl max-w-4xl">
            A curated, regularly updated repository of authoritative national
            and international guidelines for dietetics and nutrition
            professionals.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-6xl">
        {/* Guidelines Sections */}
        <div className="space-y-4">
          {sections.map((section) => {
            const isExpanded = expandedSections.includes(section.id);
            const colors = getColorClasses(section.color);

            return (
              <div
                key={section.id}
                className={`border-2 ${colors.border} rounded-xl overflow-hidden transition-all duration-300 ${
                  isExpanded ? "shadow-lg" : "shadow-md hover:shadow-lg"
                }`}
              >
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(section.id)}
                  className={`w-full flex items-center justify-between p-5 md:p-6 ${colors.bg} ${colors.hover} transition-colors duration-200`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`${colors.text}`}>{section.icon}</div>
                    <h2
                      className={`text-xl md:text-2xl font-bold ${colors.text} text-left`}
                    >
                      {section.title}
                    </h2>
                  </div>
                  <ChevronDown
                    className={`w-6 h-6 ${colors.text} transition-transform duration-300 flex-shrink-0 ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Section Content */}
                <div
                  className={`transition-all duration-300 ease-in-out ${
                    isExpanded
                      ? "max-h-[2000px] opacity-100"
                      : "max-h-0 opacity-0"
                  } overflow-hidden`}
                >
                  <div className="bg-white p-6 space-y-4">
                    {section.guidelines.map((guideline, index) => (
                      <div
                        key={index}
                        className="border border-slate-200 rounded-lg p-5 hover:border-slate-300 hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-slate-900 text-lg mb-2">
                              {guideline.title}
                            </h3>
                            <p className="text-slate-600 text-sm md:text-base mb-3">
                              {guideline.description}
                            </p>
                            <a
                              href={guideline.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium transition-colors group"
                            >
                              <span>Visit Resource</span>
                              <ExternalLink className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Important Note Section */}
        <div className="mt-8 bg-amber-50 border-2 border-amber-200 rounded-xl p-6 md:p-8">
          <h3 className="text-xl font-bold text-amber-900 mb-3 flex items-center gap-2">
            <span className="text-2xl">📌</span>
            Important Note
          </h3>
          <ul className="space-y-2 text-slate-700">
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold mt-1">•</span>
              <span>
                Guidelines are updated periodically by issuing bodies.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold mt-1">•</span>
              <span>
                ADP recommends professionals refer to the latest official
                versions for clinical decision‑making.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold mt-1">•</span>
              <span>
                This library is intended for education, reference, and
                professional development.
              </span>
            </li>
          </ul>
        </div>

        {/* Access Information */}
        <div className="mt-6 bg-slate-50 border border-slate-200 rounded-xl p-6 md:p-8">
          <h3 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
            <span className="text-2xl">🔐</span>
            Access
          </h3>
          <ul className="space-y-2 text-slate-700">
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">✔</span>
              <span>Open access links where available</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">✔</span>
              <span>Select premium resources may require membership/login</span>
            </li>
          </ul>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center border-t border-slate-200 pt-6">
          <p className="text-slate-600 mb-2">
            <span className="font-semibold text-slate-900">Maintained by:</span>{" "}
            Association of Dietetics Professionals (ADP), India
          </p>
          <p className="text-slate-600">
            <span className="font-semibold text-slate-900">Purpose:</span> To
            provide dietetics professionals with trusted, evidence‑based
            guidance at one place.
          </p>
        </div>
      </div>
    </div>
  );
}
