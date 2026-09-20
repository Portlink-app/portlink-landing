import { Anchor, Compass, Ship, ShipWheel } from 'lucide-react'

// Product evidence and limits: docs/CONNECTED-PORT-CALL.md.
// One participant vocabulary for the diagram and the adjacent role selector.
export const portCallRoles = [
  { id: 'cruise', label: 'Cruise line', title: 'Cruise lines', icon: Ship, body: 'Plan the itinerary, request an agent and review the estimate. Keep shore arrangements and operational changes tied to the call they affect.' },
  { id: 'agent', label: 'Port agent', title: 'Port agents', icon: Anchor, body: 'Accept the request and prepare the call. Bring the estimate, local arrangements and departure report into the same working record.' },
  { id: 'tour', label: 'DMC', title: 'DMCs & shore teams', icon: Compass, body: 'Receive a shore request with its port-call context. Quote the programme and manage bookings linked to that arrival.' },
  { id: 'vessel', label: 'Vessel', title: 'Vessel teams', icon: ShipWheel, body: 'Take the handover onboard, respond to operational amendments and confirm the departure report with the agent.' },
] as const

export type PortCallRole = typeof portCallRoles[number]['id']
type StoryStep = {
  label: string
  handoff: string
  title: string
  body: string
  detail: string
  record: string
  fields: readonly (readonly [string, string])[]
  active: readonly PortCallRole[]
  states: Record<PortCallRole, string>
}

export const portCallSteps: readonly StoryStep[] = [
  {
    label: 'Confirm', handoff: 'Cruise line → Port agent', title: 'A request becomes a working relationship.',
    body: 'The cruise line sends a port booking request. When the agent accepts, Portlink creates the shared call or connects the agent to the call already planned.',
    detail: 'The acceptance stays attached to the arrival it belongs to.',
    record: 'Agent confirmed', fields: [['Booking request', 'Accepted'], ['Port agent', 'Connected']],
    active: ['cruise', 'agent'], states: { cruise: 'Request accepted', agent: 'Call assigned', tour: 'Shore planning', vessel: 'Voyage ahead' },
  },
  {
    label: 'Plan ashore', handoff: 'Cruise line → DMC', title: 'The shore programme starts with the same call.',
    body: 'A shore request carries the arrival and expected passenger count to the DMC. Acceptance opens a tour intake for the DMC to quote.',
    detail: 'Accepting the brief starts the work. It does not confirm the excursion.',
    record: 'Shore intake open', fields: [['Shore request', 'Accepted'], ['Tour intake', 'Quote requested']],
    active: ['cruise', 'tour'], states: { cruise: 'Brief sent', agent: 'Call assigned', tour: 'Preparing quote', vessel: 'Voyage ahead' },
  },
  {
    label: 'Prepare', handoff: 'Port agent → Cruise line', title: 'Know what is ready. See what needs a decision.',
    body: 'The agent prepares the pro forma disbursement account, the estimate for the call. The cruise line can approve it or return it with a reason.',
    detail: 'Costs are linked to the call, with visibility set for the relevant roles.',
    record: 'Estimate in review', fields: [['Agent estimate', 'Submitted'], ['Line approval', 'Pending']],
    active: ['agent', 'cruise'], states: { cruise: 'Reviewing estimate', agent: 'Estimate submitted', tour: 'Shore programme', vessel: 'Preparing onboard' },
  },
  {
    label: 'Hand over', handoff: 'Shoreside ↔ Vessel', title: 'The work comes onboard with its context.',
    body: 'Moving the call into handover notifies the cruise line and port agent. The vessel team works from the shared call, with its arrangements and history attached.',
    detail: 'The handover is an explicit step in the call, with a record of the transition.',
    record: 'Handover started', fields: [['Call stage', 'Handover'], ['Working record', 'Carried forward']],
    active: ['cruise', 'agent', 'vessel'], states: { cruise: 'Handover started', agent: 'Local contact', tour: 'Shore programme', vessel: 'Taking handover' },
  },
  {
    label: 'Handle change', handoff: 'Operational change → Vessel', title: 'A new berth needs a recorded decision.',
    body: 'Once the voyage is active, a berth change is a material amendment. The proposal keeps the old value, the requested change and its reason together while it awaits acknowledgement.',
    detail: 'Small same-day time changes can apply automatically. Material changes follow the approval path.',
    record: 'Amendment proposed', fields: [['Change', 'New berth'], ['Acknowledgement', 'Pending']],
    active: ['cruise', 'vessel'], states: { cruise: 'Change proposed', agent: 'Call context', tour: 'Shore programme', vessel: 'Decision needed' },
  },
  {
    label: 'Close out', handoff: 'Port agent + Vessel → Finance', title: 'Departure has a shared sign-off.',
    body: 'The agent fills the departure report and the ship confirms it. Once both sides have signed, a final disbursement account can be generated from that report and the call\'s cost lines.',
    detail: 'Actual amounts are used where entered. Remaining lines use their estimates in the reconciliation.',
    record: 'Ready to reconcile', fields: [['Agent + ship', 'Report signed'], ['Final account', 'Ready to draft']],
    active: ['agent', 'vessel', 'cruise'], states: { cruise: 'Cost reconciliation', agent: 'Report signed', tour: 'Linked bookings', vessel: 'Report co-signed' },
  },
]
