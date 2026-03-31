/*
  # Seed Sample Questions
  
  Sample TNPSC exam questions across various subjects
  for testing and development purposes.
*/

INSERT INTO questions (question_text, question_ta, options, correct_answer, explanation, explanation_ta, subject, sub_topic, difficulty, year, is_pyq, tags) VALUES

-- Indian Polity Questions
(
  'Which article of the Indian Constitution guarantees the right to equality?',
  'இந்திய அரசியலமைப்பின் எந்த பிரிவு சமத்துவ உரிமையை உத்திரவாதம் செய்கிறது?',
  '["Article 12", "Article 14", "Article 19", "Article 21"]'::jsonb,
  1,
  'Article 14 guarantees equality before law and equal protection of the laws. It applies to all persons within India, not just citizens.',
  'பிரிவு 14 சட்டத்திற்கு முன் சமத்துவம் மற்றும் சட்ட பாதுகாப்பு உத்திரவாதம் செய்கிறது.',
  'Indian Polity',
  'Constitutional Rights',
  'Medium',
  2022,
  true,
  '["constitution", "equality", "rights"]'::jsonb
),

(
  'What is the maximum number of members in the Lok Sabha?',
  'லோக் சபாவில் அதிகபட்ச உறுப்பினர்கள் எத்தனை?',
  '["530", "545", "552", "560"]'::jsonb,
  2,
  'The Lok Sabha (House of the People) consists of not more than 552 members - not more than 530 elected members representing the States and not more than 20 members representing the Union Territories.',
  'லோக் சபாவில் அதிகபட்சம் 552 உறுப்பினர்கள் இருக்கலாம்.',
  'Indian Polity',
  'Parliament',
  'Easy',
  2021,
  true,
  '["lok sabha", "parliament"]'::jsonb
),

-- History Questions
(
  'The Pallava dynasty was founded by?',
  'பல்லவ வம்சத்தை நிறுவியவர் யார்?',
  '["Simhavishnu", "Mahendravarman I", "Narasimhavarman I", "Nandivarman III"]'::jsonb,
  0,
  'Simhavishnu is regarded as the real founder of the Pallava dynasty. He established the foundation of the dynasty in the Tondai region.',
  'சிம்மமிஷ்ணு பல்லவ வம்சத்தின் நிறுவனாகக் கருதப்படுகிறார்.',
  'Tamil Nadu History',
  'Pallava Dynasty',
  'Hard',
  2023,
  true,
  '["history", "pallava", "tamil"]'::jsonb
),

(
  'Who was the greatest Chola ruler?',
  'மிகப்பெரிய சோழ ஆட்சியாளர் யார்?',
  '["Rajaraja I", "Rajendra Chola I", "Karikala", "Parakesari"]'::jsonb,
  0,
  'Rajaraja I (985-1014 CE) was the greatest Chola ruler who expanded the empire and built the Thanjavur temple.',
  'ராஜ ராஜ பெரியவர் சோழ சாம்ராஜ்யத்தின் மிகப்பெரிய ஆட்சியாளர் ஆவார்.',
  'Tamil Nadu History',
  'Chola Dynasty',
  'Medium',
  2022,
  true,
  '["chola", "history"]'::jsonb
),

-- General Science Questions
(
  'What is the chemical formula of Ozone?',
  'ஓசோனின் வேதியியல் சூத்திரம் என்ன?',
  '["O", "O₂", "O₃", "O₄"]'::jsonb,
  2,
  'Ozone (O₃) is a triatomic form of oxygen. It is formed when oxygen molecules are split by ultraviolet radiation.',
  'ஓசோன் (O₃) ஆக்சிஜனின் முக்கூட்ட வடிவம்.',
  'General Science',
  'Chemistry',
  'Easy',
  2021,
  true,
  '["chemistry", "ozone"]'::jsonb
),

(
  'Which planet is known as the Red Planet?',
  'எந்த கோள் சிவப்பு கோள் என்று அழைக்கப்படுகிறது?',
  '["Venus", "Mars", "Jupiter", "Saturn"]'::jsonb,
  1,
  'Mars is known as the Red Planet due to its reddish appearance caused by iron oxide (rust) on its surface.',
  'செவ்வாய் கோள் அதன் மேற்பரப்பில் இரும்பு ஆக்சைடு காரணமாக சிவப்பாக உள்ளது.',
  'General Science',
  'Astronomy',
  'Easy',
  2020,
  true,
  '["astronomy", "planets"]'::jsonb
),

-- Economy Questions
(
  'What is the base year for the current GDP calculation in India?',
  'இந்தியாவில் தற்போதைய GDP கணக்கீட்டின் அடிப்படை ஆண்டு என்ன?',
  '["2004-05", "2011-12", "2014-15", "2015-16"]'::jsonb,
  2,
  'India changed its base year for GDP calculation from 2004-05 to 2011-12 in January 2015 to reflect more current economic conditions.',
  'இந்தியா 2015 ஆம் ஆண்டில் GDP கணக்கீட்டின் அடிப்படை ஆண்டை 2011-12 ஆக மாற்றியது.',
  'Economy',
  'National Income',
  'Hard',
  2023,
  true,
  '["economy", "gdp"]'::jsonb
),

(
  'GST was implemented in India on?',
  'GST இந்தியாவில் எந்த நாளில் செயல்படுத்தப்பட்டது?',
  '["April 1, 2016", "July 1, 2016", "January 1, 2017", "July 1, 2017"]'::jsonb,
  3,
  'Goods and Services Tax (GST) was implemented in India on July 1, 2017, replacing multiple indirect taxes.',
  'GST இந்தியாவில் ஜூலை 1, 2017 அன்று செயல்படுத்தப்பட்டது.',
  'Economy',
  'Taxation',
  'Medium',
  2022,
  true,
  '["gst", "tax"]'::jsonb
),

-- Geography Questions
(
  'Which is the longest river in India?',
  'இந்தியாவில் மிக நீளமான நதி எது?',
  '["Brahmaputra", "Ganges", "Godavari", "Narmada"]'::jsonb,
  1,
  'The Ganges River is the longest river in India with a length of 2,525 km. It flows through the northern plains of India.',
  'கங்கை நதி இந்தியாவிலேயே மிக நீளமான நதி ஆகும்.',
  'Geography',
  'Physical Geography',
  'Easy',
  2020,
  true,
  '["geography", "rivers"]'::jsonb
),

(
  'The Nilgiri Mountains are located in which state?',
  'நীலகிரி மலைகள் எந்த மாநிலத்தில் அமைந்துள்ளது?',
  '["Karnataka", "Tamil Nadu", "Kerala", "Andhra Pradesh"]'::jsonb,
  1,
  'The Nilgiri Mountains (Blue Mountains) are a mountain range in the Western Ghats located in Tamil Nadu, Kerala, and Karnataka.',
  'நீலகிரி மலைகள் தமிழ்நாடு, கேரளம் மற்றும் கர்நாடகாவில் அமைந்துள்ளது.',
  'Geography',
  'Physical Geography',
  'Medium',
  2021,
  true,
  '["nilgiri", "mountains"]'::jsonb
);
