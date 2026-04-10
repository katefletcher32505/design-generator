const WORKER_URL = "https://design-generator-api.katefletcher32505.workers.dev/generate";

const themeOptions = [
  "retro kitchen",
  "cowgirl western",
  "birdwatching",
  "disco party",
  "romantic botanical",
  "coastal grandmother"
];

const vibeOptions = [
  "witty feminine",
  "earthy cozy",
  "sardonic vintage",
  "hand-painted playful",
  "moody artsy",
  "maximalist whimsical",
  "soft romantic",
  "quirky indie",
  "retro bold",
  "charming weird"
];

const designTypeOptions = [
  "graphic",
  "slogan",
  "graphic+slogan",
  "pattern"
];

const productOptions = [
  "t-shirt",
  "sticker",
  "poster",
  "pillow",
  "journal",
  "tote bag"
];

const artStyles = [
  "digitally hand-painted gouache",
  "procreate-style textured illustration",
  "watercolor and ink",
  "retro screenprint",
  "colored pencil drawing",
  "folk-art inspired painting",
  "risograph collage",
  "vintage botanical illustration",
  "imperfect marker drawing",
  "ink and wash illustration"
];

const themeBanks = {
  "retro kitchen": {
    subjects: [
      "butter dish",
      "recipe card",
      "cowgirl boots on checkered kitchen tile",
      "tomato canister",
      "rooster plate",
      "teacup",
      "oven mitt",
      "cherries in a mixing bowl",
      "sardine tin beside lemons",
      "vintage salt shaker set",
      "tomatoes on a windowsill",
      "cake stand with cherries"
    ],
    motifs: [
      "checkered tile",
      "starburst corner accents",
      "lace trim border",
      "label-frame layout",
      "postcard framing",
      "vintage wallpaper details"
    ],
    palettes: [
      "cream, tomato red, and faded teal",
      "butter yellow, cinnamon, and soft blue",
      "dusty pink, brown, and ivory",
      "sage green, rust, and cream"
    ],
    sloganStyles: [
      "dry and witty",
      "campy domestic",
      "soft ironic",
      "country-kitsch"
    ]
  },

  "cowgirl western": {
    subjects: [
      "cowgirl boots",
      "horseshoe charm",
      "western shirt collar",
      "bandana and lipstick",
      "silver belt buckle",
      "matchbook and boots",
      "desert flower bouquet",
      "cowboy hat on vanity table"
    ],
    motifs: [
      "stitched border",
      "western poster framing",
      "ornamental rope accents",
      "faded desert sunburst",
      "vintage rodeo label layout"
    ],
    palettes: [
      "dusty rose, brown, and cream",
      "turquoise, rust, and sand",
      "red, tan, and faded denim blue"
    ],
    sloganStyles: [
      "sardonic western",
      "pretty but tough",
      "romantic outlaw",
      "soft country attitude"
    ]
  },

  "birdwatching": {
    subjects: [
      "finch on wild grass",
      "heron near reeds",
      "binoculars and field guide",
      "sparrow on teacup",
      "feather collection card",
      "bird perched in berry branch",
      "warbler and notebook",
      "swallow over marsh grass"
    ],
    motifs: [
      "field-guide framing",
      "specimen label layout",
      "botanical border",
      "soft sky background",
      "nature journal composition"
    ],
    palettes: [
      "sage, sky blue, and cream",
      "moss, berry, and parchment",
      "soft gold, olive, and pale blue"
    ],
    sloganStyles: [
      "quietly witty",
      "observant and soft",
      "nature-nerdy",
      "field-guide charming"
    ]
  },

  "disco party": {
    subjects: [
      "mirror ball",
      "martini glass",
      "platform heels",
      "chrome cherries",
      "sparkler starburst",
      "lipstick and lighter",
      "disco ball with ribbon",
      "night-out handbag"
    ],
    motifs: [
      "radiating rays",
      "glitter frame",
      "night-sky dots",
      "poster burst layout",
      "glam label framing"
    ],
    palettes: [
      "hot pink, orange, and deep navy",
      "silver, black, and electric blue",
      "plum, gold, and coral",
      "magenta, red, and champagne"
    ],
    sloganStyles: [
      "cheeky nightlife",
      "sardonic glam",
      "overdressed confidence",
      "messy but iconic"
    ]
  },

  "romantic botanical": {
    subjects: [
      "wildflower bouquet",
      "rose stems and ribbon",
      "pressed flowers page",
      "garden gate with blooms",
      "peonies in a vase",
      "botanical perfume bottle",
      "violets and handwritten note",
      "flower scissors and ribbon"
    ],
    motifs: [
      "ornate frame",
      "postcard composition",
      "pressed-flower layout",
      "soft border detailing",
      "vintage stationery framing"
    ],
    palettes: [
      "blush, cream, and moss green",
      "lilac, wine, and parchment",
      "pale yellow, sage, and dusty pink"
    ],
    sloganStyles: [
      "soft romantic",
      "poetic and lightly ironic",
      "tender but self-aware",
      "vintage feminine"
    ]
  },

  "coastal grandmother": {
    subjects: [
      "striped teacup",
      "sardines and linen napkin",
      "shell dish",
      "lemon bowl by window",
      "blue hydrangea vase",
      "book and reading glasses",
      "seaside market tote",
      "anchovy tin on plate"
    ],
    motifs: [
      "linen-texture framing",
      "postcard border",
      "quiet window composition",
      "coastal label layout",
      "European summer styling"
    ],
    palettes: [
      "navy, cream, and lemon",
      "soft blue, white, and sand",
      "seafoam, butter, and faded red"
    ],
    sloganStyles: [
      "quietly funny",
      "elevated domestic",
      "European summer irony",
      "soft coastal wit"
    ]
  }
};

