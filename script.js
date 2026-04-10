const WORKER_BASE = "https://design-generator-api.katefletcher32505.workers.dev";

let currentVariations = [];

const randomThemes = [
  "nature",
  "birdwatching",
  "cute birds",
  "wildflowers",
  "forest folklore",
  "romantic botanical",
  "surreal kitchen",
  "weird vintage domestic",
  "coastal nostalgia",
  "cowgirl western",
  "climate justice",
  "leftist",
  "anti-trump",
  "anti-fascist",
  "workers rights",
  "political satire",
  "protest symbolism",
  "feminine rage",
  "working class surrealism"
];

const randomTones = [
  "cute, artsy, handmade, clever",
  "hand-drawn, textured, playful, charming",
  "painterly, tactile, imperfect, warm",
  "witty, graphic, merchandise-friendly, clean",
  "retro, artsy, soft-edged, human-made",
  "bold, satirical, poster-like, not cheesy",
  "sweet but strange, cute, illustrated",
  "procreate-like, sticker-friendly, flat-ish, textured"
];

const randomStyleModes = [
  "cute sticker graphic",
  "artsy merch graphic",
  "retro graphic print",
  "protest poster graphic",
  "badge or emblem design",
  "hand-painted print asset"
];

const randomCanvasFormats = ["square", "portrait", "landscape"];
const randomCounts = [2, 3, 4, 5];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
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
    tone: variation.tone,
    styleMode: variation.styleMode,
    canvasFormat: variation.canvasFormat,
    concept: variation.concept,
    slogan: variation.slogan,
    artStyle: variation.artStyle,
    palette: variation.palette,
    composition: variation.composition,
    imagePrompt: variation.imagePrompt
  });

  saveFeedbackData(feedback);
  renderTasteProfile();
}

function likeVariation(index) {
  saveFeedback("like", currentVariations[index]);
  alert("Saved as liked.");
}

function dislikeVariation(index) {
  saveFeedback("dislike", currentVariations[index]);
  alert("Saved as disliked.");
}

function getLikedTraits() {
  return getFeedbackData()
    .filter(item => item.type === "like")
    .slice(-8)
    .map(item => ({
      concept: item.concept,
      slogan: item.slogan,
      artStyle: item.artStyle,
      palette: item.palette,
      composition: item.composition,
      styleMode: item.styleMode,
      canvasFormat: item.canvasFormat
    }));
}

function getDislikedTraits() {
  return getFeedbackData()
    .filter(item => item.type === "dislike")
    .slice(-8)
    .map(item => ({
      concept: item.concept,
      slogan: item.slogan,
      artStyle: item.artStyle,
      palette: item.palette,
      composition: item.composition,
      styleMode: item.styleMode,
      canvasFormat: item.canvasFormat
    }));
}

function renderTasteProfile() {
  const existing = document.getElementById("taste-profile");
  if (!existing) return;

  const feedback = getFeedbackData();
  const likes = feedback.filter(item => item.type === "like").length;
  const dislikes = feedback.filter(item => item.type === "dislike").length;

  existing.innerHTML = `
    <h3>taste profile</h3>
    <p><strong>Liked:</strong> ${likes}</p>
    <p><strong>Disliked:</strong> ${dislikes}</p>
    <p>This will gradually influence future ideas.</p>
  `;
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 30000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

function buildFormatInstruction(canvasFormat) {
  if (canvasFormat === "square") {
    return "Compose the design cleanly inside a square canvas with strong balance and even spacing.";
  }
  if (canvasFormat === "portrait") {
    return "Compose the design vertically for a portrait canvas with strong top-to-bottom balance.";
  }
  if (canvasFormat === "landscape") {
    return "Compose the design horizontally for a landscape canvas with a wide balanced layout.";
  }
  return "Compose the design in a clean balanced way.";
}

async function generateConcept(theme, tone, styleMode, canvasFormat) {
  const strongerTone = `
${tone},
${styleMode},
cute artsy graphic design,
merchandise-friendly,
sticker-friendly,
handmade,
textured,
painterly,
imperfect,
playful,
clean silhouette,
usable as isolated design asset,
not a scenic illustration,
not cinematic concept art,
not fantasy wallpaper,
not a realistic environment,
not glossy,
not plastic,
not stock-vector corporate style
  `.trim();

  const response = await fetchWithTimeout(`${WORKER_BASE}/concept`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      theme,
      tone: strongerTone,
      styleMode,
      canvasFormat,
      likes: getLikedTraits(),
      dislikes: getDislikedTraits()
    })
  }, 30000);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText);
  }

  const concept = await response.json();
  const formatInstruction = buildFormatInstruction(canvasFormat);

  concept.imagePrompt = `
${concept.imagePrompt || ""}

Visual direction:
cute artsy graphic design asset,
sticker-style or merch-style illustration,
hand-drawn feel,
procreate-like,
textured but clean,
bold readable silhouette,
centered composition,
simple graphic asset,
not a full scene,
not a landscape painting,
not fantasy forest wallpaper,
not cinematic environment art.

Shape rules:
${formatInstruction}

Final output rules:
isolated design only,
plain or transparent background,
no mockup,
no product photo,
no poster-on-wall preview,
no realistic photography,
no glossy 3D rendering,
no stock-vector corporate style,
no readable text,
no gibberish text,
keep important elements fully inside the chosen format,
make it look usable for stickers, shirts, totes, or prints.
  `.trim();

  return concept;
}

