/*
 * Portfolio content manifest.
 *
 * This file is the single source of truth for dynamic sections
 * (journey, projects, certificates, gallery). Editing it is enough to
 * update the site — no build step required.
 *
 * Rules:
 *  - Never invent experience, companies, certificates, education, or projects.
 *  - When information is missing, leave the field as "To Be Updated"
 *    or "Add Information Here", or omit the entry.
 *
 * Paths are relative and must point inside the repo (never local computer paths).
 */

window.PORTFOLIO_CONTENT = {
  profile: {
    name: "Adonay Michale",
    portrait: "assets/images/portrait.jpg",
    interests: [
      "Economics",
      "Artificial Intelligence",
      "Machine Learning",
      "Financial Technology",
      "Capital Markets",
      "Data",
      "Research",
      "Technology",
      "Innovation",
      "Problem Solving"
    ]
  },

  // Education & experience timeline. Add real entries only.
  journey: [
    {
      year: "To Be Updated",
      title: "Add Information Here",
      org: "Add Information Here",
      type: "education",
      description: "Add your education history here. Never invent institutions or dates."
    },
    {
      year: "To Be Updated",
      title: "Add Information Here",
      org: "Add Information Here",
      type: "experience",
      description: "Add work or research experience here. Use real roles only."
    }
  ],

  // Selected projects. Add real projects only.
  // `image` points to assets/images/<filename> — add the real file + filename.
  projects: [
    {
      title: "Add Information Here",
      description: "Describe a real project you have worked on. Do not fabricate outcomes.",
      image: "assets/images/capital-markets-event.jpg",
      tags: ["Economics", "Data"],
      link: ""
    },
    {
      title: "Add Information Here",
      description: "Describe a real project you have worked on. Do not fabricate outcomes.",
      image: "assets/images/mun-podium-speech.jpg",
      tags: ["AI", "ML"],
      link: ""
    },
    {
      title: "Add Information Here",
      description: "Describe a real project you have worked on. Do not fabricate outcomes.",
      image: "assets/images/cbe-capital-investment-event.jpg",
      tags: ["FinTech"],
      link: ""
    }
  ],

  // Certificates. Files placed in assets/certificates/ can also be
  // auto-listed by the backend; this manifest works without a backend.
  // Real files added by owner — titles derived from filenames.
  // Issuer / date left as placeholders for the owner to complete.
  certificates: [
    {
      file: "assets/certificates/basket-ball-certificate.jpg",
      title: "Basketball Certificate",
      issuer: "Add Information Here",
      date: "To Be Updated"
    },
    {
      file: "assets/certificates/digital-empowerment-certificate.jpg",
      title: "Digital Empowerment Certificate",
      issuer: "Add Information Here",
      date: "To Be Updated"
    },
    {
      file: "assets/certificates/model-united-nations-certificate.jpg",
      title: "Model United Nations Certificate",
      issuer: "Add Information Here",
      date: "To Be Updated"
    },
    {
      file: "assets/certificates/peace-building-certificate.jpg",
      title: "Peace Building Certificate",
      issuer: "Add Information Here",
      date: "To Be Updated"
    },
    {
      file: "assets/certificates/un-navigation-certificate.jpg",
      title: "UN Navigation Certificate",
      issuer: "Add Information Here",
      date: "To Be Updated"
    }
  ],

  // Gallery. Categories map to assets/gallery/<folder>/.
  // Items without a real image fall back to a placeholder card.
  gallery: [
    {
      category: "TEDx",
      folder: "tedx",
      items: [
        { src: "assets/gallery/tedx/tedx-panel-discussion.jpg", title: "TEDx Panel Discussion", description: "Add event details here." },
        { src: "assets/gallery/tedx/tedx-panel-discussion-2.jpg", title: "TEDx Panel Discussion", description: "Add event details here." }
      ]
    },
    {
      category: "Model UN",
      folder: "model-un",
      items: [
        { src: "assets/gallery/model-un/mun-award-handshake.jpg", title: "MUN Award Handshake", description: "Add event details here." },
        { src: "assets/gallery/model-un/mun-delegate-networking.jpg", title: "MUN Delegate Networking", description: "Add event details here." },
        { src: "assets/gallery/model-un/mun-podium-speech.jpg", title: "MUN Podium Speech", description: "Add event details here." }
      ]
    },
    {
      category: "Finance",
      folder: "finance",
      items: [
        { src: "assets/gallery/finance/capital-markets-event.jpg", title: "Capital Markets Event", description: "Add event details here." },
        { src: "assets/gallery/finance/cbe-capital-investment-event.jpg", title: "CBE Capital Investment Event", description: "Add event details here." }
      ]
    },
    {
      category: "Leadership",
      folder: "other",
      items: [
        { src: "", title: "Add Information Here", description: "Add event details here." }
      ]
    },
    {
      category: "Events",
      folder: "other",
      items: [
        { src: "", title: "Add Information Here", description: "Add event details here." }
      ]
    }
  ],

  // Contact configuration.
  contact: {
    // Optional backend base URL (e.g. https://your-app.onrender.com).
    // Leave empty to use a static form service (set formService below).
    apiBase: "",
    // Static fallback service: "formspree" | "web3forms" | "" (none)
    formService: "",
    // Your Formspree/Web3Forms endpoint or access key.
    formEndpoint: "",
    email: "adonaymichel20@gmail.com" 
  }
};
