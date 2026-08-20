-- Add itinerary JSONB column to public.treks
ALTER TABLE public.treks ADD COLUMN IF NOT EXISTS itinerary JSONB DEFAULT '[]';

-- Update existing sample trek (Adi Kailash) with sample itinerary if empty
UPDATE public.treks 
SET itinerary = '[
  {
    "day": 1,
    "title": "Arrival in Kathgodam & Drive to Dharchula",
    "description": "Meet our team at Kathgodam railway station. Begin scenic drive along Kali River towards Dharchula passing through Pithoragarh.",
    "highlights": "Scenic Mountain Pass, Kali River Bank"
  },
  {
    "day": 2,
    "title": "Dharchula to Gunji / Navi",
    "description": "Acclimatization and inner line permit checks. Drive through rugged Himalayan terrains alongside snow-capped peaks.",
    "highlights": "Permit Checkpoint, High Altitude Transition"
  },
  {
    "day": 3,
    "title": "Excursion to Adi Kailash & Parvati Sarovar",
    "description": "Early morning drive towards Jolingkong for holy darshan of Sacred Mount Adi Kailash and Parvati Sarovar Lake.",
    "highlights": "Adi Kailash Darshan, Parvati Lake Reflection"
  },
  {
    "day": 4,
    "title": "Om Parwat Darshan & Return to Dharchula",
    "description": "Visit Nabhidhang for breathtaking views of natural snow-formed Om symbol on Mount Om Parwat. Return to Dharchula for overnight stay.",
    "highlights": "Natural Om Symbol, Himalayan Photography"
  },
  {
    "day": 5,
    "title": "Dharchula to Kathgodam Departure",
    "description": "Drive back to Kathgodam with unforgettable memories of Pahadi hospitality and sacred peaks.",
    "highlights": "Souvenir Shopping, Return Journey"
  }
]'::jsonb
WHERE (itinerary IS NULL OR itinerary = '[]'::jsonb);
