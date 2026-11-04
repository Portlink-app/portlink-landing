"""Editorial content, in Butter's original landing-page order."""
PRODUCTS = {
    'portlink': {
        'name':'Portlink', 'other':'Embark', 'other_url':'/embark/', 'headline':'Coordinate the port call',
        'intro':'One working record for the cruise line, the port agent and the team ashore.',
        'roles':['Cruise operations','Port agencies','Shore excursions','Vessel teams'],
        'statement':'From the first berth request to the final account, every team works from the same port call.',
        'lead':'Follow a port call', 'lead_title':'One arrival. Every detail the port agent needs.',
        'detail':'An arrival in Ilulissat starts with the vessel, its window and the berth. The agent can see what still needs confirming before the ship arrives.',
        'second':'Shore excursions', 'second_title':'Ask the local operator what the tour can take.',
        'second_body':'The destination management company (DMC) needs two details for its shore programme: how many guests the boat can carry and how long the trip takes.',
        'story':'The operator replies in Embark. The DMC reviews the terms in Portlink.',
        'features':'Inside the port call', 'cards':[
            ('Port calls','See arrivals and berth status across the voyage.','calls'),
            ('Review','Follow each department’s approval on the same record.','review'),
            ('Finance','Compare the estimate with the final account, line by line.','finance'),
            ('Messages','Keep the conversation with the call it concerns.','messages')],
        'steps':[('Cruise line','Plan the call','Ilulissat','08:00 arrival'),('Destination team','Request terms','Icefjord by boat','Capacity requested'),('Local operator','Return the offer','12 guests','90 minutes')],
        'bridge':'Meet Embark', 'bridge_head':'See the excursion from the operator’s side.',
        'bridge_body':'Embark is the Portlink product for the people running the tour. Follow the same Icefjord request from the operator’s first reply to the guide’s guest list.',
        'cta':'Book a demo', 'contact':'https://portlink.app/#access',
        'close':'Walk through your next port call.', 'description':'Coordinate cruise calls, agent handoffs, shore excursions and disbursements in Portlink.'
    },
    'embark': {
        'name':'Embark', 'other':'Portlink', 'other_url':'/', 'headline':'Run the departure',
        'intro':'A Portlink product for tour operators. Manage the bookings, the guides and the guests on the quay.',
        'roles':['Tour operators','Local guides','Booking teams','Cruise partners'],
        'statement':'Take the booking, give the guide a departure sheet and check the guests in as they board.',
        'lead':'The day’s departures', 'lead_title':'Know which boat is going and who is aboard.',
        'detail':'Open the day in Embark and see the tour, departure time and bookings together. The guide can use the same departure to check guests in.',
        'second':'Trade requests', 'second_title':'Reply to the team building the shore programme.',
        'second_body':'A DMC working with a cruise line in Portlink asks for your boat’s capacity and tour duration. Reply from Embark so both sides can review the same terms.',
        'story':'An agreed offer sets the terms. Once guests are booked, the departure becomes the guide’s working record.',
        'features':'Inside the operation', 'cards':[
            ('Departures','Find the trips running today and their remaining capacity.','schedule'),
            ('Bookings','See which departure each reservation belongs to.','bookings'),
            ('Tour catalogue','Maintain the tours your booking team can offer.','tours'),
            ('On tour','Give the guide a guest list for check-in.','field')],
        'steps':[('Operator inbox','Read the request','Icefjord by boat','Capacity requested'),('Operator reply','Supply the terms','12 guests','90 minutes'),('Guide’s departure','Check guests in','10 booked','8 aboard')],
        'bridge':'The Portlink network', 'bridge_head':'Meet the destination team behind the request.',
        'bridge_body':'Cruise lines plan port calls in Portlink. DMCs use it to put together shore programmes. Embark gives the local operator a place in that exchange, alongside its own bookings and departures.',
        'cta':'Ask about Embark', 'contact':'mailto:pilot@portlink.app?subject=Embark%20demo%20enquiry',
        'close':'Walk through a day on your quay.', 'description':'Embark is a Portlink product for tour operators managing bookings, departures, guides and trade requests.'
    }
}
