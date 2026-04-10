"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Bar, BarChart, Cell, Pie, PieChart, XAxis, YAxis } from "recharts";
import { Download, Eye, Printer, UtensilsCrossed } from "lucide-react";
import { ADPSpinner } from "@/components/ui/adp-spinner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type GoalOption = "fat-loss" | "maintenance" | "muscle-gain";
type PreferenceOption = "north-indian" | "south-indian" | "jain" | "sattvic" | "keto-indian";
type ClinicalModifier = "none" | "pcos" | "diabetes" | "hypothyroid" | "hypertension" | "uric-acid";

const macroChartConfig = {
  grams: {
    label: "Grams",
    color: "#10b981",
  },
} satisfies ChartConfig;

const mealChartConfig = {
  value: {
    label: "Calories",
    color: "#059669",
  },
  "Early Morning": {
    label: "Early Morning",
    color: "#047857",
  },
  Breakfast: {
    label: "Breakfast",
    color: "#10b981",
  },
  "Mid-Morning": {
    label: "Mid-Morning",
    color: "#34d399",
  },
  Lunch: {
    label: "Lunch",
    color: "#0f766e",
  },
  "Evening Snack": {
    label: "Evening Snack",
    color: "#14b8a6",
  },
  Dinner: {
    label: "Dinner",
    color: "#0d9488",
  },
  "Post-Dinner": {
    label: "Post-Dinner",
    color: "#0f766e",
  },
} satisfies ChartConfig;

const tierColors = ["#10b981", "#059669", "#047857", "#0f766e", "#14b8a6", "#34d399", "#0d9488"];

const dietPreferenceRecommendations: Record<PreferenceOption, string[]> = {
  "north-indian": [
    "Include seasonal sabzi with 1-2 katoris of Dal (Moong/Toor/Chana) for lunch.",
    "Use Phulka/Roti made of whole wheat or multigrain (bajra/jowar) as complex carbs.",
    "Add 1 katori fresh Dahi (curd) or Chaas to support gut health and cooling.",
  ],
  "south-indian": [
    "Balance rice/idli portions with generous Sambhar and Poriyal (dry vegetable).",
    "Replace simple white rice with unpolished rice, or use Millets/Oats for dosa/upma.",
    "Limit coconut oil/chutney portions; use buttermilk (Neer Mor) for hydration.",
  ],
  jain: [
    "Substitute root vegetables (onion, garlic, potato) with raw banana, bottle gourd (Lauki), or jackfruit.",
    "Increase reliance on sprouted moong, chana, and paneer for adequate protein intake.",
    "Ensure meals are consumed before sunset adhering to Jain dietary principles.",
  ],
  sattvic: [
    "Focus on fresh, light foods like fruits, nuts, seeds, and light dairies.",
    "Avoid pungent and highly spiced items minimizing onion, garlic, and heavy oils.",
    "Incorporate freshly cooked grains and steamed seasonal vegetables.",
  ],
  "keto-indian": [
    "Base meals on Paneer, Tofu, Eggs (if acceptable), or non-veg cooked in Ghee/Butter.",
    "Swap rotis with almond/coconut flour variations or cauliflower rice.",
    "Include high-fiber low-carb veggies like palak, methi, capsicum, and bhindi.",
  ],
};

const clinicalRecommendations: Record<ClinicalModifier, string[]> = {
  none: [],
  pcos: [
    "Focus on low glycemic index (GI) foods to manage insulin resistance.",
    "Include 1 tbsp flax seeds or pumpkin seeds daily for hormonal balance.",
    "Add a cup of spearmint or green tea as a mid-morning/evening beverage.",
  ],
  diabetes: [
    "Strictly monitor carbohydrate portions per meal (approx 30-45g max).",
    "Include methi (fenugreek) soaked water in the early morning.",
    "Pair every high-carb item with adequate fiber (salad) and protein (dal/paneer/curd).",
  ],
  hypothyroid: [
    "Limit raw goitrogenic vegetables like cabbage, cauliflower, and broccoli (cook them well).",
    "Ensure adequate intake of selenium and zinc (brazil nuts, sunflower seeds).",
    "Use iodized salt or sea salt in moderation.",
  ],
  hypertension: [
    "Restrict sodium intake; avoid papad, pickles, and processed Namkeens.",
    "Boost potassium naturally with coconut water, bananas, and green leafy vegetables.",
    "Use DASH diet principles adapted to local Indian cuisine.",
  ],
  "uric-acid": [
    "Limit purine-rich foods like whole dals, rajma, chana, and spinach.",
    "Increase hydration to 3-4 liters of water to flush out excess uric acid.",
    "Avoid organ meats, alcohol, and refined sugars.",
  ]
};

