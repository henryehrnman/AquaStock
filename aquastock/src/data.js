export const SPECIES_DB = [
  // Freshwater Fish
  { id: 1, name: "Neon Tetra", type: "fish", water: "freshwater", minTank: 10, tempMin: 70, tempMax: 82, phMin: 5.0, phMax: 7.5, ghMin: 1, ghMax: 10, khMin: 1, khMax: 5, school: 6, difficulty: "beginner", img: "🐟", color: "#00e5ff", desc: "Brilliant iridescent blue and red. Peaceful schooling fish perfect for community tanks.", popular: true },
  { id: 2, name: "Betta Splendens", type: "fish", water: "freshwater", minTank: 5, tempMin: 76, tempMax: 82, phMin: 6.0, phMax: 7.5, ghMin: 1, ghMax: 12, khMin: 1, khMax: 5, school: 1, difficulty: "beginner", img: "🐠", color: "#e91e63", desc: "Stunning flowing fins. Keep males solo — territorial but full of personality.", popular: true },
  { id: 3, name: "Corydoras Catfish", type: "fish", water: "freshwater", minTank: 10, tempMin: 72, tempMax: 79, phMin: 6.0, phMax: 7.8, ghMin: 2, ghMax: 15, khMin: 2, khMax: 8, school: 4, difficulty: "beginner", img: "🐟", color: "#ffab40", desc: "Adorable bottom-dwellers that keep your substrate clean. Very social.", popular: true },
  { id: 4, name: "Angelfish", type: "fish", water: "freshwater", minTank: 30, tempMin: 76, tempMax: 84, phMin: 6.0, phMax: 7.5, ghMin: 3, ghMax: 10, khMin: 1, khMax: 5, school: 2, difficulty: "intermediate", img: "🐠", color: "#e0e0e0", desc: "Majestic and graceful. A stunning centerpiece fish for medium to large tanks.", popular: true },
  { id: 5, name: "Cherry Barb", type: "fish", water: "freshwater", minTank: 10, tempMin: 73, tempMax: 81, phMin: 6.0, phMax: 7.0, ghMin: 4, ghMax: 15, khMin: 2, khMax: 8, school: 6, difficulty: "beginner", img: "🐟", color: "#ff5252", desc: "Vibrant red coloration. Hardy, peaceful, and great for planted tanks." },
  { id: 6, name: "Dwarf Gourami", type: "fish", water: "freshwater", minTank: 10, tempMin: 72, tempMax: 82, phMin: 6.0, phMax: 7.5, ghMin: 4, ghMax: 10, khMin: 1, khMax: 5, school: 1, difficulty: "beginner", img: "🐠", color: "#448aff", desc: "Brilliant blues and reds. A labyrinth fish that breathes air from the surface." },
  { id: 7, name: "German Blue Ram", type: "fish", water: "freshwater", minTank: 20, tempMin: 78, tempMax: 85, phMin: 5.0, phMax: 7.0, ghMin: 0, ghMax: 6, khMin: 0, khMax: 3, school: 2, difficulty: "intermediate", img: "🐠", color: "#ffeb3b", desc: "Electric blue and gold. A dwarf cichlid with incredible personality." },
  { id: 8, name: "Bristlenose Pleco", type: "fish", water: "freshwater", minTank: 20, tempMin: 73, tempMax: 81, phMin: 6.5, phMax: 7.5, ghMin: 2, ghMax: 15, khMin: 1, khMax: 8, school: 1, difficulty: "beginner", img: "🐟", color: "#795548", desc: "Excellent algae eater. Stays small unlike common plecos.", popular: true },
  { id: 9, name: "Harlequin Rasbora", type: "fish", water: "freshwater", minTank: 10, tempMin: 73, tempMax: 82, phMin: 6.0, phMax: 7.5, ghMin: 2, ghMax: 10, khMin: 1, khMax: 5, school: 8, difficulty: "beginner", img: "🐟", color: "#ff9800", desc: "Copper and black wedge pattern. Peaceful and looks stunning in groups." },
  { id: 10, name: "Discus", type: "fish", water: "freshwater", minTank: 55, tempMin: 82, tempMax: 88, phMin: 5.5, phMax: 7.0, ghMin: 0, ghMax: 5, khMin: 0, khMax: 3, school: 5, difficulty: "advanced", img: "🐠", color: "#e040fb", desc: "The king of freshwater aquariums. Requires pristine water but rewards with breathtaking beauty." },

  // Saltwater Fish
  { id: 11, name: "Ocellaris Clownfish", type: "fish", water: "saltwater", minTank: 20, tempMin: 74, tempMax: 80, phMin: 8.0, phMax: 8.4, ghMin: 8, ghMax: 12, khMin: 8, khMax: 12, school: 2, difficulty: "beginner", img: "🐠", color: "#ff6d00", desc: "The iconic 'Nemo'. Hardy, colorful, and bonds with anemones.", popular: true },
  { id: 12, name: "Royal Gramma", type: "fish", water: "saltwater", minTank: 20, tempMin: 72, tempMax: 78, phMin: 8.1, phMax: 8.4, ghMin: 8, ghMax: 12, khMin: 8, khMax: 12, school: 1, difficulty: "beginner", img: "🐠", color: "#aa00ff", desc: "Striking purple and yellow. A peaceful reef-safe fish." },
  { id: 13, name: "Yellow Tang", type: "fish", water: "saltwater", minTank: 75, tempMin: 72, tempMax: 78, phMin: 8.1, phMax: 8.4, ghMin: 8, ghMax: 12, khMin: 8, khMax: 12, school: 1, difficulty: "intermediate", img: "🐠", color: "#ffd600", desc: "Electric yellow coloration. Active swimmer needing room to roam." },
  { id: 14, name: "Firefish Goby", type: "fish", water: "saltwater", minTank: 20, tempMin: 72, tempMax: 80, phMin: 8.1, phMax: 8.4, ghMin: 8, ghMax: 12, khMin: 8, khMax: 12, school: 1, difficulty: "beginner", img: "🐟", color: "#ff1744", desc: "Elegant white body with fiery red tail. Peaceful and hardy." },

  // Invertebrates
  { id: 20, name: "Amano Shrimp", type: "invertebrate", water: "freshwater", minTank: 5, tempMin: 70, tempMax: 80, phMin: 6.5, phMax: 7.5, ghMin: 6, ghMax: 15, khMin: 3, khMax: 8, school: 3, difficulty: "beginner", img: "🦐", color: "#b2dfdb", desc: "Champion algae eaters. Transparent with distinctive dots along the body.", popular: true },
  { id: 21, name: "Cherry Shrimp", type: "invertebrate", water: "freshwater", minTank: 5, tempMin: 65, tempMax: 80, phMin: 6.2, phMax: 8.0, ghMin: 4, ghMax: 8, khMin: 3, khMax: 8, school: 6, difficulty: "beginner", img: "🦐", color: "#ef5350", desc: "Brilliant red neocaridina. Breed readily and create living jewels in your tank.", popular: true },
  { id: 22, name: "Nerite Snail", type: "invertebrate", water: "freshwater", minTank: 5, tempMin: 72, tempMax: 78, phMin: 7.0, phMax: 8.5, ghMin: 5, ghMax: 15, khMin: 5, khMax: 12, school: 1, difficulty: "beginner", img: "🐌", color: "#a1887f", desc: "Tireless algae eaters with beautiful shell patterns. Won't breed in freshwater." },
  { id: 23, name: "Mystery Snail", type: "invertebrate", water: "freshwater", minTank: 5, tempMin: 68, tempMax: 82, phMin: 7.0, phMax: 8.0, ghMin: 5, ghMax: 15, khMin: 5, khMax: 12, school: 1, difficulty: "beginner", img: "🐌", color: "#ffc107", desc: "Colorful and entertaining to watch. Available in gold, blue, ivory, and more." },
  { id: 24, name: "Cleaner Shrimp", type: "invertebrate", water: "saltwater", minTank: 20, tempMin: 72, tempMax: 80, phMin: 8.0, phMax: 8.4, ghMin: 8, ghMax: 12, khMin: 8, khMax: 12, school: 1, difficulty: "beginner", img: "🦐", color: "#ff6e40", desc: "Sets up cleaning stations for fish. Charismatic and useful reef inhabitant.", popular: true },
  { id: 25, name: "Emerald Crab", type: "invertebrate", water: "saltwater", minTank: 20, tempMin: 72, tempMax: 80, phMin: 8.0, phMax: 8.4, ghMin: 8, ghMax: 12, khMin: 8, khMax: 12, school: 1, difficulty: "beginner", img: "🦀", color: "#00c853", desc: "Brilliant green. Consumes bubble algae that other creatures won't touch." },

  // Corals
  { id: 30, name: "Zoanthids", type: "coral", water: "saltwater", minTank: 10, tempMin: 75, tempMax: 80, phMin: 8.0, phMax: 8.4, ghMin: 8, ghMax: 12, khMin: 8, khMax: 12, school: 1, difficulty: "beginner", img: "🪸", color: "#76ff03", desc: "Kaleidoscopic colors. The gateway coral — hardy and comes in infinite morphs.", popular: true },
  { id: 31, name: "Mushroom Coral", type: "coral", water: "saltwater", minTank: 10, tempMin: 75, tempMax: 80, phMin: 8.0, phMax: 8.4, ghMin: 8, ghMax: 12, khMin: 7, khMax: 11, school: 1, difficulty: "beginner", img: "🪸", color: "#d500f9", desc: "Soft, flowing discs in vivid colors. Nearly indestructible for a coral." },
  { id: 32, name: "Hammer Coral", type: "coral", water: "saltwater", minTank: 30, tempMin: 75, tempMax: 80, phMin: 8.0, phMax: 8.4, ghMin: 8, ghMax: 12, khMin: 8, khMax: 12, school: 1, difficulty: "intermediate", img: "🪸", color: "#00e676", desc: "Flowing tentacles with hammer-shaped tips. Mesmerizing movement under flow." },
  { id: 33, name: "Torch Coral", type: "coral", water: "saltwater", minTank: 30, tempMin: 75, tempMax: 80, phMin: 8.0, phMax: 8.4, ghMin: 8, ghMax: 12, khMin: 8, khMax: 12, school: 1, difficulty: "intermediate", img: "🪸", color: "#ffea00", desc: "Long flowing tentacles. Clownfish sometimes host in these as anemone substitutes." },
  { id: 34, name: "Acropora", type: "coral", water: "saltwater", minTank: 50, tempMin: 76, tempMax: 80, phMin: 8.1, phMax: 8.4, ghMin: 8, ghMax: 12, khMin: 9, khMax: 12, school: 1, difficulty: "advanced", img: "🪸", color: "#18ffff", desc: "The pinnacle of reef keeping. Stunning branching structures demanding pristine water." },

  // Amphibians
  { id: 40, name: "African Dwarf Frog", type: "amphibian", water: "freshwater", minTank: 5, tempMin: 72, tempMax: 82, phMin: 6.5, phMax: 7.8, ghMin: 5, ghMax: 15, khMin: 2, khMax: 8, school: 2, difficulty: "beginner", img: "🐸", color: "#69f0ae", desc: "Fully aquatic and full of charm. Loves to float at the surface with arms spread.", popular: true },
  { id: 41, name: "Axolotl", type: "amphibian", water: "freshwater", minTank: 20, tempMin: 60, tempMax: 68, phMin: 6.5, phMax: 8.0, ghMin: 7, ghMax: 14, khMin: 3, khMax: 8, school: 1, difficulty: "intermediate", img: "🦎", color: "#f8bbd0", desc: "The smiling salamander. Needs cold water and gentle flow. Utterly unique.", popular: true },
  { id: 42, name: "Fire Belly Newt", type: "amphibian", water: "freshwater", minTank: 10, tempMin: 62, tempMax: 72, phMin: 6.5, phMax: 7.5, ghMin: 6, ghMax: 12, khMin: 3, khMax: 8, school: 2, difficulty: "intermediate", img: "🦎", color: "#ff3d00", desc: "Vivid orange belly warns predators. Semi-aquatic — needs land area access." },
];

