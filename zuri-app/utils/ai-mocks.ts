export const aiMocks = {
  diagnosticStudio: {
    undertone: "Warm Golden",
    makeupRecommendations: {
      foundation: ["#F3E5AB", "#D2B48C", "#C19A6B"],
      lipColors: ["#D9603B", "#C04000", "#8A3324"],
      eyeshadows: ["#B87333", "#CD7F32", "#8B4513"]
    },
    hairstyles: {
      flattering: ["Long Layers", "Soft Waves", "Face-Framing Balayage"],
      avoid: ["Blunt Cut", "Harsh Center Part", "Very Short Pixie"]
    }
  },

  monsoonAdvisor: {
    currentWeather: { condition: "Heavy Rain", humidity: 88, temp: 28 },
    recommendationText: "88% Humidity in Bandra today. Since your profile shows wavy hair, we strongly recommend an anti-frizz Keratin booster to maintain your style.",
    quickLinks: [
      { treatment: "Anti-Frizz Spa", salonId: "salon_123" },
      { treatment: "Matte Makeup Set", salonId: "salon_456" }
    ]
  },

  customerReviewSynthesis: {
    bestFor: "Bridal prep and highly intricate HD makeup (84 reviews agree).",
    watchOutFor: "High wait times on Friday evenings and weekends.",
    vibe: "Relaxed luxury with complimentary cold brew and ambient lighting."
  },

  adminReviewAnalysis: {
    topAsset: "92% of reviews praise your Senior Stylist team for their balayage execution.",
    frictionPoint: "Wait times on Friday evenings are frequently cited as frustrating.",
    growthSuggestion: "AI recommends allocating an extra junior stylist to hair spas between 4 PM - 7 PM on Fridays to counter volume bottlenecks."
  }
};