const goalCopy: Record<GoalOption, string> = {
  "fat-loss": "Create a high-satiety structure with steady protein, visible vegetables, and measured energy intake.",
  maintenance: "Keep energy balanced and meal timing consistent to sustain performance and routine adherence.",
  "muscle-gain": "Use calorie-dense but clean meals with regular protein distribution across the day.",
};

const mealTemplates: Record<number, { name: string; ratio: number; typicalFormat: string }[]> = {
  3: [
    { name: "Breakfast", ratio: 0.3, typicalFormat: "1 Bowl Upma / 2 Poha + 1 Glass Milk/Tea" },
    { name: "Lunch", ratio: 0.4, typicalFormat: "2 Roti + 1 Katori Sabzi + 1 Katori Dal + Salad" },
    { name: "Dinner", ratio: 0.3, typicalFormat: "1 Katori Rice/Khichdi + 1 Katori Dal + Veg" },
  ],
  5: [
    { name: "Early Morning", ratio: 0.05, typicalFormat: "1 Glass Jeera/Methi Water + 5 Almonds" },
    { name: "Breakfast", ratio: 0.25, typicalFormat: "2 Idli/Dosa + Sambhar / 1 Stuffed Paratha" },
    { name: "Lunch", ratio: 0.35, typicalFormat: "2 Phulka + 1 Katori Sabzi + 1 Katori Dal + Curd" },
    { name: "Evening Snack", ratio: 0.1, typicalFormat: "1 Cup Tea/Coffee + 1 Katori Roasted Makhana" },
    { name: "Dinner", ratio: 0.25, typicalFormat: "1 Katori Pulao + 1 Katori Kadhi / Sabzi" },
  ],
  7: [
    { name: "Early Morning", ratio: 0.05, typicalFormat: "Warm Lemon Water + 2 Walnuts" },
    { name: "Breakfast", ratio: 0.2, typicalFormat: "1 Bowl Oats/Dalia + Protein (Paneer/Egg)" },
    { name: "Mid-Morning", ratio: 0.1, typicalFormat: "1 Seasonal Fruit / 1 Glass Buttermilk" },
    { name: "Lunch", ratio: 0.25, typicalFormat: "1 Roti + 1 Katori Sabzi + 1 Katori Dahi" },
    { name: "Evening Snack", ratio: 0.1, typicalFormat: "1 Cup Green Tea + Handful Chana" },
    { name: "Dinner", ratio: 0.2, typicalFormat: "1 Katori Soup + Tossed Veggies" },
    { name: "Post-Dinner", ratio: 0.05, typicalFormat: "1/2 Glass Haldi/Turmeric Milk" },
  ],
};

