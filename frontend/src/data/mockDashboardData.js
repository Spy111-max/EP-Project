const coreCityProfiles = [
  { id: "delhi", name: "Delhi", state: "NCT", position: [28.6139, 77.209], summary: { pm25: 102, pm10: 154, aqi: 172 }, template: "industrial", hotspotLabel: "Delhi Industrial Belt" },
  { id: "mumbai", name: "Mumbai", state: "Maharashtra", position: [19.076, 72.8777], summary: { pm25: 82, pm10: 124, aqi: 138 }, template: "coastal", hotspotLabel: "Mumbai Traffic Corridor" },
  { id: "bengaluru", name: "Bengaluru", state: "Karnataka", position: [12.9716, 77.5946], summary: { pm25: 64, pm10: 108, aqi: 111 }, template: "mixed", hotspotLabel: "Bengaluru Mixed Zone" },
  { id: "kolkata", name: "Kolkata", state: "West Bengal", position: [22.5726, 88.3639], summary: { pm25: 88, pm10: 132, aqi: 146 }, template: "industrial", hotspotLabel: "Howrah Industrial Zone" },
  { id: "hyderabad", name: "Hyderabad", state: "Telangana", position: [17.385, 78.4867], summary: { pm25: 76, pm10: 118, aqi: 129 }, template: "mixed", hotspotLabel: "Outer Ring Traffic Zone" },
  { id: "pune", name: "Pune", state: "Maharashtra", position: [18.5204, 73.8567], summary: { pm25: 71, pm10: 112, aqi: 122 }, template: "mixed", hotspotLabel: "Pune Highway Junction" },
  { id: "ahmedabad", name: "Ahmedabad", state: "Gujarat", position: [23.0225, 72.5714], summary: { pm25: 94, pm10: 148, aqi: 162 }, template: "arid", hotspotLabel: "Ahmedabad Industrial Corridor" },
  { id: "jaipur", name: "Jaipur", state: "Rajasthan", position: [26.9124, 75.7873], summary: { pm25: 85, pm10: 128, aqi: 142 }, template: "arid", hotspotLabel: "Jaipur Central Zone" },
  { id: "lucknow", name: "Lucknow", state: "Uttar Pradesh", position: [26.8467, 80.9462], summary: { pm25: 98, pm10: 146, aqi: 158 }, template: "riverine", hotspotLabel: "Lucknow Industrial Area" },
  { id: "chandigarh", name: "Chandigarh", state: "Chandigarh", position: [30.7333, 76.7794], summary: { pm25: 68, pm10: 104, aqi: 116 }, template: "temperate", hotspotLabel: "Chandigarh Trade Area" },
  { id: "indore", name: "Indore", state: "Madhya Pradesh", position: [22.7196, 75.8577], summary: { pm25: 79, pm10: 119, aqi: 132 }, template: "mixed", hotspotLabel: "Indore City Center" },
  { id: "vadodara", name: "Vadodara", state: "Gujarat", position: [22.3072, 73.1812], summary: { pm25: 72, pm10: 109, aqi: 119 }, template: "mixed", hotspotLabel: "Vadodara Highway Zone" },
  { id: "surat", name: "Surat", state: "Gujarat", position: [21.1702, 72.8311], summary: { pm25: 86, pm10: 131, aqi: 144 }, template: "coastal", hotspotLabel: "Surat Industrial Belt" },
  { id: "visakhapatnam", name: "Visakhapatnam", state: "Andhra Pradesh", position: [17.6869, 83.2185], summary: { pm25: 74, pm10: 114, aqi: 126 }, template: "coastal", hotspotLabel: "Visakhapatnam Port Area" },
  { id: "coimbatore", name: "Coimbatore", state: "Tamil Nadu", position: [11.0066, 76.9655], summary: { pm25: 62, pm10: 98, aqi: 108 }, template: "southern", hotspotLabel: "Coimbatore Textile Zone" },
  { id: "chennai", name: "Chennai", state: "Tamil Nadu", position: [13.0827, 80.2707], summary: { pm25: 90, pm10: 138, aqi: 150 }, template: "coastal", hotspotLabel: "Chennai Port Corridor" },
  { id: "kochi", name: "Kochi", state: "Kerala", position: [9.9312, 76.2673], summary: { pm25: 58, pm10: 93, aqi: 101 }, template: "coastal", hotspotLabel: "Kochi Port Belt" },
  { id: "thiruvananthapuram", name: "Thiruvananthapuram", state: "Kerala", position: [8.5241, 76.9366], summary: { pm25: 55, pm10: 88, aqi: 96 }, template: "coastal", hotspotLabel: "Thiruvananthapuram Metro Core" },
  { id: "madurai", name: "Madurai", state: "Tamil Nadu", position: [9.9252, 78.1198], summary: { pm25: 67, pm10: 104, aqi: 115 }, template: "southern", hotspotLabel: "Madurai Urban Core" },
  { id: "tiruchirappalli", name: "Tiruchirappalli", state: "Tamil Nadu", position: [10.7905, 78.7047], summary: { pm25: 64, pm10: 100, aqi: 110 }, template: "southern", hotspotLabel: "Tiruchirappalli Transit Belt" },
  { id: "nagpur", name: "Nagpur", state: "Maharashtra", position: [21.1458, 79.0882], summary: { pm25: 83, pm10: 123, aqi: 134 }, template: "industrial", hotspotLabel: "Nagpur Logistics Corridor" },
  { id: "bhopal", name: "Bhopal", state: "Madhya Pradesh", position: [23.2599, 77.4126], summary: { pm25: 69, pm10: 105, aqi: 117 }, template: "mixed", hotspotLabel: "Bhopal Lake District" },
  { id: "raipur", name: "Raipur", state: "Chhattisgarh", position: [21.2514, 81.6296], summary: { pm25: 78, pm10: 116, aqi: 128 }, template: "industrial", hotspotLabel: "Raipur Steel Belt" },
  { id: "ranchi", name: "Ranchi", state: "Jharkhand", position: [23.3441, 85.3096], summary: { pm25: 66, pm10: 101, aqi: 112 }, template: "eastern", hotspotLabel: "Ranchi Plateau Zone" },
  { id: "bhubaneswar", name: "Bhubaneswar", state: "Odisha", position: [20.2961, 85.8245], summary: { pm25: 72, pm10: 109, aqi: 120 }, template: "coastal", hotspotLabel: "Bhubaneswar Civic Core" },
  { id: "patna", name: "Patna", state: "Bihar", position: [25.5941, 85.1376], summary: { pm25: 96, pm10: 145, aqi: 157 }, template: "riverine", hotspotLabel: "Patna Riverfront Belt" },
  { id: "guwahati", name: "Guwahati", state: "Assam", position: [26.1445, 91.7362], summary: { pm25: 74, pm10: 112, aqi: 123 }, template: "eastern", hotspotLabel: "Guwahati River Corridor" },
  { id: "shimla", name: "Shimla", state: "Himachal Pradesh", position: [31.1048, 77.1734], summary: { pm25: 49, pm10: 78, aqi: 88 }, template: "temperate", hotspotLabel: "Shimla Ridge Zone" },
  { id: "srinagar", name: "Srinagar", state: "Jammu and Kashmir", position: [34.0837, 74.7973], summary: { pm25: 52, pm10: 82, aqi: 92 }, template: "temperate", hotspotLabel: "Srinagar Valley Core" },
  { id: "dehradun", name: "Dehradun", state: "Uttarakhand", position: [30.3165, 78.0322], summary: { pm25: 63, pm10: 97, aqi: 107 }, template: "temperate", hotspotLabel: "Dehradun Valley Ring" },
  { id: "kanpur", name: "Kanpur", state: "Uttar Pradesh", position: [26.4499, 80.3319], summary: { pm25: 100, pm10: 152, aqi: 165 }, template: "industrial", hotspotLabel: "Kanpur Industrial Cluster" },
];

