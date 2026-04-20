const puneAreaCatalog = [
  { id: "ramwadi", label: "Ramwadi", center: [18.5537, 73.9122], profile: "metro-edge" },
  { id: "kalyani-nagar", label: "Kalyani Nagar", center: [18.5482, 73.9035], profile: "residential-grid" },
  { id: "koregaon-park", label: "Koregaon Park", center: [18.5362, 73.8931], profile: "avenue" },
  { id: "yerawda", label: "Yerawda", center: [18.552, 73.8786], profile: "institutional" },
  { id: "bund-garden", label: "Bund Garden", center: [18.5395, 73.8827], profile: "river-edge" },
  { id: "swargate", label: "Swargate", center: [18.5012, 73.8621], profile: "transit" },
  { id: "hadapsar", label: "Hadapsar", center: [18.5089, 73.9258], profile: "mixed-urban" },
  { id: "pcmc", label: "PCMC", center: [18.6282, 73.7997], profile: "industrial-edge" },
  { id: "vanaz", label: "Vanaz", center: [18.5018, 73.7815], profile: "residential-grid" },
  { id: "aundh", label: "Aundh", center: [18.5603, 73.8078], profile: "residential-grid" },
  { id: "hinjewadi", label: "Hinjewadi", center: [18.5912, 73.7389], profile: "it-corridor" },
  { id: "wakad", label: "Wakad", center: [18.5991, 73.7637], profile: "mixed-urban" },
  { id: "baner", label: "Baner", center: [18.559, 73.7868], profile: "residential-grid" },
  { id: "wadgaon", label: "Wadgaon", center: [18.4665, 73.8228], profile: "slope-edge" },
  { id: "wagholi", label: "Wagholi", center: [18.5766, 73.9647], profile: "mixed-urban" },
  { id: "dhayri", label: "Dhayri", center: [18.4469, 73.8154], profile: "slope-edge" },
  { id: "viman-nagar", label: "Viman Nagar", center: [18.5679, 73.9143], profile: "avenue" },
  { id: "katraj", label: "Katraj", center: [18.4529, 73.8619], profile: "transit" },
  { id: "dhanori", label: "Dhanori", center: [18.5889, 73.8912], profile: "residential-grid" },
];

export const puneAreaMapPoints = puneAreaCatalog.map((area) => ({
  id: area.id,
  label: area.label,
  center: area.center,
  profile: area.profile,
}));

const profileOffsets = {
  "metro-edge": [[0.0012, -0.0014], [-0.0011, 0.001], [0.0018, 0.0009]],
  "residential-grid": [[0.001, -0.0011], [-0.001, 0.001], [0.0015, 0.0016]],
  avenue: [[0.0011, -0.0009], [-0.0013, 0.0012], [0.0019, 0.0014]],
  institutional: [[0.0014, -0.001], [-0.0016, 0.0014], [0.0017, 0.0015]],
  "river-edge": [[0.0016, -0.0015], [-0.0018, 0.0013], [0.0021, 0.0017]],
  transit: [[0.0012, -0.0016], [-0.0013, 0.0011], [0.0016, 0.0013]],
  "mixed-urban": [[0.0013, -0.0012], [-0.0011, 0.0012], [0.0018, 0.0014]],
  "industrial-edge": [[0.0015, -0.0017], [-0.0012, 0.001], [0.002, 0.0015]],
  "it-corridor": [[0.0014, -0.0013], [-0.001, 0.001], [0.0019, 0.0012]],
  "slope-edge": [[0.0013, -0.001], [-0.0014, 0.0013], [0.0017, 0.0018]],
};

