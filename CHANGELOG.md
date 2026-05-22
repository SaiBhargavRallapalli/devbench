# Changelog

> Generated from git log. Refresh with `npm run changelog` or the **Update changelog** GitHub Action.

## 2026-05-22

### Added
- enhance ESLint and Lighthouse configurations, add test coverage (`93ed65e`)

### Chore
- update README and changelog script for clarity and usage instructions (`0708177`)
- update CHANGELOG.md to reflect correct commit hash for ESLint and Lighthouse enhancements (`24896bd`)

## 2026-05-21

### Added
- add PortholePromo component and update footer links (`ca8b847`)
- integrate JSONPath support and enhance JSON handling capabilities (`3d668c1`)
- add jsonrepair library for enhanced JSON handling (`d67b2ec`)
- add JSONC and JWT decoding, enhance JSON export options (`41635fd`)

### Changed
- remove JSONPath support from JSON toolkit (`fbcb987`)
- enhance JSON toolkit and workspace components (`aa321c3`)
- Update CHANGELOG.md to reflect the correct commit hash for jsonrepair library integration (`f68e403`)

### Chore
- update CHANGELOG.md to correct JSONPath removal commit hash (`b386e40`)

## 2026-05-20

### Added
- Add functions to handle invalid JSON escape sequences and JavaScript string concatenation (`5405fd3`)

### Fixed
- improve CI workflow with proper server startup and Lighthouse handling (`0bf61b6`)
- improve lighthouserc.json with better server handling and more realistic thresholds (`30a425f`)
- add lighthouserc.json with relaxed Lighthouse assertions to fix CI failures (`81e0ed5`)

### Changed
- Fix Lighthouse CI assertions by disabling strict optimization checks (`33df4d6`)
- Refactor RegexTesterTool to improve result handling and performance (`83c1d47`)
- Enhance performance metrics and accessibility checks in Lighthouse configuration (`53cc767`)
- Refactor form components to improve accessibility and usability (`d7c47ce`)
- Integrate bundle analyzer and enhance build scripts (`859d7f4`)
- Enhance sitemap and blog metadata handling (`5dc4d1b`)

## 2026-05-19

### Added
- Add copyright notice to multiple files and update metadata in layout.tsx (`0b21b83`)

### Changed
- Refactor state management and loading logic in multiple components (`41ccec5`)
- Update CSP configuration, enhance package.json, and improve service worker functionality (`b8a13ec`)
- Enhance JSON input editor with active line tracking and bracket overlay (`ddd1bf3`)
- Quote unquoted template variables in JSON parsing (`c01db2c`)
- Enhance bracket matching visualization in JSON toolkit (`eb13196`)
- Update vitest configuration and remove middleware (`40aa6c3`)
- Enhance JSON parsing capabilities with improved error handling (`cb231e2`)
- Implement bracket matching and deep JSON parsing enhancements (`96bab77`)
- Enhance ESLint configuration and update dependencies (`70ec28b`)

## 2026-05-18

### Added
- Add new tools and enhance image processing features (`4849c1b`)

### Changed
- Update dependencies and enhance clipboard functionality (`f5d06cb`)
- Enhance image processing tools with dimension validation and error handling (`ac95993`)
- Refactor color tools and enhance clipboard functionality (`15b879e`)
- Update Go playground API endpoint to use new URL (`eac9bcb`)

## 2026-05-16

### Added
- Add Footer component to various tool layouts (`c05f582`)

### Changed
- Enhance tool page functionality and expand tool offerings (`71454ac`)
- Enhance About and Privacy pages with detailed content updates (`ef60b8e`)
- Update screenshot URLs and add new tools to the workspace registry (`443dde1`)
- Update tool listings and add new blog posts for enhanced user guidance (`44b6e62`)
- Rename AES FAQ entry for clarity and consistency (`4696fbe`)

## 2026-05-15

### Added
- Add embed functionality and enhance security headers for tool pages (`9818028`)

### Changed
- Update Morse code tool FAQs and page content for clarity and SEO (`08ac8f6`)
- Update metadata and enhance page structure for improved clarity and SEO (`67566e6`)
- Enhance tool accessibility and performance (`146c91c`)

## 2026-05-14

### Added
- sign and verify RS/ES/EdDSA, not just HMAC (`a04b1d8`)
- Add 'Code playground' entry to devbench workspaces (`de23869`)