const coreCityPm1ById = {
  delhi: 46,
  mumbai: 35,
  bengaluru: 26,
  kolkata: 39,
  hyderabad: 32,
  pune: 30,
  ahmedabad: 42,
  jaipur: 38,
  lucknow: 44,
  chandigarh: 28,
  indore: 33,
  vadodara: 31,
  surat: 37,
  visakhapatnam: 31,
  coimbatore: 24,
  chennai: 40,
  kochi: 22,
  thiruvananthapuram: 21,
  madurai: 27,
  tiruchirappalli: 25,
  nagpur: 34,
  bhopal: 29,
  raipur: 33,
  ranchi: 27,
  bhubaneswar: 30,
  patna: 43,
  guwahati: 31,
  shimla: 18,
  srinagar: 19,
  dehradun: 25,
  kanpur: 45,
};

const extraCitySeeds = [
  { id: "amritsar", name: "Amritsar", state: "Punjab", position: [31.634, 74.8723] },
  { id: "ludhiana", name: "Ludhiana", state: "Punjab", position: [30.901, 75.8573] },
  { id: "jalandhar", name: "Jalandhar", state: "Punjab", position: [31.326, 75.5762] },
  { id: "agra", name: "Agra", state: "Uttar Pradesh", position: [27.1767, 78.0081] },
  { id: "varanasi", name: "Varanasi", state: "Uttar Pradesh", position: [25.3176, 82.9739] },
  { id: "prayagraj", name: "Prayagraj", state: "Uttar Pradesh", position: [25.4358, 81.8463] },
  { id: "meerut", name: "Meerut", state: "Uttar Pradesh", position: [28.9845, 77.7064] },
  { id: "noida", name: "Noida", state: "Uttar Pradesh", position: [28.5355, 77.391] },
  { id: "ghaziabad", name: "Ghaziabad", state: "Uttar Pradesh", position: [28.6692, 77.4538] },
  { id: "faridabad", name: "Faridabad", state: "Haryana", position: [28.4089, 77.3178] },
  { id: "gurugram", name: "Gurugram", state: "Haryana", position: [28.4595, 77.0266] },
  { id: "panipat", name: "Panipat", state: "Haryana", position: [29.3909, 76.9635] },
  { id: "karnal", name: "Karnal", state: "Haryana", position: [29.6857, 76.9905] },
  { id: "hisar", name: "Hisar", state: "Haryana", position: [29.1492, 75.7217] },
  { id: "jodhpur", name: "Jodhpur", state: "Rajasthan", position: [26.2389, 73.0243] },
  { id: "udaipur", name: "Udaipur", state: "Rajasthan", position: [24.5854, 73.7125] },
  { id: "kota", name: "Kota", state: "Rajasthan", position: [25.2138, 75.8648] },
  { id: "ajmer", name: "Ajmer", state: "Rajasthan", position: [26.4499, 74.6399] },
  { id: "alwar", name: "Alwar", state: "Rajasthan", position: [27.553, 76.6346] },
  { id: "gwalior", name: "Gwalior", state: "Madhya Pradesh", position: [26.2183, 78.1828] },
  { id: "jabalpur", name: "Jabalpur", state: "Madhya Pradesh", position: [23.1815, 79.9864] },
  { id: "ujjain", name: "Ujjain", state: "Madhya Pradesh", position: [23.1765, 75.7885] },
  { id: "nashik", name: "Nashik", state: "Maharashtra", position: [19.9975, 73.7898] },
  { id: "aurangabad", name: "Aurangabad", state: "Maharashtra", position: [19.8762, 75.3433] },
  { id: "solapur", name: "Solapur", state: "Maharashtra", position: [17.6599, 75.9064] },
  { id: "kolhapur", name: "Kolhapur", state: "Maharashtra", position: [16.705, 74.2433] },
  { id: "nanded", name: "Nanded", state: "Maharashtra", position: [19.1383, 77.321] },
  { id: "vijayawada", name: "Vijayawada", state: "Andhra Pradesh", position: [16.5062, 80.648] },
  { id: "guntur", name: "Guntur", state: "Andhra Pradesh", position: [16.3067, 80.4365] },
  { id: "nellore", name: "Nellore", state: "Andhra Pradesh", position: [14.4426, 79.9865] },
  { id: "kurnool", name: "Kurnool", state: "Andhra Pradesh", position: [15.8281, 78.0373] },
  { id: "warangal", name: "Warangal", state: "Telangana", position: [17.9689, 79.5941] },
  { id: "nizamabad", name: "Nizamabad", state: "Telangana", position: [18.6725, 78.0941] },
  { id: "mysuru", name: "Mysuru", state: "Karnataka", position: [12.2958, 76.6394] },
  { id: "mangaluru", name: "Mangaluru", state: "Karnataka", position: [12.9141, 74.856] },
  { id: "hubballi", name: "Hubballi", state: "Karnataka", position: [15.3647, 75.124] },
  { id: "belagavi", name: "Belagavi", state: "Karnataka", position: [15.8497, 74.4977] },
  { id: "davanagere", name: "Davanagere", state: "Karnataka", position: [14.4644, 75.9218] },
  { id: "shivamogga", name: "Shivamogga", state: "Karnataka", position: [13.9299, 75.5681] },
  { id: "kozhikode", name: "Kozhikode", state: "Kerala", position: [11.2588, 75.7804] },
  { id: "thrissur", name: "Thrissur", state: "Kerala", position: [10.5276, 76.2144] },
  { id: "kannur", name: "Kannur", state: "Kerala", position: [11.8745, 75.3704] },
  { id: "kottayam", name: "Kottayam", state: "Kerala", position: [9.5916, 76.5222] },
  { id: "palakkad", name: "Palakkad", state: "Kerala", position: [10.7867, 76.6548] },
  { id: "tirunelveli", name: "Tirunelveli", state: "Tamil Nadu", position: [8.7139, 77.7567] },
  { id: "erode", name: "Erode", state: "Tamil Nadu", position: [11.341, 77.7172] },
  { id: "vellore", name: "Vellore", state: "Tamil Nadu", position: [12.9165, 79.1325] },
  { id: "thanjavur", name: "Thanjavur", state: "Tamil Nadu", position: [10.787, 79.1378] },
  { id: "dhanbad", name: "Dhanbad", state: "Jharkhand", position: [23.7957, 86.4304] },
  { id: "jamshedpur", name: "Jamshedpur", state: "Jharkhand", position: [22.8046, 86.2029] },
  { id: "asansol", name: "Asansol", state: "West Bengal", position: [23.6739, 86.9524] },
  { id: "siliguri", name: "Siliguri", state: "West Bengal", position: [26.7271, 88.3953] },
  { id: "cuttack", name: "Cuttack", state: "Odisha", position: [20.4625, 85.8828] },
  { id: "rourkela", name: "Rourkela", state: "Odisha", position: [22.2604, 84.8536] },
  { id: "sambalpur", name: "Sambalpur", state: "Odisha", position: [21.4669, 83.9812] },
  { id: "muzaffarpur", name: "Muzaffarpur", state: "Bihar", position: [26.1209, 85.3647] },
  { id: "gaya", name: "Gaya", state: "Bihar", position: [24.7914, 85.0002] },
  { id: "bhagalpur", name: "Bhagalpur", state: "Bihar", position: [25.2425, 86.9842] },
  { id: "imphal", name: "Imphal", state: "Manipur", position: [24.817, 93.9368] },
  { id: "aizawl", name: "Aizawl", state: "Mizoram", position: [23.7271, 92.7176] },
  { id: "shillong", name: "Shillong", state: "Meghalaya", position: [25.5788, 91.8933] },
  { id: "itanagar", name: "Itanagar", state: "Arunachal Pradesh", position: [27.0844, 93.6053] },
  { id: "agartala", name: "Agartala", state: "Tripura", position: [23.8315, 91.2868] },
  { id: "dimapur", name: "Dimapur", state: "Nagaland", position: [25.9091, 93.7266] },
  { id: "kohima", name: "Kohima", state: "Nagaland", position: [25.6747, 94.11] },
  { id: "gangtok", name: "Gangtok", state: "Sikkim", position: [27.3389, 88.6065] },
  { id: "leh", name: "Leh", state: "Ladakh", position: [34.1526, 77.5771] },
  { id: "jammu", name: "Jammu", state: "Jammu and Kashmir", position: [32.7266, 74.857] },
  { id: "raichur", name: "Raichur", state: "Karnataka", position: [16.212, 77.3439] },
];

