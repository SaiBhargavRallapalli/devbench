import type { Faq } from "./_types";

export const faqsFinance: Record<string, Faq[]> = {
  "simple-interest": [
    { q: "What is the simple interest formula?", a: "Simple Interest = Principal × Rate × Time, or I = P × R × T. The principal (P) is the initial amount, the rate (R) is the annual interest rate as a decimal (e.g. 8% = 0.08), and time (T) is in years. The total amount at the end is A = P + I." },
    { q: "What is the difference between simple interest and compound interest?", a: "Simple interest is calculated only on the principal amount — the interest does not accumulate on previously earned interest. Compound interest is calculated on the principal plus any interest already earned, causing the balance to grow faster over time. For the same principal, rate, and period, compound interest always results in a higher final amount than simple interest." },
    { q: "When is simple interest used in practice?", a: "Simple interest is used for short-term personal loans, auto loans, some fixed deposits, US savings bonds, and invoice financing. It is also the basis of most consumer instalment loans where the daily balance determines the interest charge." },
    { q: "How do I calculate interest for months instead of years?", a: "Divide the number of months by 12 to get the time in years. For example, 6 months = 0.5 years. Use the calculator's months input to do this automatically — it converts months to the fractional year value before applying the formula." },
    { q: "What is the maturity value?", a: "The maturity value (also called the total amount or future value) is the principal plus the total interest earned at the end of the period: A = P + I. If you invested ₹10,000 at 8% per year for 2 years, the interest is ₹1,600 and the maturity value is ₹11,600." },
  ],

  "gst-calculator": [
    { q: "What is the difference between inclusive and exclusive GST?", a: "Exclusive GST: the listed price does not include tax — tax is added on top. If the base price is ₹1000 and GST is 18%, the total is ₹1180. Inclusive GST: the listed price already includes the tax. To extract the base from ₹1180 at 18%: ₹1180 / 1.18 = ₹1000." },
    { q: "What are the GST tax slabs in India?", a: "India's GST has four main tax slabs: 5% (essential goods and services), 12% (standard goods), 18% (most services and processed goods), and 28% (luxury goods, demerit goods like tobacco and aerated drinks). Some goods like fresh food and health services are exempt (0%)." },
    { q: "What is IGST, CGST, and SGST?", a: "For inter-state transactions, IGST (Integrated GST) applies — the full rate collected by the central government. For intra-state transactions, the rate is split equally between CGST (Central GST) and SGST (State GST). A 18% intra-state transaction has 9% CGST + 9% SGST." },
    { q: "Is my data safe here?", a: "Yes. Calculation runs in your browser. Nothing is sent to a server." },
  ],

  "discount-calculator": [
    { q: "How do I calculate the final price after multiple discounts?", a: "Discounts are applied sequentially, not additively. A 20% discount followed by a 10% discount is NOT 30% off — it is: price × 0.80 × 0.90 = 72% of original (28% total reduction). Apply them one at a time using the calculator." },
    { q: "What is the difference between discount and markdown?", a: "A discount is a reduction from the listed price (the customer pays less). A markdown is a permanent reduction in the price itself (the new lower price becomes the regular price). Both reduce what the customer pays, but markdown implies the price has been permanently lowered." },
    { q: "How do I find the original price from the sale price and discount?", a: "Original = Sale price / (1 − discount%). For a ₹800 item after a 20% discount: original = 800 / (1 − 0.20) = 800 / 0.80 = ₹1000. Use the reverse mode in the calculator." },
    { q: "Is my data safe here?", a: "Yes. Calculation runs in your browser. Nothing is sent to a server." },
  ],

  "tip-calculator": [
    { q: "What is a standard tip percentage?", a: "In India, tipping is not mandatory and 10% is considered generous at restaurants. In the US, 15–20% is standard for sit-down restaurants, with 20–25% for excellent service. In the UK, 10–12.5% is standard; many restaurants add a discretionary service charge." },
    { q: "How is tip calculated on a bill?", a: "Tip = bill amount × (tip percentage / 100). Total per person = (bill + tip) / number of people. If the bill is ₹1200, tip is 15%, and 3 people split it: tip = ₹180, total = ₹1380, per person = ₹460." },
    { q: "Should tip be calculated before or after tax?", a: "In the US, tipping etiquette says to tip on the pre-tax amount, though many people tip on the total including tax for simplicity. The calculator lets you choose which amount to use as the base." },
    { q: "Is my data safe here?", a: "Yes. Calculation runs in your browser. Nothing is sent to a server." },
  ],

  "roi-calculator": [
    { q: "What does a negative ROI mean?", a: "A negative ROI means the investment lost money — the gain was less than the cost. For example, investing ₹10,000 and getting back ₹8,000 gives ROI = (8,000 − 10,000) / 10,000 = −20%." },
    { q: "What is annualised ROI and when should I use it?", a: "Simple ROI does not account for how long the investment was held. Annualised ROI normalises the return to a per-year basis using the formula: (1 + ROI)^(1/years) − 1. Use annualised ROI when comparing investments held for different periods." },
    { q: "Is ROI the same as profit margin?", a: "No. ROI measures return relative to the cost of investment. Profit margin measures profit relative to revenue. A product with ₹500 cost and ₹700 sale price has ROI = 40% and gross margin = 28.6%." },
    { q: "Is my data safe here?", a: "Yes. Calculation runs in your browser. Nothing is sent to a server." },
  ],

  "profit-loss-calculator": [
    { q: "What is gross profit vs net profit?", a: "Gross profit = revenue − cost of goods sold (COGS). Net profit = gross profit − operating expenses − taxes − interest. The P&L calculator computes gross profit margin from revenue and direct cost. For net profit, you would also subtract overhead, salaries, rent, and taxes." },
    { q: "What is a good gross margin?", a: "It varies heavily by industry. Software/SaaS: 70–90%. Retail: 20–40%. Manufacturing: 25–50%. Restaurants: 60–70% on food (but high overheads reduce net margin significantly). Compare gross margin against industry benchmarks, not absolute figures." },
    { q: "What is the difference between markup and margin?", a: "Markup is profit as a percentage of cost. Margin is profit as a percentage of revenue. If cost is ₹100 and price is ₹150: markup = 50%, margin = 33%. The P&L calculator shows both so you can communicate pricing in whichever convention your context uses." },
    { q: "Is my data safe here?", a: "Yes. Calculation runs in your browser. Nothing is sent to a server." },
  ],

  "compound-interest": [
    { q: "Why is compound interest called 'the eighth wonder of the world'?", a: "The phrase is attributed to Albert Einstein (though disputed). Compound interest grows exponentially — interest earns interest. ₹10,000 at 10% simple interest for 30 years gives ₹40,000. At 10% compound interest annually it gives ₹174,494. The longer the period, the more dramatic the difference." },
    { q: "How does compounding frequency affect returns?", a: "More frequent compounding = higher effective annual rate. ₹10,000 at 10% per year: annual compounding = ₹11,000 after 1 year; monthly compounding = ₹11,047; daily = ₹11,052. The difference matters over long periods. India's FDs compound quarterly; many US savings accounts compound daily." },
    { q: "What is the Rule of 72?", a: "Divide 72 by the annual interest rate to estimate how many years it takes to double your money. At 8% interest: 72 / 8 = 9 years to double. At 6%: 12 years. It is a quick mental approximation — the exact value uses logarithms." },
    { q: "Is my data safe here?", a: "Yes. Calculation runs in your browser. Nothing is sent to a server." },
  ],

  "loan-emi-calculator": [
    { q: "What is the EMI formula?", a: "EMI = [P × r × (1+r)^n] / [(1+r)^n − 1], where P is the principal loan amount, r is the monthly interest rate (annual rate / 12 / 100), and n is the total number of monthly instalments (tenure in months). This is the standard reducing-balance EMI formula used by banks." },
    { q: "How do I reduce my EMI amount?", a: "You can: (1) increase the tenure — longer loan means lower monthly payment but higher total interest paid; (2) make a larger down payment to reduce the principal; (3) negotiate a lower interest rate or switch to a bank offering better rates; (4) make prepayments to reduce the outstanding principal." },
    { q: "What is the total interest paid on a home loan?", a: "A ₹50 lakh loan at 8.5% for 20 years has an EMI of about ₹43,391. Over 240 months, total payments = ₹1,04,13,840. Total interest = ₹54,13,840 — more than the principal itself. Use the calculator to see this breakdown for your specific numbers." },
    { q: "Is my data safe here?", a: "Yes. Calculation runs in your browser. Nothing is sent to a server." },
  ],

  "salary-hike-calculator": [
    { q: "How is the percentage hike calculated?", a: "Hike % = ((New Salary − Old Salary) / Old Salary) × 100. For example, if your CTC goes from ₹800,000 to ₹960,000, the hike is ((960,000 − 800,000) / 800,000) × 100 = 20%." },
    { q: "Should I compare CTC or take-home salary?", a: "Compare the same figure in both cases. CTC (Cost to Company) includes employer PF contributions, gratuity, and benefits — it is the total cost to the employer. Take-home is post-tax, post-deduction cash you actually receive. Offers should be compared on CTC if one employer includes more benefits." },
    { q: "What is a good hike percentage in India?", a: "Industry benchmarks vary by sector. In India's IT sector, an average annual hike is 8–12%. Job-change hikes are typically 20–40%. Inflation adjustment hikes (to maintain purchasing power) require at least matching the CPI inflation rate." },
    { q: "Is my salary data safe here?", a: "Yes. Calculation runs in your browser. Nothing is sent to a server." },
  ],
};