let currentVariations = [];
let recentConceptKeys = [];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getFeedbackData() {
  return JSON.parse(localStorage.getItem("designFeedback") || "[]");
}

function saveFeedbackData(data) {
  localStorage.setItem("designFeedback", JSON.stringify(data));
}

function saveFeedback(type, variation) {
  const feedback = getFeedbackData();

  feedback.push({
    type,
    timestamp: new Date().toISOString(),
    theme: variation.theme,
    vibe: variation.vibe,
    designType: variation.designType,
    product: variation.product,
    artStyle: variation.artStyle,
    subject: variation.subject,
    motif: variation.motif,
    palette: variation.palette,
    sloganStyle: variation.sloganStyle,
    concept: variation.concept,
    slogan: variation.slogan,
    artPrompt: variation.artPrompt,
    title: variation.title
  });

  saveFeedbackData(feedback);
  renderTasteProfile();
}

function countLikesFor(field, value) {
  const feedback = getFeedbackData();
  return feedback.filter(item => item.type === "like" && item[field] === value).length;
}

function countDislikesFor(field, value) {
  const feedback = getFeedbackData();
  return feedback.filter(item => item.type === "dislike" && item[field] === value).length;
}

function weightedChoice(values, fieldName) {
  const weighted = [];

  values.forEach(value => {
    const likes = countLikesFor(fieldName, value);
    const dislikes = countDislikesFor(fieldName, value);
    const weight = Math.max(1, 2 + likes * 3 - dislikes * 2);

    for (let i = 0; i < weight; i++) {
      weighted.push(value);
    }
  });

  return randomItem(weighted);
}

function buildTags(theme, vibe, product, concept, subject, artStyle) {
  const raw = [
    theme,
    vibe,
    product,
    concept,
    subject,
    artStyle,
    `${theme} design`,
    `${product} artwork`,
    `${vibe} aesthetic`,
    `illustrated ${product}`,
    `gift idea`,
    `art print style`,
    `hand painted look`,
    `quirky design`,
    `vintage inspired`
  ];

  const cleaned = raw
    .map((t) => slugify(t))
    .filter(Boolean)
    .filter((value, index, self) => self.indexOf(value) === index);

  return cleaned.slice(0, 15);
}

