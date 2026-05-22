import type { Faq } from "./_types";

export const faqsHealth: Record<string, Faq[]> = {
  "bmi-calculator": [
    { q: "Is BMI an accurate measure of health?", a: "BMI is a population-level screening tool, not an individual health diagnostic. It does not account for muscle mass (athletes often have 'overweight' BMI), bone density, fat distribution, age, or ethnicity. A person can have a 'normal' BMI and still have metabolic risk factors. Consult a healthcare provider for a full assessment." },
    { q: "What is a healthy BMI range?", a: "WHO categories: underweight < 18.5, normal weight 18.5–24.9, overweight 25–29.9, obese ≥ 30. However, research suggests that optimal BMI ranges may differ by ethnicity — for example, the Asia-Pacific guidelines suggest overweight starts at 23 for Asian populations." },
    { q: "Why does BMI not account for muscle?", a: "BMI is calculated only from height and weight — it cannot distinguish between muscle and fat. A 90 kg bodybuilder and a 90 kg sedentary person with the same height have the same BMI despite very different body compositions and health risks." },
    { q: "Is my data safe here?", a: "Yes. Calculation runs in your browser. Nothing is sent to a server." },
  ],

  "bmr-calculator": [
    { q: "What is BMR used for?", a: "BMR is the starting point for calculating TDEE (Total Daily Energy Expenditure) — the total calories you need each day. Multiply BMR by an activity factor to get TDEE. Set calorie intake below TDEE to lose weight, above to gain, or equal to maintain." },
    { q: "Why is Mifflin-St Jeor more accurate than Harris-Benedict?", a: "The Harris-Benedict equation was developed in 1919. Mifflin-St Jeor (1990) was validated on modern populations and has been shown in multiple studies to be closer to actual measured RMR values, especially for overweight individuals. TDEE calculators on most nutrition platforms use Mifflin-St Jeor." },
    { q: "Does BMR change over time?", a: "Yes. BMR tends to decrease with age due to loss of muscle mass. It increases during illness, injury, pregnancy, and high-intensity training adaptation. Significant weight loss also reduces BMR (the 'metabolic adaptation' effect)." },
    { q: "Is my data safe here?", a: "Yes. Calculation runs in your browser. Nothing is sent to a server." },
  ],

  "calorie-calculator": [
    { q: "What does TDEE mean?", a: "TDEE (Total Daily Energy Expenditure) is the total number of calories your body burns in a day, including BMR (at rest), the thermic effect of food (digesting food), and physical activity. It is the figure you compare your calorie intake against for weight management." },
    { q: "What calorie deficit is recommended for weight loss?", a: "A deficit of 500 calories per day below TDEE produces approximately 0.5 kg (1 lb) of fat loss per week — the commonly cited sustainable rate. Aggressive deficits (>750 kcal/day) risk muscle loss, nutrient deficiencies, and metabolic adaptation. Consult a dietitian for personalised guidance." },
    { q: "Why does my calorie calculation seem off?", a: "TDEE calculators are estimates — individual metabolisms vary by 15–20% from predicted values. Use the calculated TDEE as a starting point, track actual intake and weight for 2–3 weeks, and adjust up or down based on observed results." },
    { q: "Is my data safe here?", a: "Yes. Calculation runs in your browser. Nothing is sent to a server." },
  ],

  "water-intake-calculator": [
    { q: "How much water should I drink per day?", a: "The general guideline is 35 ml per kg of body weight for an adult at rest. A 70 kg adult should aim for about 2.45 litres per day. However, actual needs vary with temperature, exercise intensity, kidney health, and diet (fruits and vegetables contribute to fluid intake)." },
    { q: "Do coffee and tea count towards water intake?", a: "Mild caffeine consumption (1–2 cups per day) has a minimal net diuretic effect — moderate amounts of coffee and tea do count towards fluid intake. Alcohol, however, is dehydrating and should not be counted." },
    { q: "What are signs of dehydration?", a: "Early signs: thirst, darker yellow urine, dry mouth, slight fatigue. Moderate: headache, dizziness, reduced concentration. Severe dehydration requires medical attention. Urine colour is a practical guide — pale yellow is well-hydrated; dark yellow or amber suggests dehydration." },
    { q: "Is my data safe here?", a: "Yes. Calculation runs in your browser. Nothing is sent to a server." },
  ],

  "body-fat-calculator": [
    { q: "How accurate is the Deurenberg body fat formula?", a: "The Deurenberg formula is a statistical estimate with a standard error of about ±3.5 percentage points. It is less accurate than DEXA scan, hydrostatic weighing, or Bod Pod measurements. Use it as a rough reference, not a clinical measurement. For athletic individuals, it tends to overestimate body fat." },
    { q: "What is a healthy body fat percentage?", a: "General guidelines: Men — essential fat 2–5%, athletes 6–13%, fitness 14–17%, acceptable 18–24%, obese ≥25%. Women — essential fat 10–13%, athletes 14–20%, fitness 21–24%, acceptable 25–31%, obese ≥32%. Ranges differ by age." },
    { q: "What is the most accurate way to measure body fat?", a: "DEXA (Dual-Energy X-ray Absorptiometry) scan is considered the gold standard, with error around ±1–2%. Hydrostatic weighing and Bod Pod are also accurate. Skinfold calipers (with trained operator) are moderately accurate. Smart scales using bioelectrical impedance are the least accurate." },
    { q: "Is my data safe here?", a: "Yes. Estimation runs in your browser. Nothing is sent to a server." },
  ],
};