const generatedCityNameState = [
  { name: "Anantapur", state: "Andhra Pradesh" },
  { name: "Kakinada", state: "Andhra Pradesh" },
  { name: "Rajahmundry", state: "Andhra Pradesh" },
  { name: "Eluru", state: "Andhra Pradesh" },
  { name: "Kadapa", state: "Andhra Pradesh" },
  { name: "Ongole", state: "Andhra Pradesh" },
  { name: "Srikakulam", state: "Andhra Pradesh" },
  { name: "Vizianagaram", state: "Andhra Pradesh" },
  { name: "Adoni", state: "Andhra Pradesh" },
  { name: "Tenali", state: "Andhra Pradesh" },
  { name: "Karimnagar", state: "Telangana" },
  { name: "Khammam", state: "Telangana" },
  { name: "Mahbubnagar", state: "Telangana" },
  { name: "Adilabad", state: "Telangana" },
  { name: "Siddipet", state: "Telangana" },
  { name: "Bidar", state: "Karnataka" },
  { name: "Ballari", state: "Karnataka" },
  { name: "Tumakuru", state: "Karnataka" },
  { name: "Udupi", state: "Karnataka" },
  { name: "Chitradurga", state: "Karnataka" },
  { name: "Hassan", state: "Karnataka" },
  { name: "Mandya", state: "Karnataka" },
  { name: "Kolar", state: "Karnataka" },
  { name: "Bagalkot", state: "Karnataka" },
  { name: "Vijayapura", state: "Karnataka" },
  { name: "Tiruppur", state: "Tamil Nadu" },
  { name: "Dindigul", state: "Tamil Nadu" },
  { name: "Cuddalore", state: "Tamil Nadu" },
  { name: "Nagapattinam", state: "Tamil Nadu" },
  { name: "Kanchipuram", state: "Tamil Nadu" },
  { name: "Nagercoil", state: "Tamil Nadu" },
  { name: "Karur", state: "Tamil Nadu" },
  { name: "Namakkal", state: "Tamil Nadu" },
  { name: "Thoothukudi", state: "Tamil Nadu" },
  { name: "Virudhunagar", state: "Tamil Nadu" },
  { name: "Alappuzha", state: "Kerala" },
  { name: "Kollam", state: "Kerala" },
  { name: "Kasaragod", state: "Kerala" },
  { name: "Pathanamthitta", state: "Kerala" },
  { name: "Idukki", state: "Kerala" },
  { name: "Jalgaon", state: "Maharashtra" },
  { name: "Akola", state: "Maharashtra" },
  { name: "Amravati", state: "Maharashtra" },
  { name: "Latur", state: "Maharashtra" },
  { name: "Sangli", state: "Maharashtra" },
  { name: "Satara", state: "Maharashtra" },
  { name: "Dhule", state: "Maharashtra" },
  { name: "Ahmednagar", state: "Maharashtra" },
  { name: "Chandrapur", state: "Maharashtra" },
  { name: "Yavatmal", state: "Maharashtra" },
  { name: "Bhavnagar", state: "Gujarat" },
  { name: "Jamnagar", state: "Gujarat" },
  { name: "Rajkot", state: "Gujarat" },
  { name: "Gandhinagar", state: "Gujarat" },
  { name: "Junagadh", state: "Gujarat" },
  { name: "Morbi", state: "Gujarat" },
  { name: "Bharuch", state: "Gujarat" },
  { name: "Vapi", state: "Gujarat" },
  { name: "Anand", state: "Gujarat" },
  { name: "Nadiad", state: "Gujarat" },
  { name: "Bilaspur", state: "Chhattisgarh" },
  { name: "Durg", state: "Chhattisgarh" },
  { name: "Korba", state: "Chhattisgarh" },
  { name: "Jagdalpur", state: "Chhattisgarh" },
  { name: "Ambikapur", state: "Chhattisgarh" },
  { name: "Bokaro", state: "Jharkhand" },
  { name: "Hazaribagh", state: "Jharkhand" },
  { name: "Deoghar", state: "Jharkhand" },
  { name: "Giridih", state: "Jharkhand" },
  { name: "Ramgarh", state: "Jharkhand" },
  { name: "Darjeeling", state: "West Bengal" },
  { name: "Bardhaman", state: "West Bengal" },
  { name: "Kharagpur", state: "West Bengal" },
  { name: "Haldia", state: "West Bengal" },
  { name: "Krishnanagar", state: "West Bengal" },
  { name: "Puri", state: "Odisha" },
  { name: "Balasore", state: "Odisha" },
  { name: "Berhampur", state: "Odisha" },
  { name: "Baripada", state: "Odisha" },
  { name: "Angul", state: "Odisha" },
  { name: "Motihari", state: "Bihar" },
  { name: "Darbhanga", state: "Bihar" },
  { name: "Purnia", state: "Bihar" },
  { name: "Arrah", state: "Bihar" },
  { name: "Siwan", state: "Bihar" },
  { name: "Rohtak", state: "Haryana" },
  { name: "Sonipat", state: "Haryana" },
  { name: "Ambala", state: "Haryana" },
  { name: "Bhiwani", state: "Haryana" },
  { name: "Rewari", state: "Haryana" },
  { name: "Aligarh", state: "Uttar Pradesh" },
  { name: "Bareilly", state: "Uttar Pradesh" },
  { name: "Moradabad", state: "Uttar Pradesh" },
  { name: "Saharanpur", state: "Uttar Pradesh" },
  { name: "Jhansi", state: "Uttar Pradesh" },
  { name: "Mathura", state: "Uttar Pradesh" },
  { name: "Firozabad", state: "Uttar Pradesh" },
  { name: "Gorakhpur", state: "Uttar Pradesh" },
  { name: "Ayodhya", state: "Uttar Pradesh" },
  { name: "Rampur", state: "Uttar Pradesh" },
  { name: "Kangra", state: "Himachal Pradesh" },
  { name: "Mandi", state: "Himachal Pradesh" },
  { name: "Kullu", state: "Himachal Pradesh" },
  { name: "Haridwar", state: "Uttarakhand" },
  { name: "Rudrapur", state: "Uttarakhand" },
  { name: "Haldwani", state: "Uttarakhand" },
  { name: "Silchar", state: "Assam" },
  { name: "Dibrugarh", state: "Assam" },
  { name: "Nagaon", state: "Assam" },
  { name: "Tezpur", state: "Assam" },
];

