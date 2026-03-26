const CATEGORY_KEYWORDS: Record<string, string[]> = {
  "Technology": [
    "python", "javascript", "typescript", "react", "node", "java", "c++", "c#", "ruby", "php",
    "swift", "kotlin", "rust", "go", "scala", "programming", "coding", "software", "web", "html",
    "css", "sql", "database", "machine learning", "ai", "data science", "data analysis", "git",
    "aws", "azure", "cloud", "devops", "docker", "kubernetes", "linux", "cybersecurity", "hacking",
    "networking", "blockchain", "flutter", "android", "ios", "mobile", "backend", "frontend",
    "fullstack", "api", "ml", "deep learning", "tensorflow", "pytorch", "excel vba", "matlab",
  ],
  "Art & Design": [
    "art", "design", "photoshop", "illustrator", "figma", "ui", "ux", "drawing", "painting",
    "illustration", "sketch", "graphic", "photography", "photo", "video", "animation", "3d",
    "blender", "cinema 4d", "after effects", "premiere", "lightroom", "typography", "branding",
    "logo", "interior design", "fashion design", "architecture", "calligraphy", "watercolor",
    "digital art", "pixel art", "procreate",
  ],
  "Music": [
    "guitar", "piano", "violin", "drums", "singing", "music", "bass", "ukulele", "saxophone",
    "flute", "trumpet", "cello", "keyboard", "production", "mixing", "dj", "beatmaking",
    "songwriting", "composition", "music theory", "voice", "vocal", "choir", "clarinet",
  ],
  "Language": [
    "spanish", "french", "german", "japanese", "chinese", "mandarin", "arabic", "korean",
    "english", "hindi", "portuguese", "italian", "russian", "dutch", "swedish", "turkish",
    "polish", "vietnamese", "thai", "language", "linguistics", "translation", "sign language",
  ],
  "Education": [
    "math", "mathematics", "physics", "chemistry", "biology", "history", "writing", "reading",
    "tutoring", "teaching", "algebra", "calculus", "geometry", "statistics", "science",
    "literature", "essay", "geography", "economics", "philosophy", "psychology", "sociology",
    "research", "academic",
  ],
  "Sports & Fitness": [
    "yoga", "fitness", "gym", "workout", "running", "cycling", "swimming", "basketball",
    "football", "soccer", "tennis", "boxing", "martial arts", "judo", "karate", "crossfit",
    "pilates", "dance", "ballet", "salsa", "hip hop dance", "rock climbing", "hiking",
    "surfing", "skiing", "golf", "volleyball", "badminton",
  ],
  "Cooking": [
    "cooking", "baking", "chef", "recipe", "nutrition", "food", "pastry", "bread", "bbq",
    "grilling", "meal prep", "barista", "coffee", "cocktail", "mixology", "vegan cooking",
  ],
  "Business": [
    "marketing", "sales", "finance", "accounting", "excel", "powerpoint", "presentation",
    "negotiation", "management", "entrepreneurship", "startup", "investing", "trading",
    "real estate", "seo", "social media", "content", "copywriting", "public speaking",
    "leadership", "project management", "product management",
  ],
  "Crafts": [
    "sewing", "knitting", "crochet", "woodworking", "pottery", "origami", "jewelry",
    "embroidery", "leather", "candle", "soap", "weaving", "quilting", "paper craft",
    "model building", "diy",
  ],
  "Wellness": [
    "meditation", "mindfulness", "mental health", "therapy", "massage", "reiki", "life coaching",
    "nutrition coaching", "sleep", "stress", "breathwork", "journaling", "spirituality",
  ],
};

export function inferCategory(skillName: string): string | null {
  const lower = skillName.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return category;
    }
  }
  return null;
}
