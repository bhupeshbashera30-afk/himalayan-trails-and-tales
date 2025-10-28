-- Insert sample destinations for each category
INSERT INTO public.destinations_2025_10_14_17_34 (category_id, name, description, location, price_range, images, features, contact_info, rating, is_featured) 
SELECT 
    c.id,
    d.name,
    d.description,
    d.location,
    d.price_range,
    d.images::jsonb,
    d.features::jsonb,
    d.contact_info::jsonb,
    d.rating,
    d.is_featured
FROM public.categories_2025_10_14_17_34 c
CROSS JOIN (
    VALUES 
    -- Pahadi Platter destinations
    ('Himalayan Spice Kitchen', 'Authentic Pahadi cuisine with traditional recipes passed down through generations', 'Nainital, Uttarakhand', '₹800-1500', '["https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800", "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800"]', '["Traditional Pahadi Thali", "Organic Ingredients", "Mountain View Dining", "Local Chef"]', '{"phone": "+91-9876543210", "email": "info@himalayanspice.com"}', 4.8, true),
    ('Mountain View Restaurant', 'Scenic dining experience with panoramic mountain views and local delicacies', 'Mussoorie, Uttarakhand', '₹600-1200', '["https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800"]', '["Scenic Views", "Local Cuisine", "Outdoor Seating"]', '{"phone": "+91-9876543211"}', 4.5, false),
    
    -- Rest & Nest destinations  
    ('Cozy Mountain Retreat', 'Comfortable homestay with modern amenities and breathtaking valley views', 'Shimla, Himachal Pradesh', '₹2500-4000', '["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800", "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800"]', '["WiFi", "Mountain View", "Fireplace", "Kitchen Access", "Parking"]', '{"phone": "+91-9876543212", "airbnb": "airbnb.com/rooms/12345"}', 4.9, true),
    ('Heritage Villa Stay', 'Traditional Pahadi architecture with modern comfort in serene surroundings', 'Ranikhet, Uttarakhand', '₹3000-5000', '["https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800"]', '["Heritage Property", "Garden", "Valley View", "Traditional Decor"]', '{"phone": "+91-9876543213"}', 4.7, false),
    
    -- Adventure Alley destinations
    ('Sky High Paragliding', 'Professional paragliding experience with certified instructors and safety equipment', 'Bir Billing, Himachal Pradesh', '₹3500-5000', '["https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=800", "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800"]', '["Certified Instructors", "Safety Equipment", "Video Recording", "Transport Included"]', '{"phone": "+91-9876543214", "website": "skyhighparagliding.com"}', 4.8, true),
    ('Alpine Skiing Adventures', 'Skiing lessons and equipment rental in pristine mountain slopes', 'Auli, Uttarakhand', '₹4000-6000', '["https://images.unsplash.com/photo-1551524164-6cf2ac8a1f1e?w=800"]', '["Equipment Rental", "Professional Instructors", "Multiple Slopes", "Beginner Friendly"]', '{"phone": "+91-9876543215"}', 4.6, false),
    
    -- Soul Spots destinations
    ('Tranquil Temple Valley', 'Ancient temple complex surrounded by peaceful gardens and meditation spaces', 'Kedarnath, Uttarakhand', 'Free-₹500', '["https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800", "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800"]', '["Ancient Temple", "Meditation Spaces", "Peaceful Gardens", "Spiritual Guidance"]', '{"phone": "+91-9876543216"}', 4.9, true),
    ('Sunrise Point Sanctuary', 'Perfect spot for meditation and sunrise viewing with panoramic Himalayan views', 'Kausani, Uttarakhand', 'Free', '["https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800"]', '["Sunrise Views", "Meditation Area", "Himalayan Panorama", "Peaceful Environment"]', '{}', 4.7, false)
) AS d(name, description, location, price_range, images, features, contact_info, rating, is_featured)
WHERE (c.slug = 'pahadi-platter' AND d.name IN ('Himalayan Spice Kitchen', 'Mountain View Restaurant'))
   OR (c.slug = 'rest-nest' AND d.name IN ('Cozy Mountain Retreat', 'Heritage Villa Stay'))
   OR (c.slug = 'adventure-alley' AND d.name IN ('Sky High Paragliding', 'Alpine Skiing Adventures'))
   OR (c.slug = 'soul-spots' AND d.name IN ('Tranquil Temple Valley', 'Sunrise Point Sanctuary'));

-- Insert sample packages
INSERT INTO public.packages_2025_10_14_17_34 (name, description, duration_days, price, destinations, inclusions, exclusions, images, is_featured, is_custom) VALUES
('Ultimate Pahadi Experience', 'Complete 5-day journey through authentic Pahadi culture, cuisine, adventure, and spirituality', 5, 25000, 
'["Himalayan Spice Kitchen", "Cozy Mountain Retreat", "Sky High Paragliding", "Tranquil Temple Valley"]',
'["Accommodation", "All Meals", "Transportation", "Adventure Activities", "Guide Services"]',
'["Personal Expenses", "Travel Insurance", "Tips"]',
'["https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800", "https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=800"]',
true, false),

('Adventure Seeker Special', 'Adrenaline-packed 3-day adventure package with paragliding, skiing, and mountain activities', 3, 18000,
'["Sky High Paragliding", "Alpine Skiing Adventures", "Cozy Mountain Retreat"]',
'["Adventure Activities", "Equipment Rental", "Accommodation", "Breakfast", "Transportation"]',
'["Lunch & Dinner", "Personal Expenses", "Travel Insurance"]',
'["https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800"]',
true, false),

('Spiritual Retreat Package', 'Peaceful 4-day spiritual journey with meditation, temple visits, and serene accommodations', 4, 15000,
'["Tranquil Temple Valley", "Sunrise Point Sanctuary", "Heritage Villa Stay", "Mountain View Restaurant"]',
'["Accommodation", "Vegetarian Meals", "Meditation Sessions", "Temple Visits", "Transportation"]',
'["Personal Expenses", "Donations", "Shopping"]',
'["https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800"]',
false, false),

('Foodie Paradise Tour', '3-day culinary adventure exploring authentic Pahadi cuisine and local food culture', 3, 12000,
'["Himalayan Spice Kitchen", "Mountain View Restaurant", "Cozy Mountain Retreat"]',
'["All Meals", "Cooking Classes", "Food Tours", "Accommodation", "Local Guide"]',
'["Transportation", "Personal Expenses", "Beverages"]',
'["https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800"]',
false, false);