async function generateVariationsFromAI() {
  const resultsEl = document.getElementById("results");
  resultsEl.innerHTML = `<div class="card"><p>Generating fresh concepts...</p></div>`;

  const theme = document.getElementById("theme").value.trim() || "nature";
  const tone = document.getElementById("tone").value.trim() || "cute, artsy, handmade, clever";
  const styleMode = document.getElementById("styleMode").value;
  const canvasFormat = document.getElementById("canvasFormat").value;
  const count = Math.max(1, Math.min(6, Number(document.getElementById("count").value) || 4));

  try {
    const concepts = [];

    for (let i = 0; i < count; i++) {
      const concept = await generateConcept(theme, tone, styleMode, canvasFormat);

      concepts.push({
        id: i + 1,
        theme,
        tone,
        styleMode,
        canvasFormat,
        concept: concept.concept || "",
        slogan: concept.slogan || "",
        artStyle: concept.artStyle || "",
        palette: concept.palette || "",
        composition: concept.composition || "",
        imagePrompt: concept.imagePrompt || "",
        description: concept.description || "",
        imageUrl: null
      });
    }

    currentVariations = concepts;
    renderResults(currentVariations);
    renderTasteProfile();
  } catch (error) {
    resultsEl.innerHTML = `
      <div class="card">
        <p><strong>Concept generation failed.</strong></p>
        <p>${String(error.message || error)}</p>
      </div>
    `;
    console.error(error);
  }
}

function renderResults(items) {
  const resultsEl = document.getElementById("results");
  resultsEl.innerHTML = "";

  items.forEach((item, index) => {
    const card = document.createElement("article");
    card.className = "card";

    card.innerHTML = `
      <h3>Variation ${item.id}</h3>
      <div class="meta">${item.artStyle || "concept-generated style"}</div>

      <div class="button-row">
        <button class="generate-design-btn" onclick="generateDesign(${index})">
          Generate This Design
        </button>
      </div>

      <div class="image-preview image-preview-${item.canvasFormat}" id="image-preview-${index}">
        ${
          item.imageUrl
            ? `<img src="${item.imageUrl}" alt="${item.concept}" class="generated-image" />`
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
        <div class="block-title">Style Mode</div>
        <p>${item.styleMode}</p>
      </div>

      <div class="block">
        <div class="block-title">Canvas Format</div>
        <p>${item.canvasFormat}</p>
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
        <div class="block-title">Palette</div>
        <p>${item.palette}</p>
      </div>

      <div class="block">
        <div class="block-title">Composition</div>
        <p>${item.composition}</p>
      </div>

      <div class="block">
        <div class="block-title">Image Prompt</div>
        <p>${item.imagePrompt}</p>
      </div>

      <div class="block">
        <div class="block-title">Description</div>
        <p>${item.description}</p>
      </div>
    `;

    resultsEl.appendChild(card);
  });
}

async function generateDesign(index) {
  const variation = currentVariations[index];
  const preview = document.getElementById(`image-preview-${index}`);

  preview.innerHTML = `<div class="image-placeholder">Generating design...</div>`;

  if (!variation.imagePrompt || !variation.imagePrompt.trim()) {
    preview.innerHTML = `<div class="image-placeholder">This variation has no valid image prompt yet.</div>`;
    return;
  }

  try {
    const response = await fetchWithTimeout(`${WORKER_BASE}/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prompt: variation.imagePrompt
      })
    }, 45000);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }

    const blob = await response.blob();
    const imageUrl = URL.createObjectURL(blob);

    currentVariations[index].imageUrl = imageUrl;

    preview.innerHTML = `
      <img src="${imageUrl}" alt="${variation.concept}" class="generated-image" />
    `;
  } catch (error) {
    preview.innerHTML = `
      <div class="image-placeholder">Image generation failed: ${String(error.message || error)}</div>
    `;
    console.error(error);
  }
}

function randomizeControls() {
  document.getElementById("theme").value = randomItem(randomThemes);
  document.getElementById("tone").value = randomItem(randomTones);
  document.getElementById("styleMode").value = randomItem(randomStyleModes);
  document.getElementById("count").value = randomItem(randomCounts);
  document.getElementById("canvasFormat").value = randomItem(randomCanvasFormats);
}

document.getElementById("randomizeControlsBtn").addEventListener("click", randomizeControls);
document.getElementById("generateBtn").addEventListener("click", generateVariationsFromAI);

renderTasteProfile();
