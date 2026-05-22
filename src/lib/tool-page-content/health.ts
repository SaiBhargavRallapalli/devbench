import type { ToolPageContent } from "./_types";

export const pageContentHealth: Record<string, ToolPageContent> = {
  "bmi-calculator": {
    title: "BMI Calculator — Body Mass Index Online",
    metaDescription:
      "Calculate BMI from height and weight online — metric or imperial. Shows WHO category from underweight to obese. No signup, 100% in your browser.",
    openingParagraph:
      "BMI Calculator computes your Body Mass Index using BMI = weight(kg) / height²(m²) and displays the WHO category: underweight (<18.5), normal weight (18.5–24.9), overweight (25–29.9), or obese (≥30). Switch between metric (kg/cm) and imperial (lbs/inches) units. Note that BMI is a screening tool, not a diagnostic measure. Runs entirely in your browser.",
  },

  "bmr-calculator": {
    title: "BMR Calculator — Basal Metabolic Rate Online",
    metaDescription:
      "Calculate Basal Metabolic Rate (BMR) online using Mifflin-St Jeor — enter weight, height, age, and sex. Multiply by activity to get TDEE. No signup, browser-only.",
    openingParagraph:
      "BMR Calculator computes your Basal Metabolic Rate — calories burned at complete rest — using the Mifflin-St Jeor equation, the most accurate formula for healthy adults. Enter weight, height, age, and biological sex to see your daily calorie burn at rest. Multiply by an activity factor to estimate your TDEE (Total Daily Energy Expenditure). Runs in your browser.",
  },

  "calorie-calculator": {
    title: "TDEE Calculator — Total Daily Energy Expenditure",
    metaDescription:
      "Calculate TDEE from BMR × activity level online. Useful for weight loss, maintenance, and muscle gain calorie targets. No signup, 100% in your browser.",
    openingParagraph:
      "TDEE Calculator estimates your Total Daily Energy Expenditure by multiplying your Basal Metabolic Rate (Mifflin-St Jeor) by an activity multiplier — sedentary, lightly active, moderately active, very active, or extra active. The result represents the calories needed to maintain your current weight, useful for setting deficit or surplus targets. Runs entirely in your browser.",
  },

  "water-intake-calculator": {
    title: "Water Intake Calculator — Daily Hydration Goal",
    metaDescription:
      "Calculate recommended daily water intake from body weight and exercise online. Shows in litres and glasses. No signup, 100% in your browser.",
    openingParagraph:
      "Water Intake Calculator estimates your recommended daily fluid intake based on body weight (35 ml/kg) and adds extra for exercise duration. Results shown in litres and equivalent 250 ml glasses. Useful as a daily hydration reference — actual needs vary with climate, health, and diet. Runs entirely in your browser.",
  },

  "body-fat-calculator": {
    title: "Body Fat Estimator — Calculate Body Fat % Online",
    metaDescription:
      "Estimate body fat percentage from BMI, age, and sex using the Deurenberg formula online. Note: estimate only. No signup, 100% in your browser.",
    openingParagraph:
      "Body Fat Estimator approximates body fat percentage using the Deurenberg formula from BMI, age, and biological sex. Enter height, weight, age, and sex to see the estimated body fat percentage and a general fitness category. This is a statistical estimate — DEXA scan or hydrostatic weighing is more accurate. Runs entirely in your browser.",
  },
};