export const CURATED_SETUPS = [
  {
    name: "Peaceful Community",
    water: "freshwater",
    minTank: 20,
    desc: "A harmonious mix of colorful, easy-going species",
    species: [1, 3, 8, 21],
    gradient: "linear-gradient(135deg, #00695c, #004d40)",
  },
  {
    name: "Nano Reef Starter",
    water: "saltwater",
    minTank: 20,
    desc: "Your first steps into the mesmerizing world of reef keeping",
    species: [11, 14, 24, 30],
    gradient: "linear-gradient(135deg, #1a237e, #0d47a1)",
  },
  {
    name: "Shrimp Paradise",
    water: "freshwater",
    minTank: 10,
    desc: "A lush planted tank alive with tiny colorful crustaceans",
    species: [20, 21, 22, 1],
    gradient: "linear-gradient(135deg, #1b5e20, #2e7d32)",
  },
  {
    name: "Betta Kingdom",
    water: "freshwater",
    minTank: 10,
    desc: "A serene realm built around a magnificent betta",
    species: [2, 3, 22, 20],
    gradient: "linear-gradient(135deg, #880e4f, #4a148c)",
  },
  {
    name: "Oddball Aquatics",
    water: "freshwater",
    minTank: 20,
    desc: "Fascinating creatures that break the mold",
    species: [41, 40, 23],
    gradient: "linear-gradient(135deg, #263238, #37474f)",
  },
];
