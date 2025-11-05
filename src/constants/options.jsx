export const SelectTravelList = [
    {
        id:1,
        title: 'Just Me',
        desc: 'A sole traveles in exploration',
        icon: '✈️',
        people:'1 person'
    },
    {
        id:2,
        title: 'A Couple',
        desc: 'Two traveles in tandem',
        icon: '🥂',
        people:'2 people'
    },
    {
        id:3,
        title: 'Family',
        desc: 'A group of fun loving adv',
        icon: '🏡',
        people:'3 to 5 People'
    },
    {
        id:4,
        title: 'Friends',
        desc: 'A bunch of thrill-seekes',
        icon: '⛵',
        people:'5 to 10 people'
    }
]

export const SelectBudgetOptions = [
    {
        id:1,
        title: 'Cheap',
        desc: 'Stay conscious of costs',
        icon: '💵',
    },
    {
        id:2,
        title: 'Moderate',
        desc: 'Keep cost on the average side',
        icon: '💰',
    },
    {
        id:3,
        title: 'Luxury',
        desc: 'Dont worry about cost',
        icon: '💸',
    }
]

export const AI_PROMPT = 'Generate Travel Plan for Location : {location}, for {totalDays} Days for {traveler} with a {budget} budget ,Give me a Hotels options list with Hotel Name, Hotel address, Price, hotel image url, geo coordinates, rating, descriptions and suggest itinerary with place Name, Place Details, Place Image Url, Geo Coordinates, ticket Pricing, rating, Time travel each of the location for {totalDays} days with each day plan with best time to visit in JSON format'

export const TripVibeOptions = [
    {
        id: 'scenic-chill',
        title: 'Chill & Scenic',
        desc: 'Slow mornings, iconic viewpoints, easygoing pace',
        icon: '🌅',
        value: 'chill scenic vibe focusing on iconic views and downtime'
    },
    {
        id: 'culture-story',
        title: 'Culture & Stories',
        desc: 'Museums, heritage walks, local artisans & culture',
        icon: '🏺',
        value: 'culture-forward vibe with museums, history, and local storytelling'
    },
    {
        id: 'adventure-outdoor',
        title: 'Adventure & Outdoor',
        desc: 'Hikes, nature escapes, and adrenaline activities',
        icon: '🧗',
        value: 'adventure heavy vibe with outdoor and adrenaline filled moments'
    },
    {
        id: 'hidden-gems',
        title: 'Hidden Gems',
        desc: 'Lesser known spots, indie cafes, local neighborhoods',
        icon: '🗺️',
        value: 'offbeat hidden gems with indie cafes and local neighborhoods'
    }
]

export const TripPaceOptions = [
    {
        id: 'slow',
        title: 'Slow & Easy',
        desc: 'Plenty of breathing room and downtime baked in',
        icon: '🍃',
        value: 'slow and easy pace'
    },
    {
        id: 'balanced',
        title: 'Balanced Flow',
        desc: 'Mix of highlights and breaks, nothing too rushed',
        icon: '⚖️',
        value: 'balanced flow pace'
    },
    {
        id: 'high-energy',
        title: 'High Energy',
        desc: 'Pack the days with experiences, minimal idle time',
        icon: '🔥',
        value: 'high energy pace with packed scheduling'
    }
]

export const InterestTagOptions = [
    { id: 'nature', label: 'Nature & Outdoors', icon: '🌿', value: 'nature & outdoors' },
    { id: 'food', label: 'Foodie Adventures', icon: '🍜', value: 'food & culinary experiences' },
    { id: 'nightlife', label: 'Nightlife', icon: '🎶', value: 'nightlife & live music' },
    { id: 'wellness', label: 'Wellness & Spa', icon: '💆', value: 'wellness & spa' },
    { id: 'kids', label: 'Family Friendly', icon: '🧸', value: 'family friendly activities' },
    { id: 'photography', label: 'Photo Spots', icon: '📸', value: 'photography worthy spots' },
    { id: 'shopping', label: 'Market & Shopping', icon: '🛍️', value: 'local markets and shopping' },
    { id: 'culture', label: 'Art & Culture', icon: '🎭', value: 'art, culture, and galleries' }
]

export const StayStyleOptions = [
    {
        id: 'local-guesthouse',
        title: 'Local Guesthouse',
        desc: 'Authentic stays, homestays, boutique guesthouses',
        icon: '🏡',
        value: 'local guesthouses or homestays'
    },
    {
        id: 'design-boutique',
        title: 'Design Boutique',
        desc: 'Stylish hotels with character and design focus',
        icon: '🛋️',
        value: 'design-focused boutique hotels'
    },
    {
        id: 'family-friendly',
        title: 'Family Friendly',
        desc: 'Rooms with space, pools, kid-friendly amenities',
        icon: '👨‍👩‍👧',
        value: 'family friendly stays with kid oriented amenities'
    },
    {
        id: 'upscale-luxury',
        title: 'Upscale Luxury',
        desc: 'Five-star comforts, premium service, resort vibes',
        icon: '🏨',
        value: 'upscale luxury hotels and resorts'
    }
]

export const DiningPreferenceOptions = [
    { id: 'street-food', label: 'Street Food', icon: '🍢', value: 'street food and hawkers' },
    { id: 'local-specialties', label: 'Local Specialties', icon: '🍲', value: 'must-try local specialties' },
    { id: 'plant-based', label: 'Plant Based', icon: '🥗', value: 'vegetarian/vegan friendly meals' },
    { id: 'coffee-brunch', label: 'Coffee & Brunch', icon: '☕', value: 'coffee shops and brunch spots' },
    { id: 'nightlife-bars', label: 'Cocktails & Bars', icon: '🍸', value: 'cocktail bars and nightlife dining' }
]

export const MobilityComfortOptions = [
    {
        id: 'walk-transit',
        title: 'Walk & Transit',
        desc: 'Happy to walk and use public transit',
        icon: '🚶',
        value: 'comfortable with walking and public transit'
    },
    {
        id: 'minimal-walking',
        title: 'Limit Walking',
        desc: 'Prefer short walks and easy transfers',
        icon: '🛺',
        value: 'prefer minimal walking with easy transfers'
    },
    {
        id: 'accessible',
        title: 'Accessible Friendly',
        desc: 'Need step-free routes and elevators when possible',
        icon: '♿',
        value: 'require accessible friendly routes and venues'
    },
    {
        id: 'private-driver',
        title: 'Private Driver',
        desc: 'Would like private transfers most of the time',
        icon: '🚗',
        value: 'prefer private transfers or drivers'
    }
]