function slugifyCityId(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function makeUniqueId(baseId, takenIds) {
  if (!takenIds.has(baseId)) return baseId;
  let counter = 2;
  while (takenIds.has(`${baseId}-${counter}`)) counter += 1;
  return `${baseId}-${counter}`;
}

const generatedCitySeeds = (() => {
  const usedIds = new Set([...coreCityProfiles, ...extraCitySeeds].map((city) => city.id));

  return generatedCityNameState.slice(0, 100).map((item, index) => {
    const baseId = slugifyCityId(item.name);
    const id = makeUniqueId(baseId, usedIds);
    usedIds.add(id);

    const lat = 8.2 + (index * 2.73) % 27.8;
    const lon = 68.4 + (index * 3.91) % 28.4;

    return {
      id,
      name: item.name,
      state: item.state,
      position: [Number(lat.toFixed(4)), Number(lon.toFixed(4))],
    };
  });
})();

const seedTemplateCycle = ["industrial", "coastal", "mixed", "arid", "riverine", "southern", "eastern", "temperate"];

function buildSeedProfile(seed, index) {
  const pm25 = 54 + (index * 7) % 52;
  const pm10 = pm25 + 30 + (index * 3) % 20;
  const aqi = Math.min(178, pm10 + 12 + (index * 5) % 18);

  return {
    ...seed,
    summary: { pm25, pm10, aqi },
    template: seedTemplateCycle[index % seedTemplateCycle.length],
    hotspotLabel: `${seed.name} Monitoring Zone`,
  };
}

const cityProfiles = coreCityProfiles.map((profile) => ({
  ...profile,
  summary: {
    ...profile.summary,
    pm1: coreCityPm1ById[profile.id] ?? Math.max(12, Math.round(profile.summary.pm25 * 0.45)),
  },
}));

const recommendationTemplates = {
  industrial: [
    { commonName: "Neem", scientificName: "Azadirachta indica", match: 94, growthYears: 4, carbon: 25, suitability: "High", reason: "Strong PM capture and heat resilience for traffic corridors" },
    { commonName: "Peepal", scientificName: "Ficus religiosa", match: 90, growthYears: 5, carbon: 29, suitability: "High", reason: "Large canopy support for dense roadside buffering" },
  ],
  coastal: [
    { commonName: "Arjun", scientificName: "Terminalia arjuna", match: 91, growthYears: 6, carbon: 28, suitability: "High", reason: "Handles humidity, salt, and traffic pressure in coastal cities" },
    { commonName: "Casuarina", scientificName: "Casuarina equisetifolia", match: 88, growthYears: 5, carbon: 22, suitability: "High", reason: "Salt-tolerant shelter belt with strong wind resistance" },
  ],
  arid: [
    { commonName: "Neem", scientificName: "Azadirachta indica", match: 93, growthYears: 4, carbon: 24, suitability: "High", reason: "Drought-safe canopy with consistent pollutant absorption" },
    { commonName: "Khejri", scientificName: "Prosopis cineraria", match: 85, growthYears: 5, carbon: 18, suitability: "High", reason: "Native dry-zone species with strong survival capacity" },
  ],
  mixed: [
    { commonName: "Honge", scientificName: "Pongamia pinnata", match: 90, growthYears: 4, carbon: 20, suitability: "High", reason: "Stable urban adaptation for mixed-use districts" },
    { commonName: "Rain Tree", scientificName: "Samanea saman", match: 86, growthYears: 6, carbon: 30, suitability: "Medium", reason: "Wide canopy for heat relief and particulate capture" },
  ],
  temperate: [
    { commonName: "Deodar", scientificName: "Cedrus deodara", match: 92, growthYears: 8, carbon: 33, suitability: "High", reason: "Cold-climate evergreen with durable landscape value" },
    { commonName: "Maple", scientificName: "Acer caesium", match: 84, growthYears: 7, carbon: 27, suitability: "Medium", reason: "Works well in cooler basins and institutional boulevards" },
  ],
  southern: [
    { commonName: "Jamun", scientificName: "Syzygium cumini", match: 89, growthYears: 5, carbon: 22, suitability: "High", reason: "Heat-resistant fruit tree with broad urban canopy" },
    { commonName: "Ashoka", scientificName: "Saraca asoca", match: 85, growthYears: 6, carbon: 19, suitability: "High", reason: "Compact formal tree suited to streets and campuses" },
  ],
  eastern: [
    { commonName: "Jarul", scientificName: "Lagerstroemia speciosa", match: 88, growthYears: 5, carbon: 23, suitability: "High", reason: "Thrives in warm-humid eastern corridors and medians" },
    { commonName: "Bakul", scientificName: "Mimusops elengi", match: 84, growthYears: 6, carbon: 18, suitability: "Medium", reason: "Dense evergreen cover for urban streets and campuses" },
  ],
  riverine: [
    { commonName: "Arjun", scientificName: "Terminalia arjuna", match: 90, growthYears: 6, carbon: 27, suitability: "High", reason: "Supports riverfront stabilization and flood-prone edges" },
    { commonName: "Bargad", scientificName: "Ficus benghalensis", match: 86, growthYears: 7, carbon: 28, suitability: "High", reason: "Long-lived shade tree for river corridors and plazas" },
  ],
};

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

function summary(pm25, pm10, pm1) {
  return [
    { id: "pm25", label: "PM2.5", value: pm25, unit: "ug/m3", hint: "Fine particles" },
    { id: "pm10", label: "PM10", value: pm10, unit: "ug/m3", hint: "Coarse particles" },
    { id: "pm1", label: "PM1", value: pm1, unit: "ug/m3", hint: "Ultrafine particle concentration" },
  ];
}

function makeTrend(summaryValues) {
  const pm25Start = summaryValues.pm25 + 16;
  const pm10Start = summaryValues.pm10 + 14;
  const aqiStart = summaryValues.aqi + 14;
  const step = summaryValues.aqi >= 150 ? 4 : 3;

  return months.map((month, index) => ({
    month,
    pm25: Math.max(20, pm25Start - index * step),
    pm10: Math.max(30, pm10Start - index * (step + 1)),
    aqi: Math.max(40, aqiStart - index * (step + 1)),
  }));
}

function getHotspotColor(aqi) {
  if (aqi >= 160) return "#dc2626";
  if (aqi >= 140) return "#f97316";
  if (aqi >= 120) return "#d97706";
  if (aqi >= 100) return "#2563eb";
  return "#059669";
}

function buildRecommendations(profile) {
  const template = recommendationTemplates[profile.template] || recommendationTemplates.mixed;
  const severityBoost = profile.summary.aqi >= 150 ? 2 : profile.summary.aqi <= 100 ? 0 : 1;

  return template.map((item, index) => ({
    id: `${profile.id}-tree-${index + 1}`,
    commonName: item.commonName,
    scientificName: item.scientificName,
    match: Math.min(99, item.match + severityBoost),
    growthYears: item.growthYears,
    carbon: item.carbon,
    suitability: item.suitability,
    reason: item.reason,
  }));
}

function buildActionPlan(profile, recommendations) {
  const topSpecies = recommendations.slice(0, 2).map((item) => item.commonName).join(" and ");

  const steps = [
    `Prioritize ${topSpecies} along the highest traffic corridors and source hotspots in ${profile.name} to create fast particulate interception layers.`,
    `Use a monsoon-window planting schedule and deep mulch ring around new saplings so survival rates stay high during the first year.`,
    `Pair tree planting with dust-source control: wet sweeping, curbside cleaning, and idling reduction around junctions and industrial stretches.`,
    `Recheck PM2.5, PM10, and PM1 after each planting cycle and refill gaps with replacement saplings in failed pockets within the next season.`,
  ];

  return {
    summary: `The next action phase for ${profile.name} should focus on fast-canopy establishment, source-side suppression, and survival-focused maintenance so the pollution load begins to drop in the shortest practical window.`,
    steps,
  };
}

export const cityCatalog = cityProfiles.map(({ id, name, state, position }) => ({ id, name, state, position }));

export const cityInsights = Object.fromEntries(
  cityProfiles.map((profile) => {
    const hotspotAqi = Math.min(210, profile.summary.aqi + 10);
    const hotspotPm25 = Math.min(190, profile.summary.pm25 + 8);
    const recommendations = buildRecommendations(profile);

    return [
      profile.id,
      {
        summaryCards: summary(profile.summary.pm25, profile.summary.pm10, profile.summary.pm1),
        trendData: makeTrend(profile.summary),
        hotspots: [
          {
            id: `${profile.id}-hs-1`,
            name: profile.hotspotLabel,
            position: [profile.position[0] + 0.07, profile.position[1] - 0.06],
            aqi: hotspotAqi,
            pm25: hotspotPm25,
            radius: Math.round(profile.summary.aqi * 85),
            color: getHotspotColor(hotspotAqi),
          },
        ],
        recommendations,
        actionPlan: buildActionPlan(profile, recommendations),
      },
    ];
  }),
);
