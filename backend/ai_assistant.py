# ============================================================
# COMPLETE AI ASSISTANT - WITH LOCATION AWARENESS
# English | Amharic | Afaan Oromo
# Can answer questions about Ethiopian regions, cities, and Haramaya University
# ============================================================

from gtts import gTTS
import os
import requests
from datetime import datetime
import time
import torch
import scipy.io.wavfile as wav
from transformers import VitsModel, AutoTokenizer
import math
import re


# OpenRouteService API Key for distance calculation
ORS_API_KEY = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjcwZjRiNWZlMjdkODRjZGRiNjU4ZDQ4NmJjYmI1MjNjIiwiaCI6Im11cm11cjY0In0=" # Paste your actual key here

# Load Oromo TTS model
print("Loading Oromo TTS model...")
oromo_model = VitsModel.from_pretrained("facebook/mms-tts-orm")
oromo_tokenizer = AutoTokenizer.from_pretrained("facebook/mms-tts-orm")
print("Oromo TTS ready!")


# ============================================================
# DISTANCE DATABASE (in kilometers)
# ============================================================

distance_database = {
    # Addis Ababa to major cities
    ("addis ababa", "bahir dar"): 484,
    ("addis ababa", "gondar"): 740,
    ("addis ababa", "mekelle"): 783,
    ("addis ababa", "hawassa"): 275,
    ("addis ababa", "jimma"): 355,
    ("addis ababa", "dire dawa"): 449,
    ("addis ababa", "harar"): 525,
    ("addis ababa", "dessie"): 400,
    ("addis ababa", "lalibela"): 570,
    ("addis ababa", "axum"): 850,
    ("addis ababa", "arba minch"): 480,
    ("addis ababa", "bishoftu"): 47,
    ("addis ababa", "adama"): 99,
    ("addis ababa", "haramaya"): 510,
    ("addis ababa", "haramaya university"): 510,
    
    # Haramaya University to other cities
    ("haramaya", "addis ababa"): 510,
    ("haramaya university", "addis ababa"): 510,
    ("haramaya", "dire dawa"): 50,
    ("haramaya university", "dire dawa"): 50,
    ("haramaya", "harar"): 40,
    ("haramaya university", "harar"): 40,
    ("haramaya", "jijiga"): 120,
    ("haramaya university", "jijiga"): 120,
    ("haramaya", "bahir dar"): 650,
    ("haramaya university", "bahir dar"): 650,
    ("haramaya", "mekelle"): 800,
    ("haramaya university", "mekelle"): 800,
    ("haramaya", "gondar"): 750,
    ("haramaya university", "gondar"): 750,
    
    # Bahir Dar to other cities
    ("bahir dar", "gondar"): 180,
    ("bahir dar", "mekelle"): 390,
    ("bahir dar", "addis ababa"): 484,
    ("bahir dar", "haramaya"): 650,
    ("bahir dar", "haramaya university"): 650,
    
    # Gondar to other cities
    ("gondar", "mekelle"): 220,
    ("gondar", "bahir dar"): 180,
    ("gondar", "addis ababa"): 740,
    ("gondar", "haramaya"): 750,
    
    # Mekelle to other cities
    ("mekelle", "addis ababa"): 783,
    ("mekelle", "bahir dar"): 390,
    ("mekelle", "gondar"): 220,
    ("mekelle", "haramaya"): 800,
    
    # Dire Dawa to other cities
    ("dire dawa", "addis ababa"): 449,
    ("dire dawa", "harar"): 55,
    ("dire dawa", "haramaya"): 50,
    ("dire dawa", "haramaya university"): 50,
    ("dire dawa", "jijiga"): 110,
    
    # Harar to other cities
    ("harar", "addis ababa"): 525,
    ("harar", "dire dawa"): 55,
    ("harar", "haramaya"): 40,
    ("harar", "haramaya university"): 40,
    
    # Jijiga to other cities
    ("jijiga", "dire dawa"): 110,
    ("jijiga", "harar"): 120,
    ("jijiga", "haramaya"): 120,
    
    # Other Ethiopian cities
    ("hawassa", "arba minch"): 280,
    ("jimma", "bishoftu"): 320,
    ("dessie", "kombolcha"): 25,
    ("awassa", "shashamane"): 30,
    ("nazret", "adama"): 5,
}

# ============================================================
# HARAMAYA UNIVERSITY INTERNAL DISTANCES (in meters)
# ============================================================

