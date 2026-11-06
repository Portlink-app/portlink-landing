export type Product = 'Portlink' | 'Embark'

export interface Scene {
  title: string
  body: string
  owner: string
  status: string
  fields: [string, string][]
}

export const scenes: Record<Product, Scene[]> = {
  Portlink: [
    { title: 'Start with the call.', body: 'The cruise line sets the arrival window. Its port agent can see which call needs a berth and when the vessel is due alongside.', owner: 'Cruise operations', status: 'Call planned', fields: [['Destination', 'Ilulissat'], ['Arrival window', '08:00 to 09:00'], ['Next action', 'Confirm berth']] },
    { title: 'Ask the people ashore.', body: 'A destination management company (DMC) prepares a shore excursion for the cruise line. It asks the local boat operator for the details still missing from the offer.', owner: 'Destination team', status: 'Terms requested', fields: [['Excursion', 'Icefjord by boat'], ['Requested', 'Capacity and duration'], ['Reply from', 'Local operator']] },
    { title: 'Bring the answer back.', body: 'The operator supplies the excursion terms in Embark. The DMC can review that answer against its original request before preparing the offer for the cruise line.', owner: 'Destination team', status: 'Ready for review', fields: [['Excursion', 'Icefjord by boat'], ['Capacity offered', '12 guests'], ['Duration offered', '90 minutes']] },
  ],
  Embark: [
    { title: 'Open the tour request.', body: 'A DMC putting together a cruise line’s programme needs a local boat. See which tour it is asking about and exactly which details it needs.', owner: 'Operator inbox', status: 'Reply needed', fields: [['Requested by', 'Destination team'], ['Excursion', 'Icefjord by boat'], ['Details needed', 'Capacity and duration']] },
    { title: 'Answer on your terms.', body: 'Send the capacity and duration you can offer. Your DMC partner reviews the answer in Portlink and can ask for changes before agreeing the terms.', owner: 'Operator reply', status: 'Terms supplied', fields: [['Boat capacity', '12 guests'], ['Duration', '90 minutes'], ['Sent to', 'Destination team']] },
    { title: 'Get the boat ready.', body: 'Once a booking is in, the departure is the guide’s working record. Check who is assigned and which guests still need to arrive.', owner: 'Departure sheet', status: 'Boarding', fields: [['Guide assigned', 'Alex'], ['Guests booked', '10 of 12'], ['Checked in', '8 of 10']] },
  ],
}
