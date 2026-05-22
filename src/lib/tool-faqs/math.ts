import type { Faq } from "./_types";

export const faqsMath: Record<string, Faq[]> = {
  "quadratic-solver": [
    { q: "What is a quadratic equation?", a: "A quadratic equation is a polynomial equation of degree 2 in the form ax² + bx + c = 0, where a ≠ 0. The term 'quadratic' comes from 'quadratum' (Latin for square), referring to the x² term. Quadratic equations can have 0, 1, or 2 real solutions." },
    { q: "What is the quadratic formula?", a: "x = (−b ± √(b² − 4ac)) / 2a. The two roots are found by substituting + and − in the ± position. The solver computes both roots along with the discriminant (b² − 4ac) which determines the nature of the roots." },
    { q: "What does the discriminant tell me?", a: "If b² − 4ac > 0: two distinct real roots. If b² − 4ac = 0: one repeated real root (the parabola just touches the x-axis). If b² − 4ac < 0: two complex conjugate roots — no real solutions (the parabola does not cross the x-axis)." },
    { q: "How do I factor a quadratic equation?", a: "For x² + bx + c = 0 (with a=1): find two numbers that multiply to c and add to b — e.g. x² + 5x + 6 = (x+2)(x+3) because 2×3=6 and 2+3=5. For a≠1, use the quadratic formula to find roots r₁ and r₂, then write: a(x − r₁)(x − r₂)." },
    { q: "What are real-world uses of quadratic equations?", a: "Projectile motion (the height of a thrown ball follows h = −16t² + vt + h₀), area problems (finding a rectangle's dimensions from its area), economics (profit optimisation when revenue = price × demand), and engineering (parabolic arch and cable curves)." },
    { q: "Is my data safe here?", a: "Yes. Solving runs in your browser. Nothing is sent to a server." },
  ],

  "pythagorean-theorem": [
    { q: "What is the Pythagorean theorem?", a: "The Pythagorean theorem states that in a right-angled triangle, the square of the hypotenuse (the longest side, opposite the 90° angle) equals the sum of the squares of the other two sides: a² + b² = c². It is one of the most fundamental theorems in geometry." },
    { q: "How do I calculate the hypotenuse?", a: "If you know both legs (a and b), the hypotenuse c = √(a² + b²). For example, legs 3 and 4: c = √(9 + 16) = √25 = 5. Enter the two legs in the calculator and it computes the hypotenuse with full step-by-step working." },
    { q: "How do I find a missing leg of a right triangle?", a: "Rearrange the formula: b = √(c² − a²). For example, hypotenuse c = 13, leg a = 5: b = √(169 − 25) = √144 = 12. Enter the hypotenuse and the known leg to find the missing leg." },
    { q: "What are Pythagorean triples?", a: "Pythagorean triples are sets of three positive integers satisfying a² + b² = c². Common triples: (3, 4, 5), (5, 12, 13), (8, 15, 17), (7, 24, 25). Any integer multiple of a triple is also a triple — (6, 8, 10) is 2×(3, 4, 5). These appear frequently in homework problems and construction." },
    { q: "Where is the Pythagorean theorem used in practice?", a: "Construction (verifying right angles with the 3-4-5 rule: if the sides measure 3, 4, and 5 units, the corner is square), navigation (straight-line distance from coordinate differences), screen diagonal calculations (a 16×9 screen has diagonal √(16²+9²) = √337 ≈ 18.4 units), and physics (vector resultant magnitude)." },
    { q: "Is my data safe here?", a: "Yes. Calculation runs in your browser. Nothing is sent to a server." },
  ],

  "gcd-lcm-calculator": [
    { q: "What is the GCD (Greatest Common Divisor)?", a: "The GCD of two numbers is the largest positive integer that divides both without a remainder. GCD(12, 18) = 6 because 6 is the largest number that divides both 12 and 18. Also called Greatest Common Factor (GCF) or Highest Common Factor (HCF)." },
    { q: "What is the LCM (Least Common Multiple)?", a: "The LCM of two numbers is the smallest positive integer that is divisible by both. LCM(4, 6) = 12 because 12 is the smallest number that both 4 and 6 divide evenly. The key relationship: GCD(a, b) × LCM(a, b) = a × b." },
    { q: "How do I simplify a fraction using GCD?", a: "Divide both the numerator and denominator by their GCD. For 24/36: GCD(24, 36) = 12, so 24÷12 = 2 and 36÷12 = 3, giving the simplified fraction 2/3. The result is always in lowest terms because dividing by GCD removes all common factors." },
    { q: "How is GCD calculated (Euclidean algorithm)?", a: "GCD(a, b) = GCD(b, a mod b), repeated until the remainder is 0. Example: GCD(48, 18) → GCD(18, 12) → GCD(12, 6) → GCD(6, 0) = 6. The algorithm is efficient and works for any size integers." },
    { q: "When is LCM used in real life?", a: "Adding fractions with different denominators (find the LCD = LCM of denominators), scheduling events (if event A repeats every 4 days and B every 6 days, they coincide every LCM(4,6)=12 days), and gear ratio analysis in mechanical engineering." },
    { q: "Is my data safe here?", a: "Yes. Calculation runs in your browser. Nothing is sent to a server." },
  ],
};