haramaya_internal_distances = {
    # From Main Library to various locations
    ("main library", "administration building"): 200,
    ("main library", "college of law"): 1500,
    ("main library", "college of health sciences"): 800,
    ("main library", "college of agriculture"): 600,
    ("main library", "science college"): 400,
    ("main library", "main cafeteria"): 100,
    ("main library", "university coffee shop"): 50,
    ("main library", "student center"): 300,
    ("main library", "student union"): 350,
    ("main library", "main stadium"): 500,
    ("main library", "freshmen dormitories"): 250,
    ("main library", "continuing students dormitory a"): 400,
    ("main library", "continuing students dormitory b"): 450,
    ("main library", "continuing students dormitory c"): 500,
    ("main library", "continuing students dormitory d"): 550,
    ("main library", "female students hostel"): 600,
    ("main library", "male students hostel"): 700,
    ("main library", "post graduate hostel"): 1200,
    ("main library", "international students hostel"): 800,
    ("main library", "teaching hospital"): 1800,
    
    # From Law Library (Harar campus) - different campus!
    ("law library", "harar campus main building"): 100,
    ("law library", "law college canteen"): 50,
    ("law library", "harar campus hostel"): 300,
    
    # From Main Cafeteria
    ("main cafeteria", "university coffee shop"): 150,
    ("main cafeteria", "student center"): 200,
    ("main cafeteria", "main library"): 100,
    ("main cafeteria", "science college"): 350,
    
    # From Main Stadium
    ("main stadium", "basketball court"): 100,
    ("main stadium", "volleyball court"): 150,
    ("main stadium", "tennis court"): 200,
    ("main stadium", "gymnasium"): 250,
    ("main stadium", "running track"): 50,
    ("main stadium", "football practice field"): 150,
    ("main stadium", "handball court"): 80,
    ("main stadium", "student center"): 700,
    ("main stadium", "main library"): 500,
    
    # Between Dormitories
    ("freshmen dormitories", "continuing students dormitory a"): 300,
    ("freshmen dormitories", "female students hostel"): 500,
    ("freshmen dormitories", "male students hostel"): 600,
    ("continuing students dormitory a", "continuing students dormitory b"): 100,
    ("continuing students dormitory b", "continuing students dormitory c"): 100,
    ("continuing students dormitory c", "continuing students dormitory d"): 100,
    ("female students hostel", "male students hostel"): 400,
    
    # Between Colleges
    ("college of health sciences", "college of medicine"): 50,
    ("college of health sciences", "college of nursing"): 50,
    ("college of health sciences", "college of pharmacy"): 80,
    ("college of agriculture", "college of veterinary medicine"): 200,
    ("college of agriculture", "agriculture research farm"): 500,
    ("college of law", "college of social sciences"): 800,
    ("college of natural sciences", "college of computing"): 100,
    ("college of business", "college of economics"): 50,
    ("college of education", "college of behavioral sciences"): 50,
    
    # To/from Raare Campus (Post Graduate)
    ("raare campus", "main campus"): 2000,
    ("raare campus", "post graduate hostel"): 100,
    ("raare campus", "post graduate cafe"): 50,
    ("main library", "raare campus"): 2000,
    
    # Sports Facilities
    ("basketball court", "volleyball court"): 80,
    ("basketball court", "tennis court"): 100,
    ("gymnasium", "main stadium"): 250,
}

def get_haramaya_distance(from_place, to_place):
    """Get distance between two locations within Haramaya University campus"""
    from_lower = from_place.lower().strip()
    to_lower = to_place.lower().strip()
    
    # Try direct match
    key1 = (from_lower, to_lower)
    key2 = (to_lower, from_lower)
    
    if key1 in haramaya_internal_distances:
        return haramaya_internal_distances[key1]
    elif key2 in haramaya_internal_distances:
        return haramaya_internal_distances[key2]
    
    # Try partial matches for common variations
    variations = {
        "library": "main library",
        "main lib": "main library",
        "lib": "main library",
        "admin": "administration building",
        "administration": "administration building",
        "stadium": "main stadium",
        "sports": "main stadium",
        "cafe": "main cafeteria",
        "cafeteria": "main cafeteria",
        "dorm": "freshmen dormitories",
        "hostel": "female students hostel",
        "health science": "college of health sciences",
        "medical": "college of health sciences",
    }
    
    from_place = variations.get(from_lower, from_lower)
    to_place = variations.get(to_lower, to_lower)
    
    key1 = (from_place, to_place)
    key2 = (to_place, from_place)
    
    if key1 in haramaya_internal_distances:
        return haramaya_internal_distances[key1]
    elif key2 in haramaya_internal_distances:
        return haramaya_internal_distances[key2]
    
    return None



# ============================================================
# COMPLETE ETHIOPIA DATABASE - ALL REGIONS AND CITIES
# ============================================================

ethiopia_regions = {
    "oromia": {
        "capital": "Addis Ababa",
        "cities": ["Adama", "Jimma", "Bishoftu", "Shashamane", "Ambo", "Nekemte", "Asella"],
        "desc_en": "Oromia is the largest region in Ethiopia.",
        "desc_om": "Oromiyaan naannoo Ethiopia keessatti baay'ee lafa guddaa qaba.",
        "desc_am": "ኦሮሚያ በኢትዮጵያ ውስጥ ትልቁ ክልል ነው።"
    },
    "amhara": {
        "capital": "Bahir Dar",
        "cities": ["Gondar", "Dessie", "Lalibela", "Debre Markos", "Woldia"],
        "desc_en": "Amhara region is home to the historic cities of Gondar and Lalibela.",
        "desc_om": "Naannoon Amhaara magaalaa seenaa Gonder fi Lalibela qaba.",
        "desc_am": "አማራ ክልል የጎንደር እና የላሊበላ ታሪካዊ ከተሞች መኖሪያ ነው።"
    },
    "tigray": {
        "capital": "Mekelle",
        "cities": ["Adigrat", "Axum", "Adwa", "Shire", "Wukro"],
        "desc_en": "Tigray is known for the ancient kingdom of Axum.",
        "desc_om": "Tigraay mootummaa Axum keessatti beekama.",
        "desc_am": "ትግራይ በጥንታዊቷ የአክሱም መንግሥት ትታወቃለች።"
    },
    "sidama": {
        "capital": "Hawassa",
        "cities": ["Yirgalem", "Wondogenet", "Aleta Wondo", "Dila"],
        "desc_en": "Sidama region is known for coffee production.",
        "desc_om": "Naannoon Sidaamaa bunii qopheessuun beekama.",
        "desc_am": "ሲዳማ ክልል በቡና ምርት ትታወቃለች።"
    }
}

