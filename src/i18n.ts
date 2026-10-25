// English and a mock Hindi translation of the main tracking strings.
// Office names, scan wording and dates stay as India Post writes them in both languages.

import type { ServiceKey } from './data/parcels'
import type { TermKey } from './lib/places'

export type Lang = 'en' | 'hi'

const en = {
  nav: { home: 'Home', codes: 'What do these codes mean?' },
  pageTitle: 'Track and Trace',
  crumbHome: 'Home',

  copyId: 'Copy consignment number',
  idCopied: 'Number copied',
  service: { ordinary: 'Ordinary parcel', speedpost: 'Speed Post' } satisfies Record<ServiceKey, string>,
  usuallyDays: (a: number, b: number) => `usually ${a}–${b} days`,
  lastScanAgo: (d: string) => `Last scan ${d} ago`,

  pill: { onTime: 'On time', late: 'Running late', delivered: 'Delivered' },
  headline: {
    booked: (office: string) => `Booked at ${office}, not sent yet`,
    left: (city: string, dest: string) => `Left ${city}, on the way to ${dest}`,
    at: (city: string, dest: string) => `In ${city}, waiting to go on to ${dest}`,
    atDest: (office: string) => `At your delivery office, ${office}`,
    outForDelivery: (office: string) => `Out for delivery from ${office}`,
    delivered: (office: string) => `Delivered at ${office}`,
  },
  expected: (range: string) => `Expected ${range}`,
  deliveredOnDate: (d: string) => `Delivered ${d}`,
  howTitle: 'How we work this out',
  how: (booked: string, a: number, b: number, source: string) =>
    `Booking date (${booked}) plus ${a}–${b} days, the ${source}. Norms are averages, not promises.`,

  stages: ['Booked', 'Dis­patched', 'In transit', 'Out for delivery', 'Deliv­ered'],
  progressLabel: 'Delivery progress',
  done: 'done',
  current: 'current step',
  notYet: 'not yet',

  actions: {
    save: 'Save',
    saved: 'Saved',
    share: 'Share',
    text: 'Text me updates',
    textOn: 'Texts on',
    textLabel: (num: string) => `Text me at every stop, to ${num}`,
    toastSaved: 'Saved on this device',
    toastUnsaved: 'Removed from saved',
    toastCopied: 'Link copied',
    toastCopyFailed: (link: string) => `Copy this link: ${link}`,
    toastTextOn: (num: string) => `We’ll text ${num} at every stop (prototype: none sent)`,
    toastTextOff: 'Texts turned off',
  },

  journey: 'Journey',
  j: {
    originSent: (next: string) => `Booked and sent on to ${next}`,
    originWaiting: 'Booked, not sent yet',
    hubSent: (next: string) => `Sorted and sent on to ${next}`,
    hubSentToward: (dest: string) => `Sorted and sent on toward ${dest}`,
    hubWaiting: 'Arrived, waiting to be sent on',
    destArrived: 'Reached your delivery office',
    destOut: 'Reached your delivery office and went out for delivery',
    destDelivered: 'Delivered',
    notReached: 'Not reached yet',
    gapLabel: (d: string) => `${d} with no scan`,
  },
  gap: {
    current: (d: string) => `No scan for ${d} so far.`,
    explain: 'Parcels are only scanned at offices, so we can’t see where it is in between.',
  },
  duration: (days: number, hours: number) =>
    [days ? `${days} ${days === 1 ? 'day' : 'days'}` : '', hours || !days ? `${hours} ${hours === 1 ? 'hour' : 'hours'}` : '']
      .filter(Boolean)
      .join(' '),
  durationShort: (days: number, hours: number) =>
    [days ? `${days} ${days === 1 ? 'day' : 'days'}` : '', hours || !days ? `${hours} h` : ''].filter(Boolean).join(' '),
  showAll: (n: number) => `Show all ${n} scans`,
  hideAll: 'Hide the full scan record',
  rawIntro: 'Newest first',

  ifLate: {
    title: 'If it’s late',
    body: (end: string, opens: string) =>
      `If it hasn’t arrived by ${end}, a button to raise a complaint will appear here on ${opens}.`,
    availableFrom: (d: string) => `Available from ${d}`,
  },
  late: {
    title: 'Running late? What you can do',
    intro: 'You can check with your delivery office or the helpline first, or raise a complaint.',
    office: 'Ask your delivery office',
    officeAction: 'Call (sample number)',
    helpline: 'Call the India Post helpline',
    helplineHint: 'Toll-free, 8 AM–8 PM',
    helplineAction: 'Call',
    callToast: 'Prototype: no call is placed',
    complaint: 'Raise a complaint',
    complaintHint: (to: string) => `Open until ${to} · details filled in for you`,
    refund: 'Speed Post refunds its charge if delivery is late.',
  },

  details: 'Parcel details',
  bookedAt: 'Booked at',
  bookedOn: 'Booked on',
  destination: 'Destination',
  tariff: 'Postage paid by the sender',
  code: 'Code',
  codeLink: 'What does this mean?',

  shared: {
    heading: 'Shared with you by the sender',
    for: 'For',
  },

  explain: {
    SO: 'Sub Post Office. Often the office that delivers to your area.',
    HO: 'Head Post Office, the main office for its area.',
    BO: 'Branch Post Office, usually a small rural office.',
    PH: 'Parcel Hub: a sorting centre for parcels.',
    TMO: 'Transit Mail Office: moves mail bags between cities.',
    TC: 'Transshipment Centre: where bags move from one transport route to another.',
  } satisfies Record<TermKey, string>,
}