const areaLocationNames = {
  kothrud: [
    "Karve Statue junction median near Paud Road",
    "Ideal Colony DP Road utility-safe verge",
    "Mhatre Bridge approach soil embankment",
    "Paud Phata signal frontage verge",
    "Mitra Mandal Road green setback",
    "Bharati Vidyapeeth road edge near Kothrud Depot",
    "Sutarwadi hill-base green margin",
    "Vanaz metro approach roadside verge",
    "Karve Road service lane soil strip",
    "Bavdhan link-road boundary edge",
  ],
  ramwadi: [
    "Ramwadi Metro Station roadside verge",
    "Nagar Road service lane soil setback",
    "Ramwadi lake-side public edge",
    "Wadgaonsheri connector roadside verge",
    "Kalyani Nagar extension green margin",
    "Airport road outer setback",
    "Weikfield junction utility-safe edge",
    "Nagar Road bus-stop verge",
    "Phoenix Marketcity boundary edge",
    "Pune airport approach green strip",
  ],
  "kalyani-nagar": [
    "Joggers Park perimeter soil edge",
    "North Main Road utility-safe verge",
    "Kalyani Nagar river-side green edge",
    "Cerebrum IT Park frontage verge",
    "Lane 7 residential setback",
    "Mula-Mutha promenade edge",
    "Sundarbaug roadside verge",
    "Aga Khan Bridge approach edge",
    "Garden walk open-soil margin",
    "Central Avenue median verge",
  ],
  "koregaon-park": [
    "North Main Road avenue planting verge",
    "Lane 6 compound-edge soil strip",
    "Bund-side open green margin",
    "Osho Teerth perimeter verge",
    "Lane 5 residential setback",
    "Bund Garden road-side green edge",
    "South Main Road avenue verge",
    "Lane 7 hotel frontage setback",
    "Mundhwa river link green margin",
    "Koregaon Park plaza edge",
  ],
  yerawda: [
    "Yerawda Metro corridor roadside verge",
    "Shastri Nagar utility-safe setback",
    "Yerawda hospital green boundary edge",
    "Nagar Road service verge",
    "Shastri Nagar open boundary",
    "Yerawda gaon road-edge setback",
    "Sangamwadi connector verge",
    "Bund Garden railway-side margin",
    "Yerawda jail perimeter green edge",
    "Gunjan Chowk roadside strip",
  ],
  "bund-garden": [
    "Bund Garden bridge approach verge",
    "Sangamwadi Road utility-safe setback",
    "Mula-Mutha embankment green edge",
    "Bund Garden promenade edge",
    "RTO road-side planting verge",
    "Sangamwadi riverbank margin",
    "Wellesley Road open boundary",
    "Sasoon Road avenue verge",
    "Pune station approach edge",
    "Mula river walkway setback",
  ],
  swargate: [
    "Swargate bus terminal outer verge",
    "Satara Road utility-safe setback",
    "Shankar Sheth Road green margin",
    "Mukund Nagar connector verge",
    "Jagtap Chowk roadside strip",
    "Laxmi Narayan theatre edge",
    "Katraj road-service setback",
    "Tilak Road approach green edge",
    "Swargate depot boundary verge",
    "Pune-Satara highway approach margin",
  ],
  hadapsar: [
    "Hadapsar Gadital junction verge",
    "Magarpatta Road utility-safe edge",
    "Amanora belt open green boundary",
    "Fursungi road-side verge",
    "Mundhwa-Hadapsar connector setback",
    "Magarpatta gate green margin",
    "Gadital bus-stop edge",
    "Bhosale Nagar road verge",
    "Railway overbridge setback edge",
    "Amanora river edge",
  ],
  pcmc: [
    "PCMC Bhakti-Shakti median verge",
    "Pimpri industrial service-road setback",
    "Akurdi open green buffer edge",
    "Nigdi spine road verge",
    "Chinchwad station approach edge",
    "Morya Gosavi road setback",
    "Pimpri camp green margin",
    "Akurdi college road verge",
    "Morwadi service road edge",
    "Bhosari industrial boundary strip",
  ],
  vanaz: [
    "Vanaz Metro approach roadside verge",
    "Warje-Malwadi connector utility-safe edge",
    "Vanaz hill-foot green boundary",
    "Mahalaxmi temple road verge",
    "Kothrud bypass connector edge",
    "Warje river-side margin",
    "Paud road open setback",
    "Vanaz station frontage green edge",
    "Bavdhan link road verge",
    "Warje hill-base planting edge",
  ],
  aundh: [
    "Aundh ITI Road avenue verge",
    "Parihar Chowk utility-safe setback",
    "Aundh gaon open green edge",
    "Westend Mall perimeter verge",
    "Bremen Chowk roadside edge",
    "ITI Road open setback",
    "Aundh hospital boundary margin",
    "Sanghvi Nagar green verge",
    "DP Road avenue edge",
    "Aundh gaon temple road strip",
  ],
  hinjewadi: [
    "Hinjewadi Phase 1 median verge",
    "Phase 2 service road utility-safe edge",
    "Rajiv Gandhi IT Park green boundary",
    "Hinjewadi chowk roadside verge",
    "Maan road service edge",
    "Infosys campus boundary margin",
    "Phase 3 connector setback",
    "Blue Ridge access verge",
    "Wipro circle green edge",
    "Hinjewadi industrial edge",
  ],
  wakad: [
    "Wakad chowk median verge",
    "Datta Mandir Road utility-safe setback",
    "Wakad bridge open green edge",
    "Mumbai-Bengaluru highway frontage verge",
    "Dange Chowk approach edge",
    "Datta Mandir side green margin",
    "Wakad high-street setback",
    "Kaspate Wasti road verge",
    "Bhujbal Chowk boundary edge",
    "Bhumkar Chowk roadside strip",
  ],
  baner: [
    "Baner Road avenue verge",
    "Balewadi Phata utility-safe setback",
    "Baner hill-base green boundary",
    "Aundh-Baner link road verge",
    "Balewadi stadium approach edge",
    "Baner hill road setback",
    "Pashan-Sus road green margin",
    "Baner main road avenue edge",
    "Sutarwadi connector verge",
    "Baner gaon boundary strip",
  ],
  wadgaon: [
    "Wadgaon bridge approach verge",
    "Sinhagad Road utility-safe setback",
    "Wadgaon slope-side green edge",
    "Vadgaon Dhayari road verge",
    "Sinhagad institute boundary edge",
    "Wadgaon bridge access setback",
    "Nanded city connector verge",
    "Vadgaon khurd open edge",
    "Dhayari road slope margin",
    "Katraj bypass boundary strip",
  ],
  wagholi: [
    "Wagholi chowk median verge",
    "Kesnand Road utility-safe setback",
    "Wagholi peripheral green boundary",
    "Pune-Nagar highway edge",
    "Kesnand road-side verge",
    "Wagholi gaon open setback",
    "Lohgaon-Wagholi connector edge",
    "Wagholi industrial boundary margin",
    "Wagholi chowk open strip",
    "Baif road green verge",
  ],
  dhayri: [
    "Dhayri phata roadside verge",
    "Dhayri gaon utility-safe setback",
    "Canal-side open green edge",
    "Dhayri phata bridge verge",
    "Sinhagad road upper edge",
    "Dhayri gaon temple road strip",
    "Canal bank planting margin",
    "Narhe link road setback",
    "Dhayri hill-base green verge",
    "Nanded city approach edge",
  ],
  "viman-nagar": [
    "Viman Nagar chowk avenue verge",
    "Symbiosis Road utility-safe setback",
    "Airport boundary green edge",
    "Phoenix road frontage verge",
    "Symbiosis college edge",
    "Airport road service setback",
    "Viman Nagar central avenue",
    "Nagar road green margin",
    "Kalyani Nagar link verge",
    "Viman Nagar market road edge",
  ],
  katraj: [
    "Katraj chowk roadside verge",
    "Katraj tunnel approach utility-safe edge",
    "Katraj lake-side green boundary",
    "Katraj lake promenade edge",
    "Bharati Vidyapeeth road verge",
    "Katraj bypass roadside setback",
    "Ambegaon road green margin",
    "Katraj tunnel service edge",
    "Dhanakawadi connector verge",
    "Katraj chowk outer strip",
  ],
  dhanori: [
    "Dhanori Jakat Naka roadside verge",
    "Porwal Road utility-safe setback",
    "Dhanori lake periphery green edge",
    "Lohgaon road verge",
    "Dhanori gaon open boundary",
    "Porwal road service edge",
    "Airport approach green margin",
    "Dhanori chowk roadside strip",
    "Nirgudi road setback",
    "Dhanori lake access verge",
  ],
};

