import type { ToolPageContent } from "./_types";
export type { ToolPageContent };

import { pageContentEncoding } from "./encoding";
import { pageContentJson } from "./json";
import { pageContentText } from "./text";
import { pageContentDev } from "./dev";
import { pageContentDatetime } from "./datetime";
import { pageContentConversion } from "./conversion";
import { pageContentFinance } from "./finance";
import { pageContentHealth } from "./health";
import { pageContentImage } from "./image";
import { pageContentMath } from "./math";
import { pageContentPdf } from "./pdf";

export const TOOL_PAGE_CONTENT: Record<string, ToolPageContent> = {
  ...pageContentEncoding,
  ...pageContentJson,
  ...pageContentText,
  ...pageContentDev,
  ...pageContentDatetime,
  ...pageContentConversion,
  ...pageContentFinance,
  ...pageContentHealth,
  ...pageContentImage,
  ...pageContentMath,
  ...pageContentPdf,
};