### Fixed
- stop render loop blocking nav clicks on /graph-calculator (#15) (`b1f6ac3`)
- stop render loop blocking nav clicks on /graph-calculator (`3ef7c5b`)

### Changed
- Enhance tool layouts with structured data and FAQ integration (`66ef211`)
- Enhance tool metadata and FAQs for API Tester, Cron Editor, and Epoch Converter (`ae9adbf`)
- Update CHANGELOG with recent additions, fixes, and changes (`778cb94`)
- Merge branch 'SaiBhargavRallapalli:main' into main (`cf17603`)
- Update issue templates (`f7eb120`)
- Merge pull request #12 from sharathrgupta-dev/main (`f847e6e`)
- Merge branch 'main' into main (`1869eb0`)

## 2026-05-13

### Added
- Add CI workflow for Python and Node.js projects (`370b8cc`)
- add Webhook Payload Simulator workspace (`e875aeb`)
- Add CI workflow for Node.js checks (`4a1c438`)
- integrate Playwright for end-to-end testing and update dependencies (`a583068`)

### Changed
- Implement code playground enhancements and routing updates (`086f6c5`)
- Enhance playground functionality with Go support and improved user experience (`233a684`)
- Update CSP in next.config.ts and enhance package dependencies (`177a14c`)
- Merge pull request #2 from sharathrgupta-dev/claude/lucid-driscoll-67d1a1 (`beb4041`)
- Merge branch 'SaiBhargavRallapalli:main' into main (`c64b837`)
- Merge branch 'main' of https://github.com/SaiBhargavRallapalli/all-in-one (`6434b40`)
- Update CHANGELOG with recent CI enhancements and dependency updates (`8c89eae`)
- Update CHANGELOG with recent CI enhancements and dependency updates (`c475574`)
- Update CI workflow to continue on lint errors (`6710977`)
- Refactor CI workflow to consolidate jobs (`b8cb2eb`)
- Delete ci.yml (`ee0512f`)
- Enhance README with additional badges (`4bfb0fe`)
- Merge pull request #1 from SaiBhargavRallapalli/main (`eb53707`)
- AWS lambda sandbox module (`76da173`)

### Docs
- update contributing guidelines and project documentation (`30dcd98`)

## 2026-05-12

### Added
- enhance user experience in GraphCalculator and JsonToolkit (`4dd5290`)
- improve zoom functionality and event handling in GraphCalculator (`b286e49`)
- add JSON comment stripping and enhanced error correction in JsonToolkit (`2f31cde`)
- enhance JSON handling and validation in JsonToolkit (`eb3be38`)
- enhance app metadata for improved PWA support (`b2a253b`)
- add JSON-LD structured data for improved SEO across multiple layouts (`1f18621`)
- enhance analytics tracking across various tools (`9940c46`)

### Changed
- - Updated JSON toolkit with new features for sharing and managing JSON workspace presets. - Refactored tool search and command palette to streamline workspace and tool access. - Added WebSocket Tester and Jupyter Notebook to PDF tools for enhanced functionality. - Enhanced IpynbToPdfTool with HTML output rendering capabilities. - Updated height calculation in GraphCalculator and JsonToolkit pages. - Enhanced IpynbToPdfTool with detailed CLI instructions for PDF conversion. (`51fecc7`)
- standardize text color usage across components (`2cfe5cd`)

## 2026-05-11

### Added
- enhance IpynbToPdfTool with HTML output rendering capabilities (`08199ef`)
- add WebSocket Tester and Jupyter Notebook to PDF tools (`2bed701`)
- add Mermaid diagram editor and timezone converter tools (`dbebbf0`)

### Fixed
- update height calculation in GraphCalculator and JsonToolkit pages; enhance IpynbToPdfTool with detailed CLI instructions for PDF conversion (`f05afc4`)

### Changed
- simplify layout structure in GraphCalculator and JsonToolkit pages; enhance IpynbToPdfTool with iframe srcDoc handling (`b170b12`)
- enhance IpynbToPdfTool with improved markdown parsing and HTML rendering (`a8cfbdb`)

## 2026-05-10

### Added
- implement comprehensive security headers and update site URLs to use the 'www' subdomain for improved SEO and security; enhance accessibility features in layout and header components (`7a4df05`)

### Chore
- update security headers in next.config.ts; remove Strict-Transport-Security header and add note regarding its configuration in vercel.json for HSTS compliance (`499c3bb`)

## 2026-05-09

### Added
- add new tools for JSON to TSV and TSV to JSON conversions, along with a log line parser; enhance sitemap with new routes and update tool metadata for improved user experience (`063bb78`)
- add PDF tools including merging, splitting, and converting images to PDF; update package dependencies and enhance sitemap with new routes (`eeeaeed`)
- update Footer component to include Product Hunt review and follow buttons, improving user engagement and visibility (`b6df59e`)
- add Product Hunt review and follow buttons in Footer component to enhance user engagement and visibility (`ef29d0a`)

## 2026-05-08

### Added
- add new blog posts on Base64 encoding and JWT security best practices, including detailed explanations and common pitfalls; update tag colors for improved categorization (`a437027`)
- add SemVer Comparator tool for comparing npm semantic versions, including validation and major/minor/patch difference; update package dependencies and enhance tool metadata for improved user experience (`78db02f`)
- add Salary Hike Calculator tool with detailed functionality for comparing old and new salaries, including percentage change and monthly difference; update package dependencies and enhance sitemap with new routes (`d28b1b8`)
- add new blog posts for JSON validation and JWT decoding, including detailed guides and best practices for safe usage (`36f6284`)
- update layouts to include web application enrichment for enhanced metadata, improve tool descriptions, and streamline theme management in the RootLayout (`2d2c1fa`)
- enhance tool metadata across various layouts with dynamic content, integrate structured data for SEO improvements, and update FAQ sections for better user engagement (`f5fb665`)

## 2026-05-07

### Added
- implement manual theme toggle in layout and update Header component to sync theme state with localStorage (`b57b406`)
- enhance theme management in Header component and update layout styles for improved dark mode support (`01cf65f`)
- implement dynamic import for CommandPalette to optimize initial bundle size and update styling for improved accessibility (`66a62a2`)
- update package.json with browserslist configuration, enhance layout preconnect hints for optimized loading, and refine styling in various components for improved accessibility and user experience (`8c02893`)
- add blog routes to sitemap, update navigation links in Header and Footer, and refine JSON Formatter links for improved user access (`8d5dc2e`)
- update affiliate links in Footer and HomePage, enhance tool metadata with dynamic content, and improve tool descriptions for better user engagement (`e64b693`)
- integrate FAQ sections into JWT Debugger and Tool Slug layouts, enhancing user experience with structured data and improved SEO (`fdb61fb`)
- add sponsor bar and affiliate links to the HomePage and Footer components for enhanced monetization (`84a7529`)
- enhance proxy route to block private addresses and improve request validation; update API Tester and Code Beautify metadata with additional keywords (`0716677`)
- update next.config.ts for production optimizations, add Footer component to tool layout, and implement dynamic imports for tool components to improve performance (`9fb2148`)
- add YAML tools to the workspace routes and update tool registry with new YAML converters and formatter (`5d32583`)
- update tools registry and enhance Image Format Converter to support SVG; add Vercel analytics and speed insights (`355d74a`)
- add Unicode Checker tool to the tool registry and update related components for integration (`1cc7980`)
- update tool registry with new tools including Image Format Converter, SVG Optimizer, EXIF Viewer, HTTP Status Reference, and CSS Box Shadow Builder; enhance ToolSearch component with recent and favourite tools functionality (`aa08778`)
- refactor ToolSearch component to accept tools as a prop, improving modularity and reducing client bundle size (`5d9183d`)

### Changed
- reorganize affiliate links section in Footer component for improved layout and clarity (`dc2007e`)

## 2026-05-06

### Added
- implement redirects for JSON formatter and enhance layout with viewport settings and accessibility improvements (`433d67a`)
- enhance Graph Calculator layout with detailed descriptions, supported functions, and tips for improved user guidance and experience (`e7d9b64`)
- enhance API Tester and Code Beautify pages with detailed descriptions, features, and usage instructions to improve user experience and understanding (`a3c6244`)
- add detailed explanations and usage examples for cron expressions, diff checker, epoch time, and JSON toolkit to enhance user understanding and functionality (`a45b34d`)
- enhance JWT Debugger page with detailed explanations of JWT structure, signing algorithms, and security warnings for improved user understanding (`be3ff63`)
- update tool layout and page components to display related tools and enhance tool descriptions (`5da0c04`)
- add Google verification metadata to enhance site authenticity and SEO (`4b19c39`)
- add JSON-LD structured data for homepage and tool pages to improve SEO and metadata representation (`013ed96`)
- integrate Google Tag Manager for enhanced tracking and analytics (`461cd0b`)
- add Google AdSense account information to metadata in layout (`9a326e1`)
- update privacy policy content and layout, including advertising disclosures and cookie usage information (`9707121`)

## 2026-05-05

### Added
- add various tools including HTML Preview, Markdown Preview, Regex Tester, String Inspector, and UUID Generator (`ecfb356`)
- Add Background Remover tool and update configuration for turbopack support. Include @imgly/background-removal dependency in package.json and package-lock.json. Clean up unused imports and enhance tool descriptions across various components. (`ca6410b`)
- Add unit conversion functionality and categorize tools into finance, health, math, and datetime sections. Enhance AgeCalculatorTool with improved type handling and update CustomToolOutlet to support new tool categories. (`d86db82`)
- Add QR code generation tools and enhance finance, health, and math categories in the tool registry (`334cbf1`)
- Add pdf-lib dependency and introduce new tools in Code Beautify (`22c85d5`)

### Changed
- rename project from DevForge to DevBench and update related metadata (`242f099`)
- Update package dependencies and enhance Code Beautify layout. Added Prettier and sql-formatter to package.json, improved metadata descriptions, and integrated CodeBeautifyWorkspace component. Enhanced CopyButton component with a disabled state. (`f7d59bb`)
- Remove favicon and update page layout with new features, including dynamic matrix size support and improved descriptions. Replace icons in Header and Footer components with DevForgeMark. (`2e188d7`)

## 2026-05-04

### Changed
- Implement initial project structure and setup (`56cc343`)
- Initial commit (`8bb03c1`)
