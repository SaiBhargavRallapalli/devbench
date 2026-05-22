import type { Faq } from "./_types";

export const faqsMisc: Record<string, Faq[]> = {
  "ip-info": [
    { q: "What information does the IP lookup return?", a: "For any IP address the tool returns: geographic location (country, region, city), latitude/longitude, ISP and organization name, ASN (Autonomous System Number), timezone, and the currency used in that country. Enter any public IPv4 or IPv6 address, or leave the field blank to look up your own IP." },
    { q: "How accurate is the geolocation?", a: "IP geolocation is accurate to the country level in almost all cases. City-level accuracy is typically within 50–100 km and varies by ISP and region. VPNs, proxies, and CDN exit nodes will return the location of the server, not the actual user. The data comes from a public IP geolocation database updated regularly." },
    { q: "Can I look up my own IP address?", a: "Yes. Leave the IP field empty and click Lookup — the tool automatically detects and queries your public IP address. This shows the information any website you visit can see about you." },
    { q: "Does it work with IPv6 addresses?", a: "Yes. Enter a full or abbreviated IPv6 address (e.g. 2001:4860:4860::8888) and the lookup returns all available geolocation and network data for that address." },
    { q: "Is the lookup private?", a: "The IP you look up is sent to a geolocation API to retrieve the data — this is inherent to how IP lookups work. Your own browsing IP is not logged. The tool is intended for researching third-party IPs, not for tracking individuals." },
  ],

  "license-generator": [
    { q: "Which open source licenses are supported?", a: "The generator supports MIT, Apache 2.0, GNU GPL v3.0, GNU LGPL v3.0, BSD 2-Clause, BSD 3-Clause, ISC, Mozilla Public License 2.0 (MPL), and The Unlicense. Each is provided in its canonical SPDX form with your name and year substituted." },
    { q: "How do I choose the right license for my project?", a: "MIT and ISC are permissive — anyone can use, modify, and distribute your code, including in proprietary software. Apache 2.0 adds an explicit patent grant. GPL v3 requires derivative works to also be open source (copyleft). LGPL allows linking from proprietary software but copylefts the library itself. The Unlicense dedicates code to the public domain. If in doubt, MIT is the most widely used and understood permissive license." },
    { q: "What is the difference between GPL and LGPL?", a: "GPL (General Public License) requires that any software incorporating your GPL code must also be distributed under GPL — it 'infects' the entire program. LGPL (Lesser GPL) is weaker: software can link against an LGPL library without being required to open-source itself, but modifications to the LGPL library must remain LGPL. LGPL is commonly used for libraries meant to be embedded in proprietary applications." },
    { q: "Do I need a license file in my repository?", a: "Yes. Without a license, copyright law makes your code 'all rights reserved' by default — others cannot legally copy, use, modify, or distribute it even if the source is publicly visible. Adding a LICENSE file grants explicit permissions and protects both you and your users." },
    { q: "Can I change my project's license later?", a: "You can relicense code you own. If your project has multiple contributors, you need permission from all copyright holders to relicense — unless contributors signed a CLA (Contributor License Agreement) granting you that right. Changing from a permissive to a copyleft license is generally harder in practice than the reverse." },
  ],
};
