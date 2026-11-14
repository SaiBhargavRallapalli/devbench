// Copyright (c) 2026 DevBench contributors. MIT License.
/**
 * A curated dataset of fixed-date holidays — quirky, cultural and
 * international days worth celebrating. Only dates that fall on the same
 * day every year are listed (floating days like Mother's Day are excluded
 * on purpose: they would be wrong in some years).
 *
 * Dates are stored as MM-DD and kept sorted so month slices are a simple
 * filter. The list is data, not fact-checking: blurbs are short primers.
 */

export interface FunHoliday {
  /** MM-DD */
  date: string;
  name: string;
  blurb: string;
}

export const FUN_HOLIDAYS: readonly FunHoliday[] = [
  { date: "01-01", name: "New Year's Day", blurb: "The first day of the Gregorian calendar, rung in at midnight with fireworks and resolutions in most of the world." },
  { date: "01-04", name: "World Braille Day", blurb: "Marks Louis Braille's birthday — the tactile reading and writing system used by blind and partially sighted people worldwide." },
  { date: "01-06", name: "Epiphany / Three Kings Day", blurb: "Christian feast marking the visit of the Magi; in many countries it is the official end of the Christmas season." },
  { date: "01-07", name: "Orthodox Christmas", blurb: "Christmas according to the Julian calendar, celebrated by several Eastern Orthodox churches on 7 January." },
  { date: "01-13", name: "National Rubber Ducky Day", blurb: "A nod to the bath-time classic — the rubber duck became a cultural icon thanks to Sesame Street's Ernie." },
  { date: "01-16", name: "National Nothing Day", blurb: "An unofficial day on which nothing is supposed to happen — no celebrations, no events, just an empty square on the calendar." },
  { date: "01-21", name: "National Hugging Day", blurb: "Encourages people to share a hug; created in the United States in 1986 and now marked in many countries." },
  { date: "01-23", name: "National Pie Day", blurb: "Celebrates pie in all its forms — savoury or sweet — in the United States since 1986." },
  { date: "01-25", name: "National Opposite Day", blurb: "A playful day when everything is said to be the opposite — say one thing, mean the other (or don't)."},
  { date: "01-26", name: "Republic Day (India)", blurb: "Commemorates the Constitution of India coming into force in 1950, marked by the parade on Kartavya Path." },
  { date: "01-27", name: "International Holocaust Remembrance Day", blurb: "The anniversary of the liberation of Auschwitz-Birkenau in 1945, observed by the UN to honour its victims." },
  { date: "01-28", name: "Data Privacy Day", blurb: "An international effort to raise awareness about privacy and the value of personal information online." },
  { date: "01-30", name: "Martyrs' Day (India)", blurb: "Marks the anniversary of Mahatma Gandhi's assassination in 1948; flags fly at half-mast and the nation observes silence." },

  { date: "02-02", name: "Groundhog Day", blurb: "In Punxsutawney, Pennsylvania, a groundhog emerging from its burrow is said to predict six more weeks of winter if it sees its shadow." },
  { date: "02-09", name: "National Pizza Day", blurb: "A day dedicated to the world's most popular takeaway — from Neapolitan margheritas to late-night delivery slices." },
  { date: "02-10", name: "National Umbrella Day", blurb: "Celebrates the humble umbrella — from monsoon downpours to beach shade, one of humanity's most portable inventions." },
  { date: "02-11", name: "International Day of Women and Girls in Science", blurb: "A UN day calling for full and equal access to science for women and girls everywhere." },
  { date: "02-13", name: "World Radio Day", blurb: "Proclaimed by UNESCO to celebrate radio as a medium that informs, educates and entertains communities." },
  { date: "02-14", name: "Valentine's Day", blurb: "The feast of Saint Valentine — cards, flowers and chocolate exchanged across dozens of countries on 14 February." },
  { date: "02-20", name: "World Day of Social Justice", blurb: "A UN observance focused on unemployment, social exclusion and unfair labour practices." },
  { date: "02-21", name: "International Mother Language Day", blurb: "Honours linguistic diversity and the right to speak one's mother tongue, proclaimed by UNESCO in 1999." },
  { date: "02-28", name: "National Science Day (India)", blurb: "Celebrates C. V. Raman's discovery of the Raman Effect, announced on this date in 1928." },

  { date: "03-03", name: "World Wildlife Day", blurb: "Marks the signing of CITES in 1973 and celebrates wild animals and plants and their conservation." },
  { date: "03-04", name: "National Grammar Day", blurb: "A day for language lovers to celebrate correct grammar, syntax and the humble comma." },
  { date: "03-08", name: "International Women's Day", blurb: "A UN-recognised day celebrating women's social, economic and political achievements worldwide." },
  { date: "03-14", name: "Pi Day", blurb: "Celebrates the mathematical constant π (3.14) — pie-shaped snacks and infinite decimals, all day long." },
  { date: "03-14", name: "White Day", blurb: "In Japan, South Korea and Taiwan, one month after Valentine's Day, gift-givers return the favour with white sweets." },
  { date: "03-15", name: "World Consumer Rights Day", blurb: "Marks the 1962 speech defining consumers' rights to safety, information, choice and redress." },
  { date: "03-17", name: "St Patrick's Day", blurb: "Ireland's national day, honouring its patron saint with parades, green clothing and shamrocks around the world." },
  { date: "03-20", name: "International Day of Happiness", blurb: "The UN's day for recognising happiness as a fundamental human goal, adopted in 2012." },
  { date: "03-21", name: "World Down Syndrome Day", blurb: "Chosen to echo trisomy 21 (three copies of chromosome 21); observed with mismatched socks to raise awareness." },
  { date: "03-22", name: "World Water Day", blurb: "Highlights the importance of fresh water and access to clean drinking water for all." },
  { date: "03-23", name: "World Meteorological Day", blurb: "Marks the founding of the World Meteorological Organization in 1950 and the science behind weather forecasting." },
  { date: "03-24", name: "World Tuberculosis Day", blurb: "Anniversary of Robert Koch's 1882 discovery of the tuberculosis bacillus." },
  { date: "03-27", name: "World Theatre Day", blurb: "Celebrates the art of theatre with a message from an internationally renowned figure each year." },

  { date: "04-01", name: "April Fools' Day", blurb: "The annual day of harmless pranks and hoaxes, observed in many countries since at least the 16th century." },
  { date: "04-02", name: "World Autism Awareness Day", blurb: "A UN day to raise awareness and support for autistic people and their families." },
  { date: "04-04", name: "International Day for Mine Awareness", blurb: "Raises awareness of the danger of landmines and explosive remnants of war." },
  { date: "04-07", name: "World Health Day", blurb: "Marks the founding of the World Health Organization in 1948, with an annual health theme." },
  { date: "04-10", name: "Siblings Day", blurb: "Celebrates brothers and sisters — a US-created day with no official status but plenty of sibling affection." },
  { date: "04-11", name: "National Pet Day", blurb: "Recognises the joy pets bring to their owners and encourages adopting from shelters." },
  { date: "04-14", name: "Dr. Ambedkar Jayanti", blurb: "Birth anniversary of B. R. Ambedkar, chief architect of the Constitution of India, observed with respect across India." },
  { date: "04-15", name: "World Art Day", blurb: "Celebrates artistic creation on Leonardo da Vinci's birthday, proclaimed by UNESCO in 2012." },
  { date: "04-16", name: "World Voice Day", blurb: "Raises awareness of voice health — the instrument every human carries." },
  { date: "04-18", name: "World Heritage Day", blurb: "Highlights the world's cultural heritage sites and the efforts to protect them." },
  { date: "04-22", name: "Earth Day", blurb: "Since 1970, the largest environmental movement in the world, now marked in over 190 countries." },
  { date: "04-23", name: "World Book Day", blurb: "UNESCO's celebration of books and reading, chosen for the anniversaries of Shakespeare and Cervantes." },
  { date: "04-25", name: "World Malaria Day", blurb: "Raises awareness of malaria control and the millions of people affected by it each year." },
  { date: "04-25", name: "Anzac Day", blurb: "Australia and New Zealand's day of remembrance for those who served and died in wars and peacekeeping." },
  { date: "04-26", name: "World Intellectual Property Day", blurb: "Celebrates the role of patents, copyright and trademarks in innovation and creativity." },
  { date: "04-28", name: "World Day for Safety and Health at Work", blurb: "Promotes safe working conditions and the prevention of occupational accidents and disease." },

  { date: "05-01", name: "Labour Day / May Day", blurb: "International workers' day marking the eight-hour working day movement — a public holiday in most countries." },
  { date: "05-03", name: "World Press Freedom Day", blurb: "Marks the adoption of the Declaration of Windhoek in 1991 and celebrates independent journalism." },
  { date: "05-04", name: "Star Wars Day", blurb: "Because 'May the Fourth be with you' — the pun that turned into an unofficial global celebration." },
  { date: "05-05", name: "Cinco de Mayo", blurb: "Marks Mexico's 1862 victory over the French at Puebla; celebrated with parades, music and food." },
  { date: "05-05", name: "Children's Day (Japan)", blurb: "Kodomo no Hi celebrates children's happiness and growth with carp streamers flown across Japan." },
  { date: "05-08", name: "World Red Cross and Red Crescent Day", blurb: "Birthday of Henry Dunant, founder of the Red Cross, honouring humanitarian aid workers." },
  { date: "05-15", name: "International Day of Families", blurb: "A UN observance of the importance of families and the challenges they face." },
  { date: "05-17", name: "World Telecommunication Day", blurb: "Marks the founding of the ITU in 1865 and the arrival of the first international telegraph." },
  { date: "05-20", name: "World Bee Day", blurb: "Celebrates bees and other pollinators — chosen for the birthday of Anton Janša, a pioneer of beekeeping." },
  { date: "05-21", name: "World Day for Cultural Diversity", blurb: "Promotes cultural diversity as a driver of dialogue, peace and sustainable development." },
  { date: "05-22", name: "International Day for Biological Diversity", blurb: "Highlights the variety of life on Earth and the need to protect ecosystems." },
  { date: "05-25", name: "Towel Day", blurb: "Fans of Douglas Adams carry a towel in tribute to The Hitchhiker's Guide to the Galaxy, two weeks after his death in 2001." },
  { date: "05-29", name: "International Day of UN Peacekeepers", blurb: "Honours the men and women who serve in UN peacekeeping missions around the world." },
  { date: "05-30", name: "World No Tobacco Day", blurb: "The WHO's day to draw attention to the tobacco epidemic and its health effects." },

  { date: "06-01", name: "International Children's Day", blurb: "Marks children's wellbeing with events and holidays in dozens of countries on 1 June." },
  { date: "06-05", name: "World Environment Day", blurb: "The UN's flagship day for environmental action, held annually since 1974." },
  { date: "06-08", name: "World Oceans Day", blurb: "Celebrates the ocean that covers 71% of the planet and calls for its protection." },
  { date: "06-12", name: "World Day Against Child Labour", blurb: "The ILO's day to raise awareness of child labour and the push for safe, fair work for children." },
  { date: "06-14", name: "World Blood Donor Day", blurb: "Thanks voluntary blood donors and encourages more people to give." },
  { date: "06-20", name: "World Refugee Day", blurb: "Honours refugees and the courage it takes to rebuild a life after displacement." },
  { date: "06-21", name: "International Day of Yoga", blurb: "Marks the ancient practice of yoga, adopted by the UN in 2014 after India's proposal." },
  { date: "06-21", name: "World Music Day", blurb: "Fête de la Musique, born in France in 1982, fills streets with free live music on the summer solstice." },
  { date: "06-26", name: "International Day Against Drug Abuse", blurb: "A UN day supporting a drug-free society and those recovering from addiction." },
  { date: "06-30", name: "International Asteroid Day", blurb: "Marks the 1908 Tunguska event and raises awareness of asteroid impact risk." },

  { date: "07-01", name: "International Joke Day", blurb: "The day to tell your best one-liner — the internet's favourite excuse for a bad pun." },
  { date: "07-02", name: "World UFO Day", blurb: "Celebrates the mysterious and unexplained — a nod to Kenneth Arnold's famous 1947 sighting." },
  { date: "07-04", name: "US Independence Day", blurb: "The adoption of the Declaration of Independence in 1776, marked with fireworks, parades and barbecues." },
  { date: "07-07", name: "World Chocolate Day", blurb: "Celebrates chocolate — one of the few food days with near-universal participation." },
  { date: "07-11", name: "World Population Day", blurb: "Marks the world population milestone of five billion in 1987 and focuses on demographic challenges." },
  { date: "07-14", name: "Bastille Day", blurb: "France's national day, commemorating the storming of the Bastille in 1789 with military parades and fireworks." },
  { date: "07-17", name: "World Emoji Day", blurb: "Celebrates emoji — chosen because 17 July is the date printed on the 📅 calendar emoji." },
  { date: "07-20", name: "Moon Landing Anniversary", blurb: "Anniversary of Apollo 11's first human steps on the Moon in 1969 — 'one small step for man'." },
  { date: "07-30", name: "International Day of Friendship", blurb: "A UN day promoting friendship between peoples, countries, cultures and individuals." },

  { date: "08-06", name: "Hiroshima Peace Memorial Day", blurb: "Marks the 1945 atomic bombing of Hiroshima and calls for nuclear disarmament and peace." },
  { date: "08-08", name: "International Cat Day", blurb: "Celebrates cats of all shapes and sizes, and encourages adopting from shelters." },
  { date: "08-09", name: "International Day of the World's Indigenous Peoples", blurb: "Recognises the rights and contributions of indigenous peoples worldwide." },
  { date: "08-12", name: "International Youth Day", blurb: "A UN day bringing attention to cultural and legal issues surrounding young people." },
  { date: "08-15", name: "Indian Independence Day", blurb: "Marks India's independence from British rule in 1947, with flag-hoisting ceremonies across the country." },
  { date: "08-19", name: "World Humanitarian Day", blurb: "Honours aid workers who risk their lives helping people in conflict and disaster." },
  { date: "08-19", name: "World Photography Day", blurb: "Celebrates photography and the art of capturing moments — the anniversary of the daguerreotype's presentation in 1839." },
  { date: "08-26", name: "Women's Equality Day (US)", blurb: "Marks the 1920 certification of the 19th Amendment granting US women the right to vote." },

  { date: "09-05", name: "Teachers' Day (India)", blurb: "Celebrates teachers on the birthday of Dr. Sarvepalli Radhakrishnan, philosopher and second President of India." },
  { date: "09-08", name: "International Literacy Day", blurb: "A UNESCO day highlighting the importance of reading and writing for human dignity." },
  { date: "09-16", name: "International Day for the Preservation of the Ozone Layer", blurb: "Marks the signing of the Montreal Protocol in 1987 — the most successful environmental treaty in history." },
  { date: "09-21", name: "International Day of Peace", blurb: "A UN day calling for a global ceasefire and the absence of war and violence." },
  { date: "09-27", name: "World Tourism Day", blurb: "Highlights tourism's role in development, culture and the economies of nations." },
  { date: "09-29", name: "World Heart Day", blurb: "Raises awareness of cardiovascular disease, the world's leading cause of death." },

  { date: "10-01", name: "International Day of Older Persons", blurb: "Recognises the contributions of older persons and the challenges of ageing populations." },
  { date: "10-01", name: "World Vegetarian Day", blurb: "Opens Vegetarian Awareness Month with a nod to plant-based eating." },
  { date: "10-02", name: "Gandhi Jayanti", blurb: "Birth anniversary of Mahatma Gandhi, observed in India as a day of non-violence — also the UN's International Day of Non-Violence." },
  { date: "10-04", name: "World Animal Day", blurb: "Marks the feast of Saint Francis of Assisi, patron saint of animals, with events for animal welfare." },
  { date: "10-05", name: "World Teachers' Day", blurb: "UNESCO's day honouring teachers and their role in education." },
  { date: "10-09", name: "World Post Day", blurb: "Marks the founding of the Universal Postal Union in 1874 and the age of the postage stamp." },
  { date: "10-10", name: "World Mental Health Day", blurb: "Raises awareness of mental health issues and mobilises efforts in support of wellbeing." },
  { date: "10-15", name: "Global Handwashing Day", blurb: "Promotes handwashing with soap as one of the cheapest ways to prevent disease." },
  { date: "10-16", name: "World Food Day", blurb: "Marks the founding of the FAO in 1945 and focuses on food security and hunger." },
  { date: "10-17", name: "International Day for the Eradication of Poverty", blurb: "A UN day calling for action to end poverty in all its forms." },
  { date: "10-24", name: "United Nations Day", blurb: "Marks the entry into force of the UN Charter in 1945 and the creation of the United Nations." },
  { date: "10-31", name: "Halloween", blurb: "The night before All Saints' Day, spent in costumes, jack-o'-lanterns and trick-or-treating." },

  { date: "11-01", name: "World Vegan Day", blurb: "Celebrates plant-based living and opens a month of vegan awareness events." },
  { date: "11-02", name: "Day of the Dead (Día de los Muertos)", blurb: "Mexican tradition honouring deceased loved ones with altars, marigolds and sugar skulls." },
  { date: "11-05", name: "Guy Fawkes Night", blurb: "British commemoration of the failed 1605 Gunpowder Plot, marked with bonfires and fireworks." },
  { date: "11-11", name: "Singles' Day", blurb: "Chinese festival whose 11.11 date looks like four single sticks — now the world's biggest online shopping day." },
  { date: "11-11", name: "Veterans Day / Armistice Day", blurb: "Marks the end of the First World War at the 11th hour of the 11th day of the 11th month in 1918." },
  { date: "11-13", name: "World Kindness Day", blurb: "Encourages small acts of kindness and highlights the good in the world." },
  { date: "11-14", name: "Children's Day (India)", blurb: "Celebrates children on the birthday of Jawaharlal Nehru, India's first Prime Minister." },
  { date: "11-14", name: "World Diabetes Day", blurb: "Marks the birthday of Frederick Banting, who co-discovered insulin in 1921." },
  { date: "11-19", name: "World Toilet Day", blurb: "A UN day drawing attention to the billions of people without access to safe sanitation." },
  { date: "11-20", name: "Universal Children's Day", blurb: "Established by the UN in 1954 to promote children's welfare and the UN Convention on the Rights of the Child." },
  { date: "11-21", name: "World Television Day", blurb: "Recognises television's role in shaping public opinion and cultural exchange." },
  { date: "11-21", name: "World Hello Day", blurb: "Encourages people to say hello to ten strangers as a gesture of peace." },
  { date: "11-25", name: "Day to End Violence Against Women", blurb: "Opens 16 days of activism against gender-based violence, ending on 10 December." },

  { date: "12-01", name: "World AIDS Day", blurb: "Marks the global fight against HIV/AIDS and remembers those lost, with a red ribbon as its symbol." },
  { date: "12-03", name: "International Day of Persons with Disabilities", blurb: "A UN day promoting disability rights, inclusion and accessibility." },
  { date: "12-05", name: "World Soil Day", blurb: "Highlights the importance of healthy soil for food security and ecosystems." },
  { date: "12-07", name: "Pearl Harbor Remembrance Day (US)", blurb: "Marks the 1941 attack on Pearl Harbor that brought the United States into the Second World War." },
  { date: "12-10", name: "Human Rights Day", blurb: "Marks the UN's adoption of the Universal Declaration of Human Rights in 1948." },
  { date: "12-21", name: "December Solstice", blurb: "The shortest day and longest night of the year in the Northern Hemisphere — the official start of winter." },
  { date: "12-24", name: "Christmas Eve", blurb: "The evening before Christmas, marked by midnight masses, family dinners and gift exchanges." },
  { date: "12-25", name: "Christmas Day", blurb: "The Christian festival celebrating the birth of Jesus Christ, a public holiday in dozens of countries." },
  { date: "12-26", name: "Boxing Day", blurb: "The day after Christmas, traditionally when servants and tradespeople received gifts — now a shopping and sport day." },
  { date: "12-31", name: "New Year's Eve", blurb: "The final day of the year, counted down to midnight with fireworks in every time zone." },
];

/** Holidays falling on a specific MM-DD date. */
export function holidaysOn(mmdd: string): FunHoliday[] {
  return FUN_HOLIDAYS.filter((h) => h.date === mmdd);
}

/** Every holiday in a month (1-based), in date order. */
export function holidaysInMonth(month: number): FunHoliday[] {
  const prefix = `${month < 10 ? `0${month}` : String(month)}-`;
  return FUN_HOLIDAYS.filter((h) => h.date.startsWith(prefix));
}

/**
 * The next `count` holidays on or after `mmdd`, wrapping around the year
 * so the list always comes back full — used for "what's coming up".
 */
export function nextHolidays(mmdd: string, count: number): FunHoliday[] {
  const after = FUN_HOLIDAYS.filter((h) => h.date >= mmdd);
  const before = FUN_HOLIDAYS.filter((h) => h.date < mmdd);
  return [...after, ...before].slice(0, count);
}

/** A uniformly random holiday — the "surprise me" button. */
export function randomHoliday(): FunHoliday {
  return FUN_HOLIDAYS[Math.floor(Math.random() * FUN_HOLIDAYS.length)];
}

/** Today's date as MM-DD, in local time. */
export function todayMmdd(now: Date = new Date()): string {
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${m}-${d}`;
}