export function ProfessionalTools() {
  const [clientName, setClientName] = useState("Client Name");
  const [age, setAge] = useState(32);
  const [weight, setWeight] = useState(68);
  const [height, setHeight] = useState(168);
  const [calories, setCalories] = useState(1800);
  const [mealsPerDay, setMealsPerDay] = useState("5");
  const [goal, setGoal] = useState<GoalOption>("maintenance");
  const [preference, setPreference] = useState<PreferenceOption>("north-indian");
  const [clinicalCondition, setClinicalCondition] = useState<ClinicalModifier>("none");
  const [proteinPercent, setProteinPercent] = useState(25);
  const [carbPercent, setCarbPercent] = useState(45);
  const [fatPercent, setFatPercent] = useState(30);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const [customSections, setCustomSections] = useState<{title: string, content: string}[]>([]);
  const [mealPlanOverrides, setMealPlanOverrides] = useState<Record<string, string>>({});

  const handleMealPlanOverride = (mealName: string, format: string) => {
    setMealPlanOverrides(prev => ({ ...prev, [mealName]: format }));
  };

  const addCustomSection = () => {
    setCustomSections([...customSections, { title: "New Section", content: "Section content goes here..." }]);
  };
  
  const updateCustomSection = (index: number, key: 'title'|'content', value: string) => {
    const newSections = [...customSections];
    newSections[index][key] = value;
    setCustomSections(newSections);
  };
  
  const removeCustomSection = (index: number) => {
    setCustomSections(customSections.filter((_, i) => i !== index));
  };

  const normalizedProteinPercent = proteinPercent;
  const normalizedCarbPercent = carbPercent;
  const normalizedFatPercent = fatPercent;
  const proteinGrams = Math.round((calories * normalizedProteinPercent) / 100 / 4);
  const carbGrams = Math.round((calories * normalizedCarbPercent) / 100 / 4);
  const fatGrams = Math.round((calories * normalizedFatPercent) / 100 / 9);
  const bmi = Number((weight / ((height / 100) * (height / 100))).toFixed(1));
  const macroData = [
    { name: "Protein", grams: proteinGrams, fill: "#10b981" },
    { name: "Carbs", grams: carbGrams, fill: "#0f766e" },
    { name: "Fat", grams: fatGrams, fill: "#14b8a6" },
  ];
  const mealPlan = (mealTemplates[Number(mealsPerDay)] ?? mealTemplates[5]).map((entry, index) => ({
    ...entry,
    typicalFormat: mealPlanOverrides[entry.name] ?? entry.typicalFormat,
    calories: Math.round(calories * entry.ratio),
    fill: tierColors[index % tierColors.length],
  }));
  const recommendations = dietPreferenceRecommendations[preference];
  const clinicalNotes = clinicalRecommendations[clinicalCondition];

  const handleMacroChange = (type: "protein" | "carb" | "fat", value: number) => {
    const safeValue = Math.max(10, Math.min(70, value));

    if (type === "protein") {
      const remainder = 100 - safeValue;
      const currentOther = carbPercent + fatPercent;
      const nextCarb = Math.round((carbPercent / currentOther) * remainder);
      setProteinPercent(safeValue);
      setCarbPercent(nextCarb);
      setFatPercent(remainder - nextCarb);
      return;
    }

    if (type === "carb") {
      const remainder = 100 - safeValue;
      const currentOther = proteinPercent + fatPercent;
      const nextProtein = Math.round((proteinPercent / currentOther) * remainder);
      setCarbPercent(safeValue);
      setProteinPercent(nextProtein);
      setFatPercent(remainder - nextProtein);
      return;
    }

    const remainder = 100 - safeValue;
    const currentOther = proteinPercent + carbPercent;
    const nextProtein = Math.round((proteinPercent / currentOther) * remainder);
    setFatPercent(safeValue);
    setProteinPercent(nextProtein);
    setCarbPercent(remainder - nextProtein);
  };

  const generatePDF = async () => {
    if (!previewRef.current) {
      return null;
    }

    setIsGenerating(true);
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);

      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
      });

      const imageData = canvas.toDataURL("image/png");
      const document = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: "a4",
      });
      const pageWidth = document.internal.pageSize.getWidth();
      const pageHeight = (canvas.height * pageWidth) / canvas.width;

      document.addImage(imageData, "PNG", 0, 0, pageWidth, pageHeight);
      return { document, imageData };
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePreview = async () => {
    setIsPreviewOpen(true);
    const generated = await generatePDF();
    if (generated) {
      setPreviewImageUrl(generated.imageData);
    } else {
      setIsPreviewOpen(false);
    }
  };

  const exportChart = async () => {
    const generated = await generatePDF();
    if (generated) {
      generated.document.save(`${clientName.replace(/\s+/g, "-").toLowerCase()}-diet-chart.pdf`);
    }
  };

  return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
                  <UtensilsCrossed className="h-6 w-6 text-emerald-600" />
                  Diet Chart Generator
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  Build and export branded diet plans for your clients.
                </p>
              </div>
              <div className="flex gap-3 no-print">
                <Button variant="outline" onClick={() => window.print()}>
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
                <Dialog
                  open={isPreviewOpen}
                  onOpenChange={(open) => {
                    setIsPreviewOpen(open);
                    if (!open) {
                      setPreviewImageUrl(null);
                    }
                  }}
                >
                  <Button variant="outline" onClick={handlePreview} disabled={isGenerating}>
                    <Eye className="h-4 w-4 mr-2" />
                    {isGenerating ? "Generating..." : "Preview"}
                  </Button>
                  <DialogContent className="max-w-none w-[95vw] h-[95vh] flex flex-col p-6">
                    <DialogHeader>
                      <DialogTitle>PDF Preview</DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 w-full bg-slate-100 rounded-lg overflow-auto border border-slate-200 min-h-0">
                      {isGenerating || !previewImageUrl ? (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-slate-500">
                          <ADPSpinner size="sm" />
                          <p>Generating high-quality preview...</p>
                        </div>
                      ) : (
                        <div className="h-full w-full overflow-auto bg-slate-200/60 p-4">
                          <img
                            src={previewImageUrl}
                            alt="Diet chart preview"
                            className="block mx-auto h-auto rounded-md bg-white shadow-sm"
                            style={{ display: "block" }}
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-2">
                      <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={exportChart} className="bg-emerald-600 text-white hover:bg-emerald-700" disabled={isGenerating}>
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button onClick={exportChart} className="bg-emerald-600 text-white hover:bg-emerald-700" disabled={isGenerating}>
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
              </div>
            </div>

            <div className="grid gap-6 grid-cols-1 xl:grid-cols-2 items-start">
              {/* Form */}
              <div className="space-y-4 flex flex-col max-h-[calc(100vh-10rem)] overflow-y-auto pr-1">
                <Card className="shadow-sm border-slate-200">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base text-slate-800">Client Profile</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="client-name">Client name</Label>
                      <Input id="client-name" value={clientName} onChange={(event) => setClientName(event.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="age">Age</Label>
                        <Input id="age" type="number" value={age} onChange={(event) => setAge(Number(event.target.value) || 0)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="weight">Weight (kg)</Label>
                        <Input id="weight" type="number" value={weight} onChange={(event) => setWeight(Number(event.target.value) || 0)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="height">Height (cm)</Label>
                        <Input id="height" type="number" value={height} onChange={(event) => setHeight(Number(event.target.value) || 0)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="calories">Target (kcal)</Label>
                        <Input id="calories" type="number" value={calories} onChange={(event) => setCalories(Number(event.target.value) || 0)} />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-200">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base text-slate-800">Diet Strategy</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Goal</Label>
                      <Select value={goal} onValueChange={(value) => setGoal(value as GoalOption)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select goal" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fat-loss">Fat loss</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                          <SelectItem value="muscle-gain">Muscle gain</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Diet Preference</Label>
                      <Select value={preference} onValueChange={(value) => setPreference(value as PreferenceOption)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select preference" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="north-indian">North Indian</SelectItem>
                          <SelectItem value="south-indian">South Indian</SelectItem>
                          <SelectItem value="jain">Jain</SelectItem>
                          <SelectItem value="sattvic">Sattvic</SelectItem>
                          <SelectItem value="keto-indian">Keto (Indian)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Clinical Condition</Label>
                      <Select value={clinicalCondition} onValueChange={(value) => setClinicalCondition(value as ClinicalModifier)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="pcos">PCOS/PCOD</SelectItem>
                          <SelectItem value="diabetes">Type 2 Diabetes</SelectItem>
                          <SelectItem value="hypothyroid">Hypothyroid</SelectItem>
                          <SelectItem value="hypertension">Hypertension</SelectItem>
                          <SelectItem value="uric-acid">Uric Acid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Meals per day</Label>
                      <Select value={mealsPerDay} onValueChange={setMealsPerDay}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select meal count" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">3 meals</SelectItem>
                          <SelectItem value="5">5 meals</SelectItem>
                          <SelectItem value="7">7 meals</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-200">
                  <CardHeader className="pb-4 flex flex-row items-center justify-between">
                    <CardTitle className="text-base text-slate-800">Macros (%)</CardTitle>
                    <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                      Total: {proteinPercent + carbPercent + fatPercent}%
                    </span>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-2">
                        <Label htmlFor="protein-percent" className="text-xs text-center block text-emerald-700">Protein</Label>
                        <Input id="protein-percent" type="number" className="text-center" value={proteinPercent} onChange={(event) => handleMacroChange("protein", Number(event.target.value) || 0)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="carb-percent" className="text-xs text-center block text-teal-700">Carbs</Label>
                        <Input id="carb-percent" type="number" className="text-center" value={carbPercent} onChange={(event) => handleMacroChange("carb", Number(event.target.value) || 0)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="fat-percent" className="text-xs text-center block text-emerald-600">Fat</Label>
                        <Input id="fat-percent" type="number" className="text-center" value={fatPercent} onChange={(event) => handleMacroChange("fat", Number(event.target.value) || 0)} />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-200">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base text-slate-800">Dietary Schedule Options</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                     {mealPlan.map(meal => (
                       <div key={meal.name} className="space-y-1">
                         <Label className="text-xs text-slate-500 font-semibold">{meal.name} <span className="font-normal">({meal.calories} kcal)</span></Label>
                         <Input 
                           value={meal.typicalFormat} 
                           onChange={(e) => handleMealPlanOverride(meal.name, e.target.value)} 
                           className="h-8 text-sm"
                         />
                       </div>
                     ))}
                  </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-200">
                  <CardHeader className="pb-4 flex flex-row items-center justify-between">
                    <CardTitle className="text-base text-slate-800">Custom Sections</CardTitle>
                    <Button variant="outline" size="sm" onClick={addCustomSection} className="h-7 text-xs">Add Section</Button>
                  </CardHeader>
                  <CardContent className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                     {customSections.map((section, index) => (
                       <div key={index} className="space-y-2 border-b border-slate-100 pb-4 mb-4 last:border-b-0 last:pb-0 last:mb-0">
                         <div className="flex items-center justify-between gap-2">
                            <Input 
                              value={section.title} 
                              onChange={e => updateCustomSection(index, 'title', e.target.value)} 
                              className="font-semibold text-sm h-8 flex-1" 
                              placeholder="Section Title"
                            />
                            <Button variant="ghost" size="sm" onClick={() => removeCustomSection(index)} className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 px-2 text-xs">Remove</Button>
                         </div>
                         <textarea 
                           className="flex w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-50 min-h-[60px]"
                           value={section.content} 
                           onChange={e => updateCustomSection(index, 'content', e.target.value)}
                           placeholder="Section content goes here..."
                         />
                       </div>
                     ))}
                     {customSections.length === 0 && <p className="text-xs text-slate-500 text-center py-2">No custom sections added. Click &lsquo;Add Section&rsquo; to include extra guidelines, notes, or schedules.</p>}
                  </CardContent>
                </Card>

                <div className="grid gap-4 mt-auto">
                    <Card className="border-slate-200 shadow-none bg-slate-50/50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Macro Grams Allocation</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ChartContainer config={macroChartConfig} className="h-[140px] w-full">
                          <BarChart data={macroData}>
                            <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="grams" radius={[4, 4, 0, 0]} maxBarSize={40}>
                              {macroData.map((entry) => (
                                <Cell key={entry.name} fill={entry.fill} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ChartContainer>
                      </CardContent>
                    </Card>
                </div>
              </div>

              {/* Preview */}
                <div className="xl:sticky xl:top-20 xl:self-start xl:max-h-[calc(100vh-6rem)] xl:overflow-y-auto">
                  <div ref={previewRef} className="mx-auto w-full overflow-hidden bg-white shadow-lg border-t-8 border-emerald-600">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-200 pb-6 mb-6 pt-10 px-10">
                      <div className="flex items-center gap-4">
                        <Image src="/ADP.svg" alt="ADP Logo" width={56} height={56} className="h-14 w-14 text-emerald-600" />
                        <div>
                          <h1 className="text-slate-900 text-2xl font-bold tracking-tight mb-1">Association of Dietetics Professionals</h1>
                          <p className="text-emerald-700 text-xs tracking-[0.15em] uppercase font-semibold">Official Clinical Dietary Protocol</p>
                        </div>
                      </div>
                    </div>

                    <div className="px-10 pb-10">
                      {/* Patient Info Grid */}
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-8 bg-slate-50 p-6 border border-slate-200 mb-8 rounded-md">
                        <div className="flex flex-col border-b border-dashed border-slate-200 pb-2">
                          <span className="font-semibold text-slate-500 text-[10px] uppercase tracking-wider mb-1">Patient Name</span>
                          <span className="font-medium text-slate-900 text-sm">{clientName}</span>
                        </div>
                        <div className="flex flex-col border-b border-dashed border-slate-200 pb-2">
                          <span className="font-semibold text-slate-500 text-[10px] uppercase tracking-wider mb-1">Date of Assessment</span>
                          <span className="font-medium text-slate-900 text-sm">{new Date().toLocaleDateString('en-GB')}</span>
                        </div>
                        <div className="flex flex-col border-b border-dashed border-slate-200 pb-2">
                          <span className="font-semibold text-slate-500 text-[10px] uppercase tracking-wider mb-1">Primary Objective</span>
                          <span className="font-medium text-slate-900 text-sm capitalize">{goal.replace('-', ' ')}</span>
                        </div>
                        <div className="flex flex-col border-b border-dashed border-slate-200 pb-2">
                          <span className="font-semibold text-slate-500 text-[10px] uppercase tracking-wider mb-1">Demographics</span>
                          <span className="font-medium text-slate-900 text-sm">{age} yrs, {weight}kg, BMI {bmi}</span>
                        </div>
                        <div className="flex flex-col border-b border-dashed border-slate-200 pb-2">
                          <span className="font-semibold text-slate-500 text-[10px] uppercase tracking-wider mb-1">Target Caloric Intake</span>
                          <span className="font-medium text-slate-900 text-sm">{calories} kcal/day</span>
                        </div>
                        <div className="flex flex-col border-b border-dashed border-slate-200 pb-2">
                          <span className="font-semibold text-slate-500 text-[10px] uppercase tracking-wider mb-1">Macro Distribution</span>
                          <span className="font-medium text-slate-900 text-sm">{carbPercent}% C | {proteinPercent}% P | {fatPercent}% F</span>
                        </div>
                      </div>

                      {/* Dietary Schedule Table */}
                      <h2 className="text-slate-900 font-serif text-lg border-b border-slate-200 pb-2 mb-4">Prescribed Dietary Schedule</h2>
                      
                      <div className="overflow-x-auto mb-8">
                        <table className="w-full text-left text-sm border-collapse">
                          <thead>
                            <tr>
                              <th className="bg-slate-50 text-slate-500 font-semibold uppercase text-xs p-3 border-b border-slate-200">Meal Window</th>
                              <th className="bg-slate-50 text-slate-500 font-semibold uppercase text-xs p-3 border-b border-slate-200">Prescribed Nutrition</th>
                              <th className="bg-slate-50 text-slate-500 font-semibold uppercase text-xs p-3 border-b border-slate-200">Energy</th>
                            </tr>
                          </thead>
                          <tbody>
                            {mealPlan.map((meal, idx) => (
                              <tr key={meal.name} className={idx === mealPlan.length - 1 ? "border-b-2 border-slate-200" : ""}>
                                <td className="p-3 border-b border-slate-200 text-teal-700 font-semibold whitespace-nowrap">{meal.name}</td>
                                <td className="break-words p-3 border-b border-slate-200 text-slate-700">{meal.typicalFormat}</td>
                                <td className="p-3 border-b border-slate-200 text-slate-600">{meal.calories} kcal</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Guidelines */}
                      <div className="mb-10">
                        <h2 className="text-slate-900 font-serif text-lg border-b border-slate-200 pb-2 mb-4">Clinical Recommendations & Guidelines</h2>
                        <ul className="list-none pl-0 space-y-2 text-sm text-slate-700">
                          {recommendations.map((rec, i) => (
                            <li key={i} className="relative pl-5">
                              <span className="absolute left-0 text-teal-600 font-bold">•</span>
                              {rec}
                            </li>
                          ))}
                          {clinicalCondition !== "none" && clinicalNotes.map((note, i) => (
                            <li key={`clin-${i}`} className="relative pl-5 font-medium text-amber-800">
                              <span className="absolute left-0 text-amber-600 font-bold">•</span>
                              [{clinicalCondition.toUpperCase()} NOTE]: {note}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Custom Sections */}
                      {customSections.map((section, idx) => (
                         <div className="mb-10 overflow-hidden" key={`print-section-${idx}`}>
                           <h2 className="mb-4 break-words border-b border-slate-200 pb-2 font-serif text-lg text-slate-900">{section.title}</h2>
                           <p className="whitespace-pre-wrap break-words text-sm text-slate-700">{section.content}</p>
                         </div>
                      ))}

                      {/* Footer Signature */}
                      <div className="flex justify-between items-end mt-12 pt-6 border-t border-slate-200">
                        <div className="max-w-xs">
                          <p className="text-xs text-slate-500 italic leading-relaxed">
                            Confidentiality Notice: This medical nutrition therapy plan is highly individualized based on member consultation. Do not share or apply to individuals other than the intended patient.
                          </p>
                        </div>
                        <div className="w-64 text-center">
                          <div className="border-b border-slate-900 h-10 mb-2"></div>
                          <p className="text-sm font-bold text-slate-900">Registered Dietician</p>
                          <p className="text-xs text-slate-500">&copy; {new Date().getFullYear()} Association of Dietetics Professionals</p>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>
  );
}