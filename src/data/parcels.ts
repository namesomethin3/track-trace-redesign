// Mock data only. Scan wording and office names are kept exactly as India Post records them.

export type ServiceKey = 'ordinary' | 'speedpost'

export interface Scan {
  /** Local India time, ISO without zone: 2026-10-15T11:26:25 */
  at: string
  event: string
  office: string
}

export interface Office {
  office: string
  pin: string
  state: string
}

export interface Parcel {
  id: string
  fictional: boolean
  service: ServiceKey
  normMin: number
  normMax: number
  /** Where the norm comes from, shown under the window. */
  normSource: string
  origin: Office
  /** Delivery office area line and phone, as the post office locator would give them. Sample values. */
  dest: Office & { area: string; phone: string }
  tariff: string
  /** Shown only in the shared-link view. Fictional. */
  recipientMasked: string
  /** The mobile number already on the booking, masked. Fictional. */
  mobileMasked: string
  /** Frozen "now" for this scenario, so the prototype always shows the same state. */
  asOf: string
  scans: Scan[]
}

/** Every scenario is frozen at the same moment; shown once, in the scenario bar. */
export const PROTOTYPE_NOW = '2026-10-25T18:00:00'

const late: Parcel = {
  id: 'CX006233096IN',
  fictional: false,
  service: 'ordinary',
  normMin: 7,
  normMax: 8,
  normSource: 'norm the India Post helpline quoted for this parcel',
  origin: { office: 'Mokokchung S.O', pin: '798601', state: 'Nagaland' },
  dest: {
    office: 'Kandi S.O',
    pin: '502285',
    state: 'Telangana',
    area: 'Sangareddy district, Telangana 502285',
    phone: '0000 000000 (sample)',
  },
  tariff: '₹84.85',
  recipientMasked: 'A**** S.',
  mobileMasked: '+91 ••••• •••14',
  asOf: PROTOTYPE_NOW,
  scans: [
    { at: '2026-10-15T11:26:25', event: 'Item Booked', office: 'Mokokchung S.O' },
    { at: '2026-10-15T12:31:00', event: 'Item bagged', office: 'Mokokchung S.O' },
    { at: '2026-10-15T14:07:43', event: 'Item Dispatched', office: 'Mokokchung S.O' },
    { at: '2026-10-17T08:16:57', event: 'Bag Received', office: 'Dimapur PH' },
    { at: '2026-10-17T09:16:30', event: 'Item Received', office: 'Dimapur PH' },
    { at: '2026-10-17T13:39:04', event: 'Item Dispatched', office: 'Dimapur PH' },
    { at: '2026-10-17T15:27:03', event: 'Bag Received for Forwarding', office: 'Dimapur TMO' },
    { at: '2026-10-17T15:50:26', event: 'Item Dispatched', office: 'Dimapur TMO' },
    { at: '2026-10-19T02:24:02', event: 'Bag Received for Forwarding', office: 'Transshipment Centre Mirza' },
    { at: '2026-10-19T02:28:24', event: 'Item Dispatched', office: 'Transshipment Centre Mirza' },
    { at: '2026-10-22T18:48:58', event: 'Bag Received for Forwarding', office: 'Kolkata Transshipment Centre' },
    { at: '2026-10-22T19:21:09', event: 'Item Dispatched', office: 'Kolkata Transshipment Centre' },
    { at: '2026-10-23T16:53:39', event: 'Bag Received for Forwarding', office: 'Bhubaneswar PH' },
    { at: '2026-10-23T18:14:53', event: 'Item Dispatched', office: 'Bhubaneswar PH' },
    { at: '2026-10-25T12:18:02', event: 'Bag Received for Forwarding', office: 'Transshipment Centre Hyderabad' },
    { at: '2026-10-25T12:35:07', event: 'Item Dispatched', office: 'Transshipment Centre Hyderabad' },
  ],
}

// Fictional: invented for the "on time" state.
const onTime: Parcel = {
  id: 'EZ100000017IN',
  fictional: true,
  service: 'speedpost',
  normMin: 4,
  normMax: 5,
  normSource: 'published Speed Post norm for “rest of the country”',
  origin: { office: 'Shillong H.O', pin: '793001', state: 'Meghalaya' },
  dest: {
    office: 'Panaji H.O',
    pin: '403001',
    state: 'Goa',
    area: 'North Goa, Goa 403001',
    phone: '0000 000000 (sample)',
  },
  tariff: '₹118.00',
  recipientMasked: 'M**** D.',
  mobileMasked: '+91 ••••• •••52',
  asOf: PROTOTYPE_NOW,
  scans: [
    { at: '2026-10-23T10:05:12', event: 'Item Booked', office: 'Shillong H.O' },
    { at: '2026-10-23T13:40:31', event: 'Item bagged', office: 'Shillong H.O' },
    { at: '2026-10-23T17:22:08', event: 'Item Dispatched', office: 'Shillong H.O' },
    { at: '2026-10-24T06:11:45', event: 'Bag Received for Forwarding', office: 'Guwahati PH' },
    { at: '2026-10-24T09:32:19', event: 'Item Dispatched', office: 'Guwahati PH' },
    { at: '2026-10-25T14:02:37', event: 'Bag Received for Forwarding', office: 'Kolkata Transshipment Centre' },
  ],
}

// Fictional: invented for the "delivered" state.
const delivered: Parcel = {
  id: 'EZ200000025IN',
  fictional: true,
  service: 'speedpost',
  normMin: 4,
  normMax: 5,
  normSource: 'published Speed Post norm for “rest of the country”',
  origin: { office: 'Pune H.O', pin: '411001', state: 'Maharashtra' },
  dest: {
    office: 'Indiranagar S.O',
    pin: '560038',
    state: 'Karnataka',
    area: 'Bengaluru, Karnataka 560038',
    phone: '0000 000000 (sample)',
  },
  tariff: '₹94.40',
  recipientMasked: 'K**** R.',
  mobileMasked: '+91 ••••• •••07',
  asOf: PROTOTYPE_NOW,
  scans: [
    { at: '2026-10-06T11:10:04', event: 'Item Booked', office: 'Pune H.O' },
    { at: '2026-10-06T15:45:50', event: 'Item bagged', office: 'Pune H.O' },
    { at: '2026-10-06T19:30:22', event: 'Item Dispatched', office: 'Pune H.O' },
    { at: '2026-10-07T02:15:09', event: 'Bag Received for Forwarding', office: 'Pune PH' },
    { at: '2026-10-07T05:40:33', event: 'Item Dispatched', office: 'Pune PH' },
    { at: '2026-10-08T09:20:41', event: 'Bag Received for Forwarding', office: 'Bengaluru PH' },
    { at: '2026-10-08T12:05:16', event: 'Item Dispatched', office: 'Bengaluru PH' },
    { at: '2026-10-09T08:30:57', event: 'Item Received', office: 'Indiranagar S.O' },
    { at: '2026-10-09T09:15:28', event: 'Out for Delivery', office: 'Indiranagar S.O' },
    { at: '2026-10-09T14:40:03', event: 'Item Delivered', office: 'Indiranagar S.O' },
  ],
}

export const parcels: Record<string, Parcel> = {
  [late.id]: late,
  [onTime.id]: onTime,
  [delivered.id]: delivered,
}

export const SAMPLE_IDS = { onTime: onTime.id, late: late.id, delivered: delivered.id }

export function findParcel(id: string | undefined): Parcel | undefined {
  if (!id) return undefined
  return parcels[id.trim().toUpperCase()]
}
