export type Patient = "adult" | "paed";

export type Step = {
  n: number;
  title: string;
  color: "step1" | "step2" | "step3" | "step4";
  question: string;
  hint?: string;
  finding: string;
  action: Record<Patient, string[]>;
  note?: string[];
};

export const REPEAT = "If bleeding persists, repeat TEG at 30 to 60 mins or with every round of MHP.";

export const STEPS: Step[] = [
  {
    n: 1,
    title: "Fibrinogen deficiency",
    color: "step1",
    question: "Is CFF A10 or MA < 15 mm?",
    finding: "Low fibrinogen",
    action: {
      adult: ["9 units Cryoprecipitate", "OR 3 g Fibrinogen concentrate (RiaSTAP®)"],
      paed: ["Cryoprecipitate 5 mL/kg", "OR Fibrinogen concentrate (RiaSTAP®) 40 mg/kg"],
    },
    note: ["Fibrinogen concentrate is available from: Blood Bank, SCUH resus PYXIS fridge, SCUH OR1+2 PYXIS fridge."],
  },
  {
    n: 2,
    title: "Platelet deficiency / disorder",
    color: "step2",
    question: "Is CFF MA normal and CRT MA < 50 mm?",
    finding: "Platelet deficit or disorder",
    action: {
      adult: ["1 unit Platelets (1 dose = 1 pooled bag; consider 1–2 doses)"],
      paed: ["Platelets 10 mL/kg (TEG Manager guidance: 10–15 mL/kg, max 1 bag)"],
    },
  },
  {
    n: 3,
    title: "Coagulation factor deficiency / disorder",
    color: "step3",
    question: "Is CKH R > 10 mins?",
    hint: "First ensure no evidence of heparin effect (CKH R < CK R).",
    finding: "Coagulation factor deficit or disorder",
    action: {
      adult: ["2 units Plasma (FFP/ELP)", "OR 10–15 units/kg Prothrombin Complex Concentrate"],
      paed: ["Plasma 15 mL/kg (max 2 bags)", "PCC is for adults only"],
    },
    note: [
      "Heparin effect: if CK R is prolonged but CKH R is normal (< 9.1 min), consider protamine reversal — refer to the QH Anticoagulant Guideline for Hospitalised Adult Patients for dosing.",
    ],
  },
  {
    n: 4,
    title: "Fibrinolysis",
    color: "step4",
    question: "Is CRT LY30 > 2.6%?",
    finding: "Hyperfibrinolysis",
    action: {
      adult: ["Tranexamic acid 1 g IV loading dose over 10 mins", "THEN 1 g IV maintenance over 8 hrs"],
      paed: ["Tranexamic acid 15 mg/kg IV over 10 mins (max 1 g)", "THEN 15 mg/kg IV over 8 hrs (max 1 g)"],
    },
  },
];