function round4(value) {
  return Number(value.toFixed(4));
}

function buildPlantableSites(area) {
  const offsets = profileOffsets[area.profile] || profileOffsets["mixed-urban"];
  const [lat, lon] = area.center;
  const names = areaLocationNames[area.id] || [
    `${area.label} primary roadside verge`,
    `${area.label} utility-safe setback`,
    `${area.label} open green boundary`,
  ];

  const siteCount = Math.max(10, names.length);

  function offsetForIndex(index) {
    const base = offsets[index % offsets.length];
    const cycle = Math.floor(index / offsets.length);
    return [base[0] + cycle * 0.00065, base[1] - cycle * 0.00055];
  }

  return Array.from({ length: siteCount }, (_, index) => {
    const name = names[index] || `${area.label} green edge ${index + 1}`;
    const [latOffset, lonOffset] = offsetForIndex(index);
    const areaFactor = index % 4;
    const plantableAreaM2 = 58 + index * 8 + areaFactor * 6;
    const estimatedTrees = 9 + index + areaFactor;
    const spacing = index < 4 ? "5-6m" : index < 7 ? "6-7m" : "6-8m";
    const surfaceType = index % 3 === 0 ? "Open soil median" : index % 3 === 1 ? "Soil setback" : "Open buffer soil";

    return {
      id: `${area.id}-${String(index + 1).padStart(2, "0")}`,
      name,
      coordinates: [round4(lat + latOffset), round4(lon + lonOffset)],
      surfaceType,
      plantableAreaM2,
      estimatedTrees,
      recommendedSpacingM: spacing,
      suitableTiers: index < 3 ? ["compact"] : index < 7 ? ["compact", "medium"] : ["compact", "medium", "large"],
      executionNote:
        index < 3
          ? "Keep the footprint within the service-safe verge and away from paved surface joints."
          : index < 7
            ? "Maintain boundary and utility clearance before digging pits."
            : "Prefer open soil pockets and avoid all slab, ramp, and building interfaces.",
    };
  });
}

