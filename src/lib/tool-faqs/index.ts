import type { Faq } from "./_types";
export type { Faq };

import { faqsEncoding } from "./encoding";
import { faqsJson } from "./json";
import { faqsText } from "./text";
import { faqsDev } from "./dev";
import { faqsDatetime } from "./datetime";
import { faqsConversion } from "./conversion";
import { faqsFinance } from "./finance";
import { faqsHealth } from "./health";
import { faqsImage } from "./image";
import { faqsMath } from "./math";
import { faqsPdf } from "./pdf";
import { faqsMisc } from "./misc";

export const TOOL_FAQS: Record<string, Faq[]> = {
  ...faqsEncoding,
  ...faqsJson,
  ...faqsText,
  ...faqsDev,
  ...faqsDatetime,
  ...faqsConversion,
  ...faqsFinance,
  ...faqsHealth,
  ...faqsImage,
  ...faqsMath,
  ...faqsPdf,
  ...faqsMisc,
};