function generateSlogan(themeKey, subject, sloganStyle) {
  const s = subject.toLowerCase();

  if (themeKey === "retro kitchen") {
    if (s.includes("cowgirl boots")) return "country but domestic";
    if (s.includes("butter")) return "soft enough to ruin me";
    if (s.includes("recipe")) return "measuring by instinct";
    if (s.includes("teacup")) return "pretty little crisis";
    if (s.includes("tomato")) return "ripe with opinions";
    return "serving side-eye from the kitchen";
  }

  if (themeKey === "cowgirl western") {
    if (s.includes("boots")) return "cause a little trouble";
    if (s.includes("hat")) return "pretty with poor judgment";
    return "too country to explain";
  }

  if (themeKey === "birdwatching") {
    if (s.includes("field guide")) return "noticing everything";
    if (s.includes("heron")) return "grace under weird pressure";
    return "quietly keeping score";
  }

  if (themeKey === "disco party") {
    if (s.includes("mirror ball")) return "born to shimmer";
    if (s.includes("martini")) return "slightly overdressed";
    if (s.includes("lipstick")) return "glamour as defense";
    return "too glam to explain";
  }

  if (themeKey === "romantic botanical") {
    if (s.includes("rose")) return "soft but not simple";
    if (s.includes("pressed flowers")) return "fragile with receipts";
    return "blooming out of spite";
  }

  if (themeKey === "coastal grandmother") {
    if (s.includes("sardines")) return "elegant enough for nonsense";
    if (s.includes("lemon")) return "bright with boundaries";
    return "summering emotionally";
  }

  if (sloganStyle.includes("dry")) return "beautifully underwhelmed";
  if (sloganStyle.includes("romantic")) return "tender little menace";
  if (sloganStyle.includes("glam")) return "high drama, low stakes";

  return "mood with a border";
}

function conceptAlreadyUsed(conceptKey) {
  return recentConceptKeys.includes(conceptKey);
}

function rememberConcept(conceptKey) {
  recentConceptKeys.push(conceptKey);
  if (recentConceptKeys.length > 40) {
    recentConceptKeys.shift();
  }
}

function resolveSelectedValue(selectId, optionsArray) {
  const value = document.getElementById(selectId).value;
  return value === "random" ? randomItem(optionsArray) : value;
}

