-- ============================================================
-- Food Match — Seed Data
-- Run AFTER schema.sql in: Supabase Dashboard > SQL Editor
-- ============================================================

insert into foods (name, image_url, category, tags) values

-- Italian
('Margherita Pizza',
 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&auto=format&fit=crop',
 'Italian', array['vegetarian', 'cheesy', 'comfort food']),

('Pasta Carbonara',
 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=800&auto=format&fit=crop',
 'Italian', array['creamy', 'pasta', 'comfort food']),

('Lasagna',
 'https://images.unsplash.com/photo-1619895092538-128341789043?w=800&auto=format&fit=crop',
 'Italian', array['baked', 'cheesy', 'comfort food']),

-- Japanese
('Sushi Platter',
 'https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=800&auto=format&fit=crop',
 'Japanese', array['seafood', 'fresh', 'umami']),

('Tonkotsu Ramen',
 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop',
 'Japanese', array['noodles', 'broth', 'comfort food']),

('Chicken Katsu',
 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop',
 'Japanese', array['crispy', 'fried', 'comfort food']),

-- Mexican
('Street Tacos',
 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=800&auto=format&fit=crop',
 'Mexican', array['spicy', 'street food', 'meat']),

('Guacamole & Chips',
 'https://images.unsplash.com/photo-1601315488770-4d61cc3e5a9f?w=800&auto=format&fit=crop',
 'Mexican', array['vegetarian', 'fresh', 'dip']),

('Beef Burrito',
 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800&auto=format&fit=crop',
 'Mexican', array['filling', 'spicy', 'meat']),

-- American
('Smash Burger',
 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop',
 'American', array['juicy', 'comfort food', 'meat']),

('BBQ Ribs',
 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop',
 'American', array['smoky', 'grilled', 'meat']),

('Mac and Cheese',
 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=800&auto=format&fit=crop',
 'American', array['cheesy', 'comfort food', 'vegetarian']),

-- Indian
('Butter Chicken',
 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&auto=format&fit=crop',
 'Indian', array['curry', 'creamy', 'spiced']),

('Biryani',
 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=800&auto=format&fit=crop',
 'Indian', array['rice', 'aromatic', 'spiced']),

('Samosa',
 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop',
 'Indian', array['crispy', 'fried', 'street food', 'vegetarian']),

-- Thai
('Pad Thai',
 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800&auto=format&fit=crop',
 'Thai', array['noodles', 'peanut', 'street food']),

('Green Curry',
 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=800&auto=format&fit=crop',
 'Thai', array['spicy', 'curry', 'coconut']),

-- Chinese
('Dim Sum',
 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&auto=format&fit=crop',
 'Chinese', array['dumplings', 'steamed', 'seafood']),

('Peking Duck',
 'https://images.unsplash.com/photo-1624374531920-75e5b8d9b1b4?w=800&auto=format&fit=crop',
 'Chinese', array['crispy', 'roasted', 'meat']),

-- Vietnamese
('Pho Bo',
 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&auto=format&fit=crop',
 'Vietnamese', array['noodles', 'broth', 'fresh']),

('Bánh Mì',
 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop',
 'Vietnamese', array['sandwich', 'fresh', 'street food']),

-- Korean
('Korean BBQ',
 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800&auto=format&fit=crop',
 'Korean', array['grilled', 'meat', 'smoky']),

('Bibimbap',
 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&auto=format&fit=crop',
 'Korean', array['rice', 'healthy', 'colorful']),

-- Mediterranean
('Greek Salad',
 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&auto=format&fit=crop',
 'Mediterranean', array['fresh', 'vegetarian', 'healthy']),

('Lamb Shawarma',
 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=800&auto=format&fit=crop',
 'Mediterranean', array['street food', 'spiced', 'meat']),

('Hummus & Pita',
 'https://images.unsplash.com/photo-1622973536968-3ead9e780960?w=800&auto=format&fit=crop',
 'Mediterranean', array['vegetarian', 'dip', 'fresh']),

-- Healthy / Other
('Acai Bowl',
 'https://images.unsplash.com/photo-1590301157284-5d20fa2b9d3b?w=800&auto=format&fit=crop',
 'Healthy', array['vegan', 'fresh', 'sweet']),

('Caesar Salad',
 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=800&auto=format&fit=crop',
 'Healthy', array['fresh', 'crunchy', 'classic']),

-- Desserts
('Chocolate Lava Cake',
 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800&auto=format&fit=crop',
 'Dessert', array['chocolate', 'warm', 'indulgent']),

('Tiramisu',
 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800&auto=format&fit=crop',
 'Dessert', array['coffee', 'creamy', 'Italian']),

-- Breakfast
('Eggs Benedict',
 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=800&auto=format&fit=crop',
 'Breakfast', array['eggs', 'brunch', 'classic']),

('Avocado Toast',
 'https://images.unsplash.com/photo-1541519227354-08fa5d50c820?w=800&auto=format&fit=crop',
 'Breakfast', array['vegan', 'healthy', 'trendy']),

-- Seafood
('Fish and Chips',
 'https://images.unsplash.com/photo-1579208575657-c595a05383b7?w=800&auto=format&fit=crop',
 'British', array['crispy', 'fried', 'seafood']),

('Lobster Bisque',
 'https://images.unsplash.com/photo-1534073737927-85f1ebff1f5d?w=800&auto=format&fit=crop',
 'Seafood', array['creamy', 'rich', 'soup']),

('Grilled Salmon',
 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&auto=format&fit=crop',
 'Seafood', array['healthy', 'grilled', 'omega-3']),

-- Street Food
('Churros',
 'https://images.unsplash.com/photo-1624371414361-e670edf4a1e4?w=800&auto=format&fit=crop',
 'Spanish', array['sweet', 'fried', 'street food']),

('Spring Rolls',
 'https://images.unsplash.com/photo-1548943487-a2e4e43b4853?w=800&auto=format&fit=crop',
 'Asian', array['crispy', 'fried', 'street food']),

('Falafel Wrap',
 'https://images.unsplash.com/photo-1593001872095-7d5b3868dd20?w=800&auto=format&fit=crop',
 'Middle Eastern', array['vegetarian', 'street food', 'filling'])

on conflict do nothing;
