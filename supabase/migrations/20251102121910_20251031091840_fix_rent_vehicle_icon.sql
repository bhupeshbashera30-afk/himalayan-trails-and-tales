/*
  # Fix Rent a Vehicle Icon

  1. Updates
    - Change "Rent a Vehicle" category icon from 'mountain' to 'car'
    - Ensures proper icon rendering in the navigation menu
*/

UPDATE public.categories_2025_10_14_17_34
SET icon = 'car'
WHERE slug = 'rent-vehicle';