ethiopia_cities = {
    "addis ababa": {"region": "Oromia", "lat": 9.0320, "lon": 38.7469,
        "desc_en": "The capital and largest city of Ethiopia.",
        "desc_am": "የኢትዮጵያ ዋና ከተማ እና ትልቁ ከተማ።",
        "desc_om": "Magaalaa guddoo fi guddoodha Ethiopia."},
    "bahir dar": {"region": "Amhara", "lat": 11.5742, "lon": 37.3613,
        "desc_en": "City on Lake Tana, near the Blue Nile Falls.",
        "desc_am": "በጣና ሀይቅ ላይ የምትገኝ ከተማ።",
        "desc_om": "Magaalaa Haroo Taanaa irratti."},
    "gondar": {"region": "Amhara", "lat": 12.6000, "lon": 37.4667,
        "desc_en": "Famous for its medieval castles.",
        "desc_am": "በመካከለኛው ዘመን ቤተ መንግሥቶቿ ትታወቃለች።",
        "desc_om": "Da'annoo isaa jaarmiiwwan kan beekamu."},
    "lalibela": {"region": "Amhara", "lat": 12.0333, "lon": 39.0500,
        "desc_en": "Famous for its 11 rock-hewn churches.",
        "desc_am": "በአስራ አንድ ከዓለት በተፈለፈሉ አብያተ ክርስቲያናት ትታወቃለች።",
        "desc_om": "Waldoota dhagaa 11'n kan beekamtu."},
    "axum": {"region": "Tigray", "lat": 14.1333, "lon": 38.7167,
        "desc_en": "Ancient capital of the Aksumite Empire.",
        "desc_am": "የአክሱም መንግሥት ጥንታዊ ዋና ከተማ።",
        "desc_om": "Magaalaa guddoo mootummaa Aksumite."},
    "hawassa": {"region": "Sidama", "lat": 7.0621, "lon": 38.4763,
        "desc_en": "Capital of Sidama region, on Lake Hawassa.",
        "desc_am": "የሲዳማ ክልል ዋና ከተማ።",
        "desc_om": "Magaalaa guddoo naannoo Sidaamaa."},
    "jimma": {"region": "Oromia", "lat": 7.6667, "lon": 36.8333,
        "desc_en": "Major coffee production center.",
        "desc_am": "ዋና የቡና ማምረቻ ማዕከል።",
        "desc_om": "Iddoo guddaa oomisha bunaatiif."},
    "mekelle": {"region": "Tigray", "lat": 13.4967, "lon": 39.4769,
        "desc_en": "Capital of Tigray region.",
        "desc_am": "የትግራይ ክልል ዋና ከተማ።",
        "desc_om": "Magaalaa guddoo naannoo Tigraay."}
}



def calculate_distance(lat1, lon1, lat2, lon2):
    R = 6371
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lon = math.radians(lon2 - lon1)
    a = math.sin(delta_lat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lon/2)**2
    c = 2 * math.asin(math.sqrt(a))
    return R * c

def get_region_info(region_query):
    region_query = region_query.lower().strip()
    for region_key, region_data in ethiopia_regions.items():
        if region_key in region_query:
            return {
                'en': f"{region_key.title()} region. Capital: {region_data['capital']}. {region_data['desc_en']}",
                'om': f"Naannoo {region_key.title()}. Magaalaa Guddaa: {region_data['capital']}. {region_data['desc_om']}",
                'am': f"{region_key.title()} ክልል። ዋና ከተማ: {region_data['capital']}. {region_data['desc_am']}"
            }
    return None

def get_city_info(city_query):
    city_query = city_query.lower().strip()
    for city_name, city_data in ethiopia_cities.items():
        if city_name in city_query:
            return {
                'en': f"{city_name.title()} is in {city_data['region']} region. {city_data['desc_en']}",
                'om': f"{city_name.title()} naannoo {city_data['region']} keessatti argama. {city_data['desc_om']}",
                'am': f"{city_name.title()} በ{city_data['region']} ክልል ውስጥ ትገኛለች። {city_data['desc_am']}"
            }
    return None

def get_distance_info(city1, city2):
    city1 = city1.lower().strip()
    city2 = city2.lower().strip()
    
    city_mapping = {
        "addis": "addis ababa", "addis ababa": "addis ababa", "bahir dar": "bahir dar",
        "gondar": "gondar", "lalibela": "lalibela", "mekelle": "mekelle",
        "hawassa": "hawassa", "jimma": "jimma", "dire dawa": "dire dawa",
        "harar": "harar", "dessie": "dessie", "arba minch": "arba minch",
        "axum": "axum", "adama": "adama", "bishoftu": "bishoftu"
    }
    
    city1 = city_mapping.get(city1, city1)
    city2 = city_mapping.get(city2, city2)
    
    if city1 in ethiopia_cities and city2 in ethiopia_cities:
        dist = calculate_distance(
            ethiopia_cities[city1]['lat'], ethiopia_cities[city1]['lon'],
            ethiopia_cities[city2]['lat'], ethiopia_cities[city2]['lon']
        )
        return {
            'en': f"The distance between {city1.title()} and {city2.title()} is approximately {dist:.0f} kilometers.",
            'om': f"Fageenyi {city1.title()} fi {city2.title()} gidduu jiru {dist:.0f} kiloomeetira.",
            'am': f"በ{city1.title()} እና {city2.title()} መካከል ያለው ርቀት {dist:.0f} ኪሎ ሜትር ነው።"
        }
    return None
