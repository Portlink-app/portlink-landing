import type { AcquisitionAudience, AcquisitionProduct } from '@/lib/acquisition-preferences'

export const audienceLabels: Record<AcquisitionAudience, string> = {
  cruise: 'Cruise line', agent: 'Port agent', tour: 'DMC / shorex', operator: 'Tour operator',
}
export const productSlug = (product: AcquisitionProduct) => product === 'platform' ? 'portlink' : 'embark'
export const topics = {
  platform: [
    { id: 'planning', anchor: 'voyage-ais', title: 'See the voyage before the call', outcome: 'Keep the proposed itinerary and each team’s review in view.', image: '/acquisition/coast-wide.webp', detail: 'The itinerary planner owns the proposed Summer 2028 voyage. Marine operations, shorex and commercial review are separate from a confirmed port call.' },
    { id: 'coordination', anchor: 'gangway-signoff', title: 'Keep the responsible people visible', outcome: 'Follow the call into service records and shore requests.', image: '/product/fjord-cruise-800.webp', detail: 'The port agent and ship master review recorded quantities. A DMC prepares a shore quote for the cruise line to consider. Neither a request nor a signature is automatically a final-account acceptance.' },
    { id: 'accounts', anchor: 'pda-fda', title: 'Understand what changed', outcome: 'Compare the proposed account with recorded consumption.', image: '/acquisition/coast-wide.webp', detail: 'The example compares Approved Proforma of 412 380,00 kr with a final account of 401 250,00 kr. The 11 130,00 kr difference is unused tug overtime. Reviewing it does not send an invoice or make a payment.' },
  ],
  embark: [
    { id: 'departures', anchor: 'dispatch', title: 'Give every departure a clear plan', outcome: 'Bring the booked guests, available seats and guide together.', image: '/acquisition/operator-wide.webp', detail: 'An independent operator prepares a coastal kayaking departure at 10.00 for twelve guests. Embark has its own workspace; Platform is not required.' },
    { id: 'capacity', anchor: 'quay-checkin', title: 'See a shortage while you can act', outcome: 'Keep unresolved capacity visible for a human decision.', image: '/acquisition/operator-wide.webp', detail: 'Changing available capacity from twelve seats to ten leaves two guests unresolved. The operator reviews capacity, guest arrangements and guide preparation. The demo never reallocates guests automatically.' },
    { id: 'bookings', anchor: 'paid-before', title: 'Keep booking decisions explicit', outcome: 'Separate a group request, an invoice arrangement and confirmed payment.', image: '/acquisition/operator-wide.webp', detail: 'A received group request can still await approval of its invoice arrangement. Payment remains unconfirmed until the real payment path establishes it. No money moves in this example.' },
  ],
}
export type JourneyTopic = (typeof topics)[AcquisitionProduct][number]
export type DemoRecord = { title: string; owner: string; rows: [string, string][]; action: string; result: string; unavailable?: string }
export function demoRecord(product: AcquisitionProduct, audience: AcquisitionAudience, topic: string, reviewed: boolean): DemoRecord {
  if (product === 'embark') {
    if (topic === 'bookings') return { title: 'Coastal kayaking · Group request', owner: 'Tour operator', rows: [['Guests','12'],['Request','Received'],['Invoice arrangement','Awaiting approval'],['Payment','Not confirmed']], action: 'Review booking arrangement', result: 'Review complete in this example. Invoice approval and payment remain outstanding.' }
    if (topic === 'departures') return { title: 'Coastal kayaking · Departure plan', owner: 'Tour operator', rows: [['Departure','10.00'],['Guests','12'],['Guide','Assigned'],['Preparation', reviewed ? 'Plan reviewed' : 'Ready for review']], action: 'Review departure preparation', result: 'The departure plan is reviewed. Guest bookings and guide assignment are unchanged.' }
    return { title: 'Coastal kayaking · 10.00', owner: 'Tour operator', rows: [['Guests','12'],['Available seats', reviewed || topic === 'capacity' ? '10' : '12'],['Guide','Assigned'],['Unresolved guests',reviewed || topic === 'capacity' ? '2' : '0']], action: 'Review a capacity change', result: 'Two guests need a decision. No automatic reassignment was made.' }
  }
  if (topic === 'planning') {
    if (audience !== 'cruise') return { title: audience === 'agent' ? 'Bergen · Agent preparation' : 'Bergen · Shore preparation', owner: audienceLabels[audience], rows: [['Planning owner','Cruise-line itinerary planner'],['Proposed call','Bergen'],['Commitment','Not requested']], action: 'Planning belongs to the cruise line', result: '', unavailable: 'This audience does not own itinerary planning. Explore coordination to review its supported preparation task.' }
    return { title: 'Northern coast · Summer 2028', owner: 'Itinerary planner', rows: [['Assigned vessel','Aster Brisa'],['Proposed call','Bergen'],['Marine operations',reviewed ? 'In review' : 'Review not started'],['External commitment','Not requested']], action: 'Review the proposed call', result: 'Marine review is visible in this example. Shorex and commercial review remain separate; the call is not confirmed.' }
  }
  if (topic === 'coordination') {
    if (audience === 'tour') return { title: 'Bergen · Shore quote', owner: 'DMC / shorex', rows: [['Request','Coastal excursion'],['Guests','12'],['Quote',reviewed ? 'Draft reviewed' : 'Draft response'],['Cruise-line acceptance','Not received']], action: 'Review the quote response', result: 'Draft reviewed. The cruise line still owns acceptance; no booking was created.' }
    return { title: 'Bergen · Service record', owner: audience === 'agent' ? 'Port agent' : 'Cruise line', rows: [['Service','Tug overtime'],['Record','Unused overtime noted'],['Quantity review',reviewed ? 'Record reviewed' : 'Agent and master review pending'],['Final-account acceptance','Separate decision']], action: 'Review the service record', result: 'The recorded quantity is reviewed in this sample. This does not accept the final account.' }
  }
  if (audience === 'tour') return { title: 'Bergen · Port account ownership', owner: 'DMC / shorex', rows: [['Port account','Agent and cruise-line review'],['DMC scope','Shore quote'],['Payment','No action available']], action: 'Port account review unavailable', result: '', unavailable: 'A DMC shore quote is a separate task. Explore coordination; this example does not grant port-account authority.' }
  return { title: 'Bergen · Call reconciliation', owner: audience === 'agent' ? 'Port agent' : 'Cruise line', rows: [['Proforma','412 380,00 kr'],['Unused tug overtime','11 130,00 kr'],['Final account','401 250,00 kr'],['Review',reviewed ? 'Difference reviewed' : 'Agent and master']], action: 'Compare the account', result: 'The difference is unused tug overtime. Reviewing it does not approve or pay the account.' }
}