function buildExcludedSites(area) {
  return [
    {
      id: `${area.id}-x1`,
      name: `${area.label} building frontage forecourts`,
      reason: "Concrete/paved frontage with active pedestrian and vehicle access.",
    },
    {
      id: `${area.id}-x2`,
      name: `${area.label} basement ramp and podium slab edges`,
      reason: "No rooting depth; structural slab and waterproofing risk.",
    },
    {
      id: `${area.id}-x3`,
      name: `${area.label} transformer and utility trench strip`,
      reason: "Mandatory service clearance and root-intrusion risk.",
    },
  ];
}

function buildSummary(plantableSites) {
  const totalPlantableAreaM2 = plantableSites.reduce((sum, site) => sum + site.plantableAreaM2, 0);
  const estimatedTreeCapacity = plantableSites.reduce((sum, site) => sum + site.estimatedTrees, 0);
  const excludedAreaM2 = Math.round(totalPlantableAreaM2 * 0.48);

  return {
    totalPlantableAreaM2,
    estimatedTreeCapacity,
    excludedAreaM2,
  };
}

function buildAreaAnalyzer(area) {
  if (area.id === "kothrud") {
    const plantableSites = [
      {
        id: "kothrud-01",
        name: "Karve Statue junction median near Paud Road",
        coordinates: [18.5079, 73.8073],
        surfaceType: "Open soil median",
        plantableAreaM2: 68,
        estimatedTrees: 12,
        recommendedSpacingM: "5-6m",
        suitableTiers: ["compact"],
        executionNote: "Use root barriers near drains and keep clear of carriageway concrete slab.",
      },
      {
        id: "kothrud-02",
        name: "Ideal Colony DP Road utility-safe verge",
        coordinates: [18.5098, 73.8186],
        surfaceType: "Soil setback",
        plantableAreaM2: 124,
        estimatedTrees: 18,
        recommendedSpacingM: "6-7m",
        suitableTiers: ["compact", "medium"],
        executionNote: "Maintain clearance from utility boxes and keep 1m from compound walls.",
      },
      {
        id: "kothrud-03",
        name: "Mhatre Bridge approach soil embankment",
        coordinates: [18.5141, 73.8274],
        surfaceType: "Embankment soil",
        plantableAreaM2: 92,
        estimatedTrees: 14,
        recommendedSpacingM: "6m",
        suitableTiers: ["compact", "medium"],
        executionNote: "Prefer soil-binding species and avoid retaining wall footing.",
      },
      {
        id: "kothrud-04",
        name: "Kothrud PMT depot rear green boundary",
        coordinates: [18.5009, 73.8125],
        surfaceType: "Open buffer soil",
        plantableAreaM2: 156,
        estimatedTrees: 24,
        recommendedSpacingM: "6-8m",
        suitableTiers: ["compact", "medium"],
        executionNote: "Do not plant inside bus maneuvering apron or fuel service slab.",
      },
    ];

    return {
      cityId: "pune",
      locality: "Kothrud",
      summary: {
        totalPlantableAreaM2: 440,
        estimatedTreeCapacity: 68,
        excludedAreaM2: 210,
      },
      plantableSites,
      excludedSites: [
        {
          id: "kothrud-x1",
          name: "Building frontage concrete forecourts",
          reason: "Full concrete surface with active access path; no open soil.",
        },
        {
          id: "kothrud-x2",
          name: "Basement ramp edges and podium slab zones",
          reason: "Structural slab cannot support tree rooting depth.",
        },
        {
          id: "kothrud-x3",
          name: "Transformer/utility service strip",
          reason: "Safety clearance restrictions for roots and canopy.",
        },
      ],
    };
  }

  const plantableSites = buildPlantableSites(area);

  return {
    cityId: "pune",
    locality: area.label,
    summary: buildSummary(plantableSites),
    plantableSites,
    excludedSites: buildExcludedSites(area),
  };
}

const areaAnalyzers = Object.fromEntries(
  [{ id: "kothrud", label: "Kothrud", center: [18.5074, 73.8077], profile: "residential-grid" }, ...puneAreaCatalog].map((area) => [
    area.id,
    buildAreaAnalyzer(area),
  ]),
);

export const puneAreaOptions = [{ id: "kothrud", label: "Kothrud" }, ...puneAreaCatalog.map(({ id, label }) => ({ id, label }))];

export function getPuneAreaAnalyzerData(areaId) {
  return areaAnalyzers[areaId] || areaAnalyzers.kothrud;
}