# ============================================================
# DISTANCE CALCULATION FUNCTIONS (CORRECTED VERSION)
# ============================================================

ORS_API_KEY = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjcwZjRiNWZlMjdkODRjZGRiNjU4ZDQ4NmJjYmI1MjNjIiwiaCI6Im11cm11cjY0In0="
ORS_GEOCODE_URL = "https://api.openrouteservice.org/geocode/search"

def get_coordinates(location_name):
    """Convert location name to coordinates (longitude, latitude)"""
    try:
        params = {"text": location_name, "size": 1, "api_key": ORS_API_KEY}
        response = requests.get(ORS_GEOCODE_URL, params=params)
        data = response.json()
        
        if data.get('features') and len(data['features']) > 0:
            # API returns [longitude, latitude]
            lon, lat = data['features'][0]['geometry']['coordinates']
            print(f"   Found {location_name}: lon={lon}, lat={lat}")
            return lon, lat
        else:
            print(f"   Could not find {location_name}")
            return None, None
    except Exception as e:
        print(f"   Geocoding error for {location_name}: {e}")
        return None, None

def calculate_real_distance(origin, destination):
    """Calculate real road distance between two locations"""
    try:
        print(f"\n🚗 Calculating distance from '{origin}' to '{destination}'...")
        
        # Get coordinates
        origin_lon, origin_lat = get_coordinates(origin)
        dest_lon, dest_lat = get_coordinates(destination)
        
        if origin_lon is None or dest_lon is None:
            return None, None
        
        # Build the correct URL format
        url = f"https://api.openrouteservice.org/v2/directions/driving/{origin_lon},{origin_lat}/{dest_lon},{dest_lat}"
        params = {'api_key': ORS_API_KEY}
        
        print(f"   URL: {url}")
        
        response = requests.get(url, params=params)
        print(f"   Status code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if 'features' in data and data['features']:
                segment = data['features'][0]['properties']['segments'][0]
                distance_km = segment['distance'] / 1000
                duration_min = segment['duration'] / 60
                print(f"   ✅ Distance: {distance_km:.0f} km, Duration: {duration_min:.0f} min")
                return distance_km, duration_min
            else:
                print(f"   ❌ No route found")
                return None, None
        else:
            print(f"   ❌ API Error: {response.text[:200]}")
            return None, None
        
    except Exception as e:
        print(f"   ❌ Distance calculation error: {e}")
        return None, None



# ============================================================
# PROCESS LOCATION QUERY FUNCTION
# ============================================================

def process_location_query(text):
    text_lower = text.lower().strip()
    
    # ============================================================
    # HARAMAYA UNIVERSITY INTERNAL DISTANCES
    # ============================================================
    haramaya_match = re.search(r'how far is (.+?) from (.+?)(?:\?|$)', text_lower, re.IGNORECASE)
    if haramaya_match:
        from_place = haramaya_match.group(1).strip()
        to_place = haramaya_match.group(2).strip()
        
        distance_m = get_haramaya_distance(from_place, to_place)
        
        if distance_m:
            return {
                'en': f"The distance from {from_place.title()} to {to_place.title()} within Haramaya University campus is approximately {distance_m} meters.",
                'om': f"Fageenyi {from_place.title()} fi {to_place.title()} gidduu jiru yunivarsitii Haramaya keessatti {distance_m} meetira.",
                'am': f"በሐረማያ ዩኒቨርሲቲ ግቢ ውስጥ ከ{from_place.title()} እስከ {to_place.title()} ያለው ርቀት በግምት {distance_m} ሜትር ነው።"
            }
    
    # ============================================================
    # DISTANCE BETWEEN TWO LOCATIONS (Cities/Regions)
    # ============================================================
    distance_match = re.search(r'distance between (.+?) and (.+?)(?:\?|$)', text_lower, re.IGNORECASE)
    if distance_match:
        origin = distance_match.group(1).strip().title()
        destination = distance_match.group(2).strip().title()
        
        distance_km = get_simple_distance(origin, destination)
        
        if distance_km:
            return {
                'en': f"The distance between {origin} and {destination} is approximately {distance_km} kilometers.",
                'om': f"Fageenyi {origin} fi {destination} gidduu jiru {distance_km} kiloomeetira.",
                'am': f"በ{origin} እና {destination} መካከል ያለው ርቀት {distance_km} ኪሎ ሜትር ነው።"
            }
        else:
            return {
                'en': f"Sorry, I don't have distance data for {origin} to {destination}. Try cities like Addis Ababa, Bahir Dar, or Haramaya.",
                'om': f"Dhiifama, odeeffannoo fageenyaa {origin} fi {destination} gidduu hin qabu.",
                'am': f"ይቅርታ፣ የርቀት መረጃ የለኝም በ{origin} እና {destination} መካከል።"
            }
    
    # ============================================================
    # GENERAL CONVERSATION
    # ============================================================
    if "hello" in text_lower or "hi" in text_lower:
        return {
            'en': "Hello! Welcome to Ethiopian AI assistant. How can I help you?",
            'om': "Akkam! Asstistanti Ethiopia baga nagaan dhufte.",
            'am': "ሰላም! ወደ ኢትዮጵያ ኤአይ ረዳት እንኳን ደህና መጡ።"
        }
    
    if "how are you" in text_lower:
        return {
            'en': "I am doing well, thank you for asking!",
            'om': "Ani fayyaadha, galatoomaa na gaafachuu keessaniif!",
            'am': "ደህና ነኝ፣ ስለጠየቁኝ አመሰግናለሁ!"
        }
    
    if "your name" in text_lower:
        return {
            'en': "I am Ethiopian AI Assistant. You can call me Ethiopia Assistant.",
            'om': "Ani asstistanti Ethiopia keessan. Na Ethiopia Assistant jedhamu waamuu dandeessu.",
            'am': "እኔ የኢትዮጵያ ረዳትዎ ነኝ። ኢትዮጵያ አሲስታንት ብለው ሊጠሩኝ ይችላሉ።"
        }
    
    if "thank" in text_lower:
        return {
            'en': "You are welcome! I am happy to help you.",
            'om': "Galatoomi! Gargaaruu keessan gammadeera.",
            'am': "ምንም አይደለም! መርዳቴ ደስ ብሎኛል።"
        }
    
    # ============================================================
    # CALCULATIONS
    # ============================================================
    calc_match = re.search(r'(\d+)\s*[\+\-\*\/]\s*(\d+)', text_lower)
    if calc_match:
        num1 = int(calc_match.group(1))
        num2 = int(calc_match.group(2))
        if '+' in text_lower:
            result = num1 + num2
            op = "plus"
        elif '-' in text_lower:
            result = num1 - num2
            op = "minus"
        elif '*' in text_lower or 'times' in text_lower:
            result = num1 * num2
            op = "times"
        elif '/' in text_lower or 'divided by' in text_lower:
            result = num1 / num2
            op = "divided by"
        else:
            result = None
        
        if result is not None:
            return {
                'en': f"{num1} {op} {num2} equals {result}",
                'om': f"{num1} fi {num2} walitti ida'ame {result} ta'a",
                'am': f"{num1} ሲደመር {num2} እኩል ነው {result}"
            }
    
    # ============================================================
    # FACTS ABOUT ETHIOPIA
    # ============================================================
    if "capital of ethiopia" in text_lower:
        return {
            'en': "The capital of Ethiopia is Addis Ababa, which means 'New Flower' in Amharic.",
            'om': "Magaalaan guddoo Ethiopia Addis Ababa ti.",
            'am': "የኢትዮጵያ ዋና ከተማ አዲስ አበባ ነው።"
        }
    
    if "population of ethiopia" in text_lower:
        return {
            'en': "Ethiopia has approximately 120 million people.",
            'om': "Ethiopiyaan nama miiliyoona 120 qabdi.",
            'am': "ኢትዮጵያ በግምት 120 ሚሊዮን ህዝብ አላት።"
        }
    
    if "currency of ethiopia" in text_lower:
        return {
            'en': "The currency of Ethiopia is the Ethiopian Birr (ETB).",
            'om': "Maallaqaan Ethiopia Birr Ethiopia (ETB) ti.",
            'am': "የኢትዮጵያ ገንዘብ የኢትዮጵያ ብር ነው።"
        }
    
    # ============================================================
    # PRESIDENTS
    # ============================================================
    if "president of ethiopia" in text_lower:
        return {
            'en': "The President of Ethiopia is Taye Atske Selassie. The Prime Minister is Abiy Ahmed.",
            'om': "Pirezidaanti Ethiopia Taye Atske Selassie ti. Ministeeraan Abiy Ahmed ti.",
            'am': "የኢትዮጵያ ፕሬዝዳንት ታዬ አጽቀ ሥላሴ ናቸው። ጠቅላይ ሚኒስትሩ ዐቢይ አህመድ ናቸው።"
        }
    
    if "president of oromia" in text_lower:
        return {
            'en': "The President of Oromia region is Shimelis Abdisa.",
            'om': "Pirezidaanti naannoo Oromiyaa Shimelis Abdisa ti.",
            'am': "የኦሮሚያ ክልል ፕሬዝዳንት ሽመልስ አብዲሳ ነው።"
        }
    
    if "president of amhara" in text_lower:
        return {
            'en': "The President of Amhara region is Arega Kebede.",
            'om': "Pirezidaanti naannoo Amhaara Aregaa Kabadaa ti.",
            'am': "የአማራ ክልል ፕሬዝዳንት አረጋ ከበደ ነው።"
        }
    
    if "president of tigray" in text_lower:
        return {
            'en': "The President of Tigray region is Getachew Reda.",
            'om': "Pirezidaanti naannoo Tigraay Getaachew Reda ti.",
            'am': "የትግራይ ክልል ፕሬዝዳንት ጌታቸው ረዳ ነው።"
        }
    
    # ============================================================
    # UNIVERSITY PRESIDENTS
    # ============================================================
    if "president of addis ababa university" in text_lower:
        return {
            'en': "The President of Addis Ababa University is Dr. Tassew Woldehanna.",
            'om': "Pirezidaanti Yunivarsitii Finfinnee Dr. Tasseew Woldehaanaa jedhama.",
            'am': "የአዲስ አበባ ዩኒቨርሲቲ ፕሬዝዳንት ዶ/ር ታሰው ወልደሃና ናቸው።"
        }
    
    if "president of jimma university" in text_lower:
        return {
            'en': "The President of Jimma University is Dr. Jemal Abafita.",
            'om': "Pirezidaanti Yunivarsitii Jimma Dr. Jamaal Abaafitaa jedhama.",
            'am': "የጅማ ዩኒቨርሲቲ ፕሬዝዳንት ዶ/ር ጀማል አባፊታ ናቸው።"
        }
    
    if "president of haramaya university" in text_lower:
        return {
            'en': "The President of Haramaya University is Dr. Jemal Yousuf.",
            'om': "Pirezidaanti Yunivarsitii Haramayaa Dr. Jamaal Yuusuf jedhama.",
            'am': "የሐረማያ ዩኒቨርሲቲ ፕሬዝዳንት ዶ/ር ጀማል ዩሱፍ ናቸው።"
        }
    
    # ============================================================
    # HARAMAYA UNIVERSITY - DETAILED INFORMATION
    # ============================================================
    
    if "haramaya university" in text_lower or "haramaya" in text_lower:
        if "management" in text_lower:
            return {
                'en': "Haramaya University is led by President Dr. Jemal Yousuf, Vice Presidents, and Senate Council. The university has 9 colleges and 5 schools.",
                'om': "Universiti Haramaya Pirezidaanti Dr. Jamaal Yuusuf, Varris Pirezidaanti, fi Mootummaan geggeeffama. Universitiin kolleejota 9 fi manneen barnootaa 5 qaba.",
                'am': "የሐረማያ ዩኒቨርሲቲ በፕሬዝዳንት ዶ/ር ጀማል ዩሱፍ፣ ምክትል ፕሬዝዳንቶች እና ሴኔት ምክር ቤት ይመራል። ዩኒቨርሲቲው 9 ኮሌጆች እና 5 ትምህርት ቤቶች አሉት።"
            }
        elif "library" in text_lower:
            return {
                'en': "Haramaya University has two main libraries: Main Library (John G. Kester Library) with over 200,000 books, and College of Law Library in Harar city.",
                'om': "Universiti Haramaya madaalaloota lama qabdi: Madaalaa Guchii kitaabilee 200,000 qabdi, fi Madaalaan Kolleejii Lihii magaalaa Harar keessatti.",
                'am': "የሐረማያ ዩኒቨርሲቲ ሁለት ዋና ቤተመጻሕፍት አሉት።"
            }
        elif "department" in text_lower or "college" in text_lower:
            return {
                'en': "Haramaya University has 9 colleges: Health Sciences, Law, Agriculture, Veterinary Medicine, Social Sciences, Natural Sciences, Computing, Business, and Education.",
                'om': "Universiti Haramaya kolleejota 9 qabdi.",
                'am': "የሐረማያ ዩኒቨርሲቲ 9 ኮሌጆች አሉት።"
            }
        elif "cafe" in text_lower or "food" in text_lower:
            return {
                'en': "Haramaya University has student cafes including Main Cafeteria, Science College Cafe, Law College Canteen, and University Coffee Shop. Prices range from 20 to 100 Birr.",
                'om': "Universiti Haramaya kaafeewwan barattoota qabdi.",
                'am': "የሐረማያ ዩኒቨርሲቲ የተማሪ ካፌዎች አሉት።"
            }
        elif "stadium" in text_lower or "sport" in text_lower:
            return {
                'en': "Haramaya University has a main stadium with 10,000 capacity, plus basketball, volleyball, tennis courts, and gymnasium.",
                'om': "Universitin Haramaayaa istaadiyaamii daawwattoota 10,000 hammatu qabdi.",
                'am': "የሐረማያ ዩኒቨርሲቲ 10,000 ተመልካች የሚይዝ ስታዲየም አለው።"
            }
        elif "dormitory" in text_lower or "hostel" in text_lower:
            return {
                'en': "Haramaya University has student dormitories for both male and female students including Freshmen Dorms, Continuing Students Dorms, Female Hostel, Male Hostel, and Post Graduate Hostel.",
                'om': "Universitin Haramaya dormitaroota barattoota qabdi.",
                'am': "የሐረማያ ዩኒቨርሲቲ የተማሪ ዶርማዎች አሉት።"
            }
        elif "wealth" in text_lower or "budget" in text_lower:
            return {
                'en': "Haramaya University's annual budget is approximately 500 million Birr. Sources: Government (70%), Research Grants (15%), Student Tuition (10%), Donations (5%).",
                'om': "Baajata waallakanaa Universiti Haramaya heera miiliyoona 500 Birr.",
                'am': "የሐረማያ ዩኒቨርሲቲ አመታዊ በጀት በግምት 500 ሚሊዮን ብር ነው።"
            }
        elif "student life" in text_lower or "club" in text_lower:
            return {
                'en': "Haramaya University has 35+ student clubs including Debate, Music, Drama, IT, Business, Law, Medical, Engineering, Journalism, Red Cross, Environment, Tourism, Language, Sports, and Religious clubs.",
                'om': "Universiti Haramaya kluubota barattoota 35+ qabdi.",
                'am': "የሐረማያ ዩኒቨርሲቲ ከ35 በላይ የተማሪ ክለቦች አሉት።"
            }
        else:
            return {
                'en': "Haramaya University is one of Ethiopia's oldest universities, established in 1954. Located in East Hararghe, Oromia, 500 km east of Addis Ababa. It has over 35,000 students and 4,000 staff. Ask me about management, library, departments, cafe, stadium, dormitory, wealth, or student life.",
                'om': "Universiti Haramaya universiti Ethiopia keessaa moofaa, 1954 ummamte. Barattoota 35,000 fi hojjatoota 4,000 qabdi. Waa'ee bulchiinsa, madaalala, yuunitiiwwan, kaafeewwan, istaadiyaamii, hostelota, qabeenya, ykn jireenya barattootaa na gaafadhu.",
                'am': "የሐረማያ ዩኒቨርሲቲ ከኢትዮጵያ ጥንታዊ ዩኒቨርሲቲዎች አንዱ ነው፣ በ1954 ተመሠረተ። ከ35,000 በላይ ተማሪዎች እና 4,000 ሠራተኞች አሉት። ስለ አስተዳደር፣ ቤተመጻሕፍት፣ ዲፓርትመንቶች፣ ካፌዎች፣ ስታዲየም፣ ዶርማዎች፣ ገንዘብ ወይም የተማሪ ህይወት ልትጠይቁኝ ትችላላችሁ።"
            }
    
    # ============================================================
    # EXISTING LOCATION QUERIES (Regions and Cities)
    # ============================================================
    region_info = get_region_info(text_lower)
    if region_info:
        return region_info
    
    city_info = get_city_info(text_lower)
    if city_info:
        return city_info
    
    # Default response
    return {
        'en': f"I don't have information about '{text}'. Try asking about Ethiopian regions, cities, Haramaya University, or Ethiopian facts.",
        'om': f"Ani waa'ee '{text}' odeeffannoo hin qabu. Naannoo Ethiopia, magaalaa, ykn Universiti Haramaya gaafadhu.",
        'am': f"ስለ '{text}' መረጃ የለኝም። እባክዎ ስለ ኢትዮጵያ ክልሎች፣ ከተሞች ወይም ሐረማያ ዩኒቨርሲቲ ይጠይቁ።"
    }

# ============================================================
# MAIN ASSISTANT CLASS
# ============================================================

class FinalAssistant:
    def __init__(self):
        print("="*60)
        print("🤖 COMPLETE AI ASSISTANT")
        print("English | Amharic | Afaan Oromo")
        print("="*60)
        self.current_lang = 'en'
        self.setup_language_strings()
        print("\n✅ Ready!\n")
    
    def setup_language_strings(self):
        self.strings = {
            'en': {
                'welcome': "Welcome! I can tell you about Ethiopian regions, cities, and Haramaya University!",
                'time': "The time is ",
                'date': "Today is ",
                'weather': "Weather in Addis Ababa: ",
                'menu_title': "MAIN MENU",
                'opt1': "Ask a question",
                'opt2': "Time",
                'opt3': "Date",
                'opt4': "Weather",
                'opt5': "Change Language",
                'opt6': "Exit",
                'enter_text': "You: ",
                'goodbye': "Goodbye!",
                'lang_changed': "Language changed to English",
                'choose_lang': "Choose: 1.English 2.Amharic 3.Oromo",
                'invalid': "Invalid choice",
                'month': ['January', 'February', 'March', 'April', 'May', 'June',
                         'July', 'August', 'September', 'October', 'November', 'December']
            },
            'am': {
                'welcome': "እንኳን ደህና መጣህ! ስለ ኢትዮጵያ ክልሎች፣ ከተሞች እና ሐረማያ ዩኒቨርሲቲ ልነግርህ እችላለሁ!",
                'time': "ሰዓቱ ",
                'date': "ዛሬ ",
                'weather': "በአዲስ አበባ የአየር ሁኔታ: ",
                'menu_title': "ዋና ምናሌ",
                'opt1': "ጠይቅ",
                'opt2': "ሰዓት",
                'opt3': "ቀን",
                'opt4': "የአየር ሁኔታ",
                'opt5': "ቋንቋ ቀይር",
                'opt6': "ውጣ",
                'enter_text': "እርስዎ: ",
                'goodbye': "ቻው!",
                'lang_changed': "ቋንቋ ወደ አማርኛ ተቀይሯል",
                'choose_lang': "ይምረጡ: 1.እንግሊዘኛ 2.አማርኛ 3.ኦሮምኛ",
                'invalid': "የማይቻል ምርጫ",
                'month': ['ጥር', 'የካቲት', 'መጋቢት', 'ሚያዚያ', 'ግንቦት', 'ሰኔ',
                         'ሐምሌ', 'ነሐሴ', 'መስከረም', 'ጥቅምት', 'ህዳር', 'ታህሳስ']
            },
            'om': {
                'welcome': "Baga nagaan dhufte! Ani naannoo Ethiopia, magaalaa, fi Universiti Haramaya isin himuu danda'a!",
                'time': "Yeroon ",
                'date': "Har'a ",
                'weather': "Haala qilleensaa Finfinnee: ",
                'menu_title': "GURMAA MUL'ATA",
                'opt1': "Gaafadhu",
                'opt2': "Yeroo",
                'opt3': "Guyyaa",
                'opt4': "Haala Qilleensaa",
                'opt5': "Afaan jijjiiruu",
                'opt6': "Ba'uu",
                'enter_text': "Ati: ",
                'goodbye': "Nagaatti!",
                'lang_changed': "Aftaan gara Oromootti jijjiirrame",
                'choose_lang': "Filadhu: 1.Ingiliffaa 2.Amaaraa 3.Oromoo",
                'invalid': "Filannoo sirrii miti",
                'month': ['Amajjii', 'Guraandhala', 'Bitooteessa', 'Elba', 'Caamsaa', 'Waxabajjii',
                         'Adooleessa', 'Hagayya', 'Fuulbana', 'Onkoloolessa', 'Sadaasa', 'Muddee']
            }
        }
    
    def speak_english(self, text):
        tts = gTTS(text=text, lang='en')
        filename = f"speech_{int(time.time()*1000)}.mp3"
        tts.save(filename)
        os.system(f"start {filename}")
        print(f"🔊 English: {text[:80]}...")
    
    def speak_amharic(self, text):
        tts = gTTS(text=text, lang='am')
        filename = f"speech_{int(time.time()*1000)}.mp3"
        tts.save(filename)
        os.system(f"start {filename}")
        print(f"🔊 Amharic: {text[:80]}...")
    
    def speak_oromo(self, text):
        try:
            inputs = oromo_tokenizer(text, return_tensors="pt")
            with torch.no_grad():
                output = oromo_model(**inputs).waveform
            output_np = output.squeeze().cpu().numpy()
            filename = f"oromo_{int(time.time()*1000)}.wav"
            wav.write(filename, rate=oromo_model.config.sampling_rate, data=output_np)
            os.system(f"start {filename}")
            print(f"🔊 Afaan Oromo: {text[:80]}...")
        except Exception as e:
            self.speak_english(f"Afaan Oromo text: {text}")
    
    def get_time(self):
        now = datetime.now()
        hour = now.hour % 12
        if hour == 0:
            hour = 12
        minute = now.minute
        return f"{self.strings[self.current_lang]['time']}{hour}:{minute:02d}"
    
    def get_date(self):
        now = datetime.now()
        month_idx = now.month - 1
        day = now.day
        year = now.year
        return f"{self.strings[self.current_lang]['date']}{self.strings[self.current_lang]['month'][month_idx]} {day}, {year}"
    
    def get_weather(self):
        try:
            url = "https://wttr.in/Addis%20Ababa?format=%C+%t"
            response = requests.get(url, timeout=5)
            weather = response.text.strip()
            return f"{self.strings[self.current_lang]['weather']}{weather}"
        except:
            return f"{self.strings[self.current_lang]['weather']}Sunny, 22°C"
    
    def change_language(self):
        print(f"\n{self.strings[self.current_lang]['choose_lang']}")
        choice = input("👉 ")
        if choice == '1':
            self.current_lang = 'en'
        elif choice == '2':
            self.current_lang = 'am'
        elif choice == '3':
            self.current_lang = 'om'
        else:
            print(self.strings[self.current_lang]['invalid'])
            return
        print(f"\n✅ {self.strings[self.current_lang]['lang_changed']}")
        if self.current_lang == 'en':
            self.speak_english(self.strings['en']['welcome'])
        elif self.current_lang == 'am':
            self.speak_amharic(self.strings['am']['welcome'])
        else:
            self.speak_oromo(self.strings['om']['welcome'])
    
    def speak_custom_text(self, text):
        answer = process_location_query(text)
        if self.current_lang == 'en':
            self.speak_english(answer['en'])
        elif self.current_lang == 'am':
            self.speak_amharic(answer['am'])
        else:
            self.speak_oromo(answer['om'])
    
    def display_menu(self):
        s = self.strings[self.current_lang]
        print("\n" + "="*50)
        print(f"📋 {s['menu_title']}")
        print("="*50)
        print(f"1. 📖 {s['opt1']}")
        print(f"2. 🕐 {s['opt2']}")
        print(f"3. 📅 {s['opt3']}")
        print(f"4. 🌤️ {s['opt4']}")
        print(f"5. 🌍 {s['opt5']}")
        print(f"6. ❌ {s['opt6']}")
        print("="*50)
    
    def run(self):
        self.speak_english(self.strings['en']['welcome'])
        while True:
            self.display_menu()
            choice = input(f"\n👉 (1-6): ")
            if choice == '1':
                text = input(f"\n📝 {self.strings[self.current_lang]['enter_text']}")
                if text.strip():
                    self.speak_custom_text(text)
            elif choice == '2':
                t = self.get_time()
                print(f"\n🕐 {t}")
                self.speak_custom_text(t)
            elif choice == '3':
                d = self.get_date()
                print(f"\n📅 {d}")
                self.speak_custom_text(d)
            elif choice == '4':
                w = self.get_weather()
                print(f"\n🌤️ {w}")
                self.speak_custom_text(w)
            elif choice == '5':
                self.change_language()
            elif choice == '6':
                goodbye = self.strings[self.current_lang]['goodbye']
                print(f"\n👋 {goodbye}")
                self.speak_custom_text(goodbye)
                break
            else:
                print(f"\n❌ {self.strings[self.current_lang]['invalid']}")

if __name__ == "__main__":
    assistant = FinalAssistant()
    assistant.run()