function generateOneVariation(theme, vibe, designType, product, id) {
  const bank = themeBanks[theme];
  let attempts = 0;
  let conceptData;

  do {
    conceptData = {
      subject: weightedChoice(bank.subjects, "subject"),
      motif: weightedChoice(bank.motifs, "motif"),
      palette: weightedChoice(bank.palettes, "palette"),
      sloganStyle: weightedChoice(bank.sloganStyles, "sloganStyle"),
      artStyle: weightedChoice(artStyles, "artStyle")
    };

    conceptData.conceptKey = `${theme}|${conceptData.subject}|${conceptData.motif}|${conceptData.artStyle}|${product}|${designType}`;
    attempts++;
  } while (conceptAlreadyUsed(conceptData.conceptKey) && attempts < 15);

  rememberConcept(conceptData.conceptKey);

  const { subject, motif, palette, sloganStyle, artStyle } = conceptData;

  let concept = "";
  let artPrompt = "";
  let title = "";
  let description = "";
  let slogan = "";

  if (designType === "graphic") {
    concept = `${theme} ${subject}`;
    artPrompt = `Create clean artwork only with no words, letters, or typography. Make a ${artStyle} ${product} design featuring ${subject}, inspired by ${theme}, with a ${vibe} mood. Use ${motif} and a palette of ${palette}. The composition should feel cohesive, visually balanced, and product-ready. Transparent or clean background preferred.`;
    title = `${theme} ${subject} ${product} design`;
    description = `A ${vibe} ${product} concept featuring ${subject}, rendered in a ${artStyle} style with ${motif} details and a palette of ${palette}.`;
  }

  if (designType === "slogan") {
    slogan = generateSlogan(theme, subject, sloganStyle);
    concept = `${theme} slogan concept`;
    artPrompt = `Create clean decorative background artwork only with no readable text or lettering. Make a subtle ${artStyle} ${product} composition inspired by ${theme}, with a ${vibe} mood, using ${motif} and a palette of ${palette}. Leave the design visually simple enough that text could be added later outside the image.`;
    title = `${theme} slogan ${product}`;
    description = `A text-forward ${product} concept inspired by ${theme}, paired with decorative artwork in a ${artStyle} style.`;
  }

  if (designType === "graphic+slogan") {
    slogan = generateSlogan(theme, subject, sloganStyle);
    concept = `${theme} ${subject} with slogan`;
    artPrompt = `Create clean artwork only with no words, letters, or typography. Make a ${artStyle} ${product} design featuring ${subject}, inspired by ${theme}, with a ${vibe} mood. Use ${motif} and a palette of ${palette}. The image should feel cohesive and strong on its own, with space that would allow text to be added later outside the generated image.`;
    title = `${theme} ${subject} slogan ${product}`;
    description = `A ${vibe} ${product} design built around ${subject}, rendered in a ${artStyle} style with ${motif} details and matched with a ${sloganStyle} slogan.`;
  }

  if (designType === "pattern") {
    concept = `${theme} repeating pattern`;
    artPrompt = `Create a seamless repeating pattern with no words, letters, or typography. Use ${subject} as the hero motif, inspired by ${theme}, with a ${vibe} mood. Include ${motif} details and a palette of ${palette}. The result should feel polished, balanced, and suitable for surface design on ${product}.`;
    title = `${theme} repeating pattern`;
    description = `A seamless surface pattern inspired by ${theme}, featuring ${subject} in a ${artStyle} style with ${motif} details and a palette of ${palette}.`;
  }

  const tags = buildTags(theme, vibe, product, concept, subject, artStyle);
  const mainTag = tags[0] || slugify(theme);

  return {
    id,
    theme,
    vibe,
    designType,
    product,
    subject,
    motif,
    palette,
    sloganStyle,
    artStyle,
    concept,
    artPrompt,
    slogan,
    title,
    description,
    mainTag,
    tags,
    imageUrl: null
  };
}

function generateVariations({ theme, vibe, designType, product, count }) {
  const results = [];

  for (let i = 0; i < count; i++) {
    results.push(generateOneVariation(theme, vibe, designType, product, i + 1));
  }

  return results;
}

function renderResults(items) {
  const resultsEl = document.getElementById("results");
  resultsEl.innerHTML = "";

  items.forEach((item, index) => {
    const card = document.createElement("article");
    card.className = "card";

    card.innerHTML = `
      <h3>Variation ${item.id}</h3>
      <div class="meta">${item.artStyle}</div>

      <div class="button-row">
        <button class="generate-design-btn" onclick="generateDesign(${index})">
          Generate This Design
        </button>
      </div>

      <div class="image-preview" id="image-preview-${index}">
        ${
          item.imageUrl
            ? `<img src="${item.imageUrl}" alt="${item.title}" class="generated-image" />`
            : `<div class="image-placeholder">No design generated yet</div>`
        }
      </div>

      <div class="feedback-row">
        <button class="feedback-btn" onclick="likeVariation(${index})">👍 Like</button>
        <button class="feedback-btn" onclick="dislikeVariation(${index})">👎 Dislike</button>
      </div>

      <div class="block">
        <div class="block-title">Theme</div>
        <p>${item.theme}</p>
      </div>

      <div class="block">
        <div class="block-title">Concept</div>
        <p>${item.concept}</p>
      </div>

      <div class="block">
        <div class="block-title">Slogan</div>
        <p>${item.slogan || "No slogan for this variation."}</p>
      </div>

      <div class="block">
        <div class="block-title">Art Prompt</div>
        <p>${item.artPrompt}</p>
      </div>

      <div class="block">
        <div class="block-title">Title</div>
        <p>${item.title}</p>
      </div>

      <div class="block">
        <div class="block-title">Description</div>
        <p>${item.description}</p>
      </div>

      <div class="block">
        <div class="block-title">Palette</div>
        <p>${item.palette}</p>
      </div>

      <div class="block">
        <div class="block-title">Motif</div>
        <p>${item.motif}</p>
      </div>

      <div class="block">
        <div class="block-title">Main Tag</div>
        <p>${item.mainTag}</p>
      </div>

      <div class="block">
        <div class="block-title">Tags</div>
        <div class="tags">
          ${item.tags.map(tag => `<span class="tag">${tag}</span>`).join("")}
        </div>
      </div>
    `;

    resultsEl.appendChild(card);
  });
}

function likeVariation(index) {
  saveFeedback("like", currentVariations[index]);
  alert("Saved as liked.");
}

function dislikeVariation(index) {
  saveFeedback("dislike", currentVariations[index]);
  alert("Saved as disliked.");
}

function getTopLiked(field) {
  const feedback = getFeedbackData().filter(item => item.type === "like");
  const counts = {};

  feedback.forEach(item => {
    const value = item[field];
    if (!value) return;
    counts[value] = (counts[value] || 0) + 1;
  });

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return sorted.slice(0, 3);
}

function renderTasteProfile() {
  const existing = document.getElementById("taste-profile");
  if (!existing) return;

  const feedback = getFeedbackData();
  const likes = feedback.filter(item => item.type === "like").length;
  const dislikes = feedback.filter(item => item.type === "dislike").length;

  const topThemes = getTopLiked("theme");
  const topStyles = getTopLiked("artStyle");
  const topSubjects = getTopLiked("subject");

  existing.innerHTML = `
    <h3>taste profile</h3>
    <p><strong>Liked:</strong> ${likes}</p>
    <p><strong>Disliked:</strong> ${dislikes}</p>
    <p><strong>Top themes:</strong> ${topThemes.length ? topThemes.map(([v]) => v).join(", ") : "None yet"}</p>
    <p><strong>Top art styles:</strong> ${topStyles.length ? topStyles.map(([v]) => v).join(", ") : "None yet"}</p>
    <p><strong>Top subjects:</strong> ${topSubjects.length ? topSubjects.map(([v]) => v).join(", ") : "None yet"}</p>
  `;
}

async function generateDesign(index) {
  const variation = currentVariations[index];
  const preview = document.getElementById(`image-preview-${index}`);

  preview.innerHTML = `<div class="image-placeholder">Generating design...</div>`;

  try {
    const response = await fetch(WORKER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prompt: variation.artPrompt
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }

    const blob = await response.blob();
    const imageUrl = URL.createObjectURL(blob);

    currentVariations[index].imageUrl = imageUrl;

    preview.innerHTML = `
      <img src="${imageUrl}" alt="${variation.title}" class="generated-image" />
    `;
  } catch (error) {
    preview.innerHTML = `
      <div class="image-placeholder">Something went wrong while generating the image.</div>
    `;
    console.error(error);
  }
}

function getCurrentSelections(randomizeAll = false) {
  let theme = resolveSelectedValue("theme", themeOptions);
  let vibe = resolveSelectedValue("vibe", vibeOptions);
  let designType = resolveSelectedValue("designType", designTypeOptions);
  let product = resolveSelectedValue("product", productOptions);

  if (randomizeAll) {
    theme = randomItem(themeOptions);
    vibe = randomItem(vibeOptions);
    designType = randomItem(designTypeOptions);
    product = randomItem(productOptions);

    document.getElementById("theme").value = theme;
    document.getElementById("vibe").value = vibe;
    document.getElementById("designType").value = designType;
    document.getElementById("product").value = product;
  }

  return {
    theme,
    vibe,
    designType,
    product
  };
}

function runGenerator(randomizeAll = false) {
  const selected = getCurrentSelections(randomizeAll);
  const count = Math.max(1, Math.min(12, Number(document.getElementById("count").value) || 4));

  currentVariations = generateVariations({
    theme: selected.theme,
    vibe: selected.vibe,
    designType: selected.designType,
    product: selected.product,
    count
  });

  renderResults(currentVariations);
  renderTasteProfile();
}

document.getElementById("generateBtn").addEventListener("click", () => runGenerator(false));
document.getElementById("randomizeBtn").addEventListener("click", () => runGenerator(true));

runGenerator(false);