export type Strings = typeof en

const hi: Strings = {
  ...en,
  nav: { home: 'होम', codes: 'इन कोड का क्या मतलब है?' },
  pageTitle: 'ट्रैक और ट्रेस',
  crumbHome: 'होम',
  copyId: 'कंसाइनमेंट नंबर कॉपी करें',
  idCopied: 'नंबर कॉपी हो गया',
  service: { ordinary: 'साधारण पार्सल', speedpost: 'स्पीड पोस्ट' },
  usuallyDays: (a, b) => `आमतौर पर ${a}–${b} दिन`,
  lastScanAgo: (d) => `आख़िरी स्कैन ${d} पहले`,
  pill: { onTime: 'समय पर', late: 'देर से', delivered: 'डिलीवर हुआ' },
  headline: {
    booked: (office) => `${office} में बुक हुआ, अभी भेजा नहीं गया`,
    left: (city, dest) => `${city} से निकला, ${dest} के रास्ते में`,
    at: (city, dest) => `${city} में, ${dest} भेजे जाने का इंतज़ार`,
    atDest: (office) => `आपके डिलीवरी डाकघर ${office} में`,
    outForDelivery: (office) => `${office} से डिलीवरी के लिए निकला`,
    delivered: (office) => `${office} पर डिलीवर हुआ`,
  },
  expected: (range) => `${range} तक पहुँचने की उम्मीद`,
  deliveredOnDate: (d) => `${d} को डिलीवर हुआ`,
  howTitle: 'यह कैसे तय होता है',
  how: (booked, a, b, source) =>
    `बुकिंग की तारीख़ (${booked}) में ${a}–${b} दिन जोड़कर (${source})। यह औसत है, वादा नहीं।`,

  stages: ['बुक हुआ', 'रवाना', 'रास्ते में', 'डिलीवरी के लिए निकला', 'डिलीवर हुआ'],
  progressLabel: 'डिलीवरी की प्रगति',
  done: 'पूरा',
  current: 'मौजूदा चरण',
  notYet: 'अभी नहीं',
  actions: {
    save: 'सेव करें',
    saved: 'सेव है',
    share: 'शेयर करें',
    text: 'SMS पाएँ',
    textOn: 'SMS चालू',
    textLabel: (num) => `हर पड़ाव पर ${num} पर SMS`,
    toastSaved: 'इस डिवाइस पर सेव हुआ',
    toastUnsaved: 'सेव से हटाया गया',
    toastCopied: 'लिंक कॉपी हो गया',
    toastCopyFailed: (link) => `यह लिंक कॉपी करें: ${link}`,
    toastTextOn: (num) => `हर पड़ाव पर ${num} पर SMS आएगा (प्रोटोटाइप: कोई SMS नहीं भेजा गया)`,
    toastTextOff: 'SMS बंद',
  },
  journey: 'यात्रा',
  j: {
    originSent: (next) => `बुक हुआ और ${next} भेजा गया`,
    originWaiting: 'बुक हुआ, अभी भेजा नहीं गया',
    hubSent: (next) => `छाँटा गया और ${next} भेजा गया`,
    hubSentToward: (dest) => `छाँटा गया और ${dest} की ओर भेजा गया`,
    hubWaiting: 'पहुँचा, आगे भेजे जाने का इंतज़ार',
    destArrived: 'आपके डिलीवरी डाकघर पहुँचा',
    destOut: 'आपके डिलीवरी डाकघर पहुँचा और डिलीवरी के लिए निकला',
    destDelivered: 'डिलीवर हुआ',
    notReached: 'अभी नहीं पहुँचा',
    gapLabel: (d) => `${d} तक कोई स्कैन नहीं`,
  },
  gap: {
    current: (d) => `अब तक ${d} से कोई स्कैन नहीं।`,
    explain: 'पार्सल केवल डाकघरों में स्कैन होते हैं, इसलिए बीच में वह कहाँ है, यह नहीं दिखता।',
  },
  duration: (days, hours) => [days ? `${days} दिन` : '', hours || !days ? `${hours} घंटे` : ''].filter(Boolean).join(' '),
  durationShort: (days, hours) => [days ? `${days} दिन` : '', hours || !days ? `${hours} घं` : ''].filter(Boolean).join(' '),
  showAll: (n) => `सभी ${n} स्कैन देखें`,
  hideAll: 'पूरा स्कैन रिकॉर्ड छिपाएँ',
  rawIntro: 'नया सबसे ऊपर',
  ifLate: {
    title: 'अगर देर हो',
    body: (end, opens) => `अगर ${end} तक नहीं पहुँचा, तो ${opens} को शिकायत दर्ज करने का बटन यहाँ दिखेगा।`,
    availableFrom: (d) => `${d} से उपलब्ध`,
  },
  late: {
    title: 'देर हो रही है? आप क्या कर सकते हैं',
    intro: 'पहले अपने डिलीवरी डाकघर या हेल्पलाइन से पूछ सकते हैं, या शिकायत दर्ज कर सकते हैं।',
    office: 'अपने डिलीवरी डाकघर से पूछें',
    officeAction: 'कॉल करें (नमूना नंबर)',
    helpline: 'इंडिया पोस्ट हेल्पलाइन पर कॉल करें',
    helplineHint: 'टोल-फ़्री, सुबह 8 से रात 8 बजे तक',
    helplineAction: 'कॉल करें',
    callToast: 'प्रोटोटाइप: कोई कॉल नहीं की जाती',
    complaint: 'शिकायत दर्ज करें',
    complaintHint: (to) => `${to} तक खुली · जानकारी पहले से भरी होगी`,
    refund: 'देर से डिलीवरी पर स्पीड पोस्ट अपना शुल्क लौटाता है।',
  },
  details: 'पार्सल की जानकारी',
  bookedAt: 'बुकिंग डाकघर',
  bookedOn: 'बुकिंग',
  destination: 'मंज़िल',
  tariff: 'भेजने वाले ने डाक शुल्क दिया',
  code: 'कोड',
  codeLink: 'इसका क्या मतलब है?',
  shared: { heading: 'भेजने वाले ने आपके साथ शेयर किया', for: 'किसके लिए' },
  explain: {
    SO: 'उप डाकघर (Sub Post Office)। अक्सर यही आपके इलाके में डिलीवरी करता है।',
    HO: 'प्रधान डाकघर (Head Post Office), अपने इलाके का मुख्य डाकघर।',
    BO: 'शाखा डाकघर (Branch Post Office), आमतौर पर छोटा ग्रामीण डाकघर।',
    PH: 'पार्सल हब (Parcel Hub): पार्सल छाँटने का केंद्र।',
    TMO: 'ट्रांज़िट मेल ऑफ़िस (Transit Mail Office): शहरों के बीच डाक के बैग ले जाता है।',
    TC: 'ट्रांसशिपमेंट सेंटर: जहाँ बैग एक परिवहन रूट से दूसरे पर जाते हैं।',
  },
}

export const STRINGS: Record<Lang, Strings> = { en, hi }
