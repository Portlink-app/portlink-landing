BEAT = 5
# Crop boxes use fractions of the actual demonstration screen.
STORIES = {
    'portlink': [
        ('calls', 'Find the arrival', 'Nordvik Aurora', 'Oslo · 19 September · 08:00', 'The call record names Havnegata Agency as the local agent.', (0, .12, .44, .47)),
        ('messages', 'Coordinate the berth', 'Berth 4', 'Pilot boarding · 06:40', 'The agent confirms the berth and pilot time in the call thread.', (.25, .11, .72, .38)),
        ('finance', 'Close the account', '6 040 kr over estimate', 'Final account · 319 040 kr', 'The final account shows which costs changed from the estimate.', (.65, .72, 1, .99)),
    ],
    'embark': [
        ('schedule', 'Open the day’s list', 'Two departures today', 'Fjord Cruise · Northern Lights Chase', 'The two highlighted rows separate today’s trips from the rest of the calendar.', (.16, .29, .48, .49)),
        ('schedule', 'Check the boat’s load', '5 of 12 places booked', 'Morning departure · Fjord Cruise', 'The operator can see the boat’s capacity before handing it to the guide.', (.49, .34, .64, .46)),
        ('field', 'Hand off to the guide', '08:00 Fjordcruise', 'On Tour · Select departure', 'The guide selects the morning trip in On Tour to start the departure.', (.335, .08, .58, .30)),
    ],
}
