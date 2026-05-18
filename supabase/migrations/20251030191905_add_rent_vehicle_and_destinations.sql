/*
  # Add Rent a Vehicle Category and Populate All Destinations

  1. Categories
    - Add base categories (Pahadi Platter, Rest & Nest, Adventure Alley, Soul Spots)
    - Add "Rent a Vehicle" category
  
  2. Soul Spots Destinations
    - Kedarnath, Badrinath, Nainital, Adi Kailash, Lipulekh, Om Parvat, Kainchi Dham, Jim Corbett, Kausani

  3. Adventure Alley Activities
    - Rafting, Trekking, Paragliding, Skiing, Lake Crossing, Water Sports

  4. Rent a Vehicle Options
    - Sedan, SUV, Tempo Traveller, Bike rentals
*/

DO $$
DECLARE
  v_soul_spots_id UUID;
  v_adventure_alley_id UUID;
  v_rent_vehicle_id UUID;
  v_pahadi_platter_id UUID;
  v_rest_nest_id UUID;
BEGIN
  INSERT INTO public.categories_2025_10_14_17_34 (name, slug, description, icon) VALUES
  ('Pahadi Platter', 'pahadi-platter', 'Authentic Pahadi restaurants and local cuisine experiences', 'utensils'),
  ('Rest & Nest', 'rest-nest', 'Comfortable stays and Airbnb accommodations', 'bed'),
  ('Adventure Alley', 'adventure-alley', 'Thrilling activities like paragliding, skiing, and boating', 'mountain'),
  ('Soul Spots', 'soul-spots', 'Peaceful locations for tranquil and spiritual experiences', 'heart'),
  ('Rent a Vehicle', 'rent-vehicle', 'Reliable vehicle rentals for your Himalayan journey', 'mountain')
  ON CONFLICT (slug) DO NOTHING;

  SELECT id INTO v_soul_spots_id FROM public.categories_2025_10_14_17_34 WHERE slug = 'soul-spots';
  SELECT id INTO v_adventure_alley_id FROM public.categories_2025_10_14_17_34 WHERE slug = 'adventure-alley';
  SELECT id INTO v_rent_vehicle_id FROM public.categories_2025_10_14_17_34 WHERE slug = 'rent-vehicle';
  SELECT id INTO v_pahadi_platter_id FROM public.categories_2025_10_14_17_34 WHERE slug = 'pahadi-platter';
  SELECT id INTO v_rest_nest_id FROM public.categories_2025_10_14_17_34 WHERE slug = 'rest-nest';

  INSERT INTO public.destinations_2025_10_14_17_34 (category_id, name, description, location, price_range, images, features, rating, is_featured)
  VALUES
    (v_soul_spots_id, 'Kedarnath', 'One of the most sacred Char Dham temples dedicated to Lord Shiva, nestled in the Garhwal Himalayas at 3,583m altitude', 'Rudraprayag District, Uttarakhand', '₹15,000 - ₹40,000', 
     '["https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&h=600&fit=crop"]',
     '["Sacred Temple", "Trekking Route", "Spiritual Journey", "Mountain Views"]', 4.9, true),
    
    (v_soul_spots_id, 'Badrinath', 'Ancient temple dedicated to Lord Vishnu, one of the holiest Hindu pilgrimage sites in the Char Dham circuit', 'Chamoli District, Uttarakhand', '₹12,000 - ₹35,000',
     '["https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800&h=600&fit=crop"]',
     '["Char Dham", "Holy Temple", "Mountain Sanctuary", "Hot Springs"]', 4.9, true),
    
    (v_soul_spots_id, 'Nainital', 'Picturesque hill station built around the emerald Naini Lake, offering serene views and pleasant weather', 'Nainital District, Uttarakhand', '₹5,000 - ₹20,000',
     '["https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=800&h=600&fit=crop"]',
     '["Naini Lake", "Boating", "Mall Road", "Scenic Beauty", "Hill Station"]', 4.7, true),
    
    (v_soul_spots_id, 'Adi Kailash', 'Sacred mountain peak resembling Mount Kailash, an important pilgrimage site for spiritual seekers', 'Pithoragarh District, Uttarakhand', '₹25,000 - ₹50,000',
     '["https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop"]',
     '["Sacred Peak", "Spiritual Journey", "Remote Location", "Trekking"]', 4.8, false),
    
    (v_soul_spots_id, 'Lipulekh', 'Ancient trade route and pilgrimage path on the India-Tibet border, offering breathtaking Himalayan views', 'Pithoragarh District, Uttarakhand', '₹30,000 - ₹60,000',
     '["https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop"]',
     '["Border Pass", "Trade Route", "High Altitude", "Mountain Views"]', 4.6, false),
    
    (v_soul_spots_id, 'Om Parvat', 'Natural rock formation displaying the sacred Om symbol, a divine wonder in the Himalayas', 'Pithoragarh District, Uttarakhand', '₹28,000 - ₹55,000',
     '["https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop"]',
     '["Natural Om Symbol", "Sacred Mountain", "Spiritual Site", "Remote Beauty"]', 4.8, false),
    
    (v_soul_spots_id, 'Kainchi Dham', 'Famous ashram founded by Neem Karoli Baba, attracting devotees and spiritual seekers worldwide', 'Nainital District, Uttarakhand', '₹3,000 - ₹10,000',
     '["https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&h=600&fit=crop"]',
     '["Spiritual Ashram", "Neem Karoli Baba", "Meditation", "Peaceful Environment"]', 4.8, true),
    
    (v_soul_spots_id, 'Jim Corbett National Park', 'India''s oldest national park, home to the majestic Bengal tiger and diverse wildlife', 'Nainital & Pauri Districts, Uttarakhand', '₹8,000 - ₹25,000',
     '["https://images.unsplash.com/photo-1534188753412-5df0e95bfcfc?w=800&h=600&fit=crop"]',
     '["Tiger Reserve", "Wildlife Safari", "Nature Trails", "Bird Watching"]', 4.7, true),
    
    (v_soul_spots_id, 'Kausani', 'Scenic hill station offering panoramic 300km views of Himalayan peaks including Nanda Devi and Trishul', 'Bageshwar District, Uttarakhand', '₹4,000 - ₹15,000',
     '["https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop"]',
     '["Himalayan Views", "Tea Gardens", "Sunrise Point", "Peaceful Retreat"]', 4.6, false),
    
    (v_adventure_alley_id, 'River Rafting', 'Experience thrilling white water rafting in the sacred Ganges, from gentle rapids to extreme challenges', 'Rishikesh, Uttarakhand', '₹500 - ₹3,000',
     '["https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop"]',
     '["White Water", "Multiple Rapids", "All Skill Levels", "Safety Equipment Included"]', 4.8, true),
    
    (v_adventure_alley_id, 'Trekking', 'Explore numerous trekking routes from easy nature walks to challenging high-altitude expeditions', 'Various Locations, Uttarakhand', '₹5,000 - ₹30,000',
     '["https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&h=600&fit=crop"]',
     '["Multiple Routes", "Guided Tours", "Mountain Scenery", "All Difficulty Levels"]', 4.7, true),
    
    (v_adventure_alley_id, 'Paragliding', 'Soar through the skies with breathtaking bird''s eye views of valleys, mountains, and rivers', 'Bir Billing, Pithoragarh, Mukteshwar', '₹2,500 - ₹5,000',
     '["https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=800&h=600&fit=crop"]',
     '["Tandem Flights", "Certified Pilots", "Photo/Video Package", "Mountain Views"]', 4.9, true),
    
    (v_adventure_alley_id, 'Skiing', 'Hit the slopes at world-class ski resorts with powdery snow and stunning Himalayan backdrops', 'Auli, Dayara Bugyal, Munsiyari', '₹3,000 - ₹10,000',
     '["https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop"]',
     '["Ski Equipment Rental", "Training Available", "Multiple Slopes", "Winter Sports"]', 4.7, true),
    
    (v_adventure_alley_id, 'Lake Crossing', 'Navigate pristine high-altitude lakes with kayaking, canoeing, and swimming adventures', 'Nainital, Bhimtal, Sattal', '₹300 - ₹1,500',
     '["https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=800&h=600&fit=crop"]',
     '["Kayaking", "Canoeing", "Swimming", "Scenic Beauty"]', 4.5, false),
    
    (v_adventure_alley_id, 'Water Sports', 'Enjoy a variety of water activities including jet skiing, banana boat rides, and speed boating', 'Tehri Lake, Rishikesh', '₹500 - ₹2,500',
     '["https://images.unsplash.com/photo-1535556116002-6281ff3e9f34?w=800&h=600&fit=crop"]',
     '["Jet Skiing", "Speed Boating", "Banana Rides", "Water Skiing"]', 4.6, false),
    
    (v_rent_vehicle_id, 'Sedan Car Rental', 'Comfortable sedans perfect for family trips and city tours with experienced drivers', 'All Major Cities, Uttarakhand', '₹2,500 - ₹4,000/day',
     '["https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=600&fit=crop"]',
     '["AC Vehicles", "Experienced Drivers", "Well Maintained", "Flexible Packages"]', 4.5, true),
    
    (v_rent_vehicle_id, 'SUV Rental', 'Spacious SUVs ideal for mountain terrain and group travel with ample luggage space', 'All Major Cities, Uttarakhand', '₹4,000 - ₹7,000/day',
     '["https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&h=600&fit=crop"]',
     '["4WD Available", "Group Travel", "Mountain Terrain", "Spacious"]', 4.7, true),
    
    (v_rent_vehicle_id, 'Tempo Traveller', 'Large capacity vehicles perfect for group tours and family gatherings', 'All Major Cities, Uttarakhand', '₹6,000 - ₹10,000/day',
     '["https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&h=600&fit=crop"]',
     '["12-17 Seater", "Group Tours", "Comfortable Seating", "Long Distance"]', 4.6, true),
    
    (v_rent_vehicle_id, 'Bike Rental', 'Explore mountain roads on two wheels with well-maintained bikes for adventure enthusiasts', 'Rishikesh, Nainital, Dehradun', '₹1,000 - ₹2,500/day',
     '["https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&h=600&fit=crop"]',
     '["Royal Enfield", "Adventure Bikes", "Helmets Included", "Scenic Routes"]', 4.7, false);
END $$;
