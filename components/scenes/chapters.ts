import S1Overview from './S1Overview'
import S2Calls from './S2Calls'
import S3Review from './S3Review'
import S4Finance from './S4Finance'
import S5Work from './S5Work'
import S6Messages from './S6Messages'
import S7Compliance from './S7Compliance'

// One registry for the chapter controls, copy, deep links and product compositions.
export const chapters = [
  {
    id: "dashboard",
    label: "Overview",
    title: "You decide what your dashboard looks like",
    body: "Add the widgets you actually watch, drop the ones you do not, and put them where you want them. The layout is yours, not a default somebody else picked.",
    component: S1Overview,
  },
  {
    id: "calls",
    label: "Port calls",
    title: "Every call, from every line, in one list",
    body: "Your whole schedule in one ledger, with the state of each call on the row: confirmed, awaiting a berth, in port, or still missing an agent. No separate portal per cruise line.",
    component: S2Calls,
  },
  {
    id: "review",
    label: "Review flow",
    title: "Each department signs off its own part",
    body: "A voyage moves from draft to approved one stage at a time. Everyone can see which stage it is on, who owes the next signature, and how long it has been sitting there.",
    component: S3Review,
  },
  {
    id: "finance",
    label: "Finance",
    title: "From PDA to FDA: every cost tracked against the estimate",
    body: "The proforma and the final account are the same object, line by line. The variance is on the screen while the call is still open, not in a reconciliation three weeks later.",
    component: S4Finance,
  },
  {
    id: "work",
    label: "Work",
    title: "Tasks, board and calendar in the same place as the call",
    body: "Work assigned across departments, on the record it belongs to. Nobody moves to another app to find out what is still open before the ship arrives.",
    component: S5Work,
  },
  {
    id: "messages",
    label: "Messages",
    title: "The conversation lives on the call record",
    body: "Agents, operations and shore operators talk in one thread attached to the call, with the attachments and the decisions in the same place. Not in an inbox somebody has to be copied into.",
    component: S6Messages,
  },
  {
    id: "compliance",
    label: "Compliance",
    title: "Permits and certificates stay current, and stay shared",
    body: "What is valid, what expires next month, and what is waiting for a counter-signature. Visible to the people on the call rather than filed on somebody's desktop.",
    component: S7Compliance,
  },
] as const
