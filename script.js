const WORKER_BASE = "https://design-generator-api.katefletcher32505.workers.dev";

let currentVariations = [];

const randomThemes = [
  "nature",
  "birdwatching",
  "forest folklore",
  "wildflowers and grief",
  "southern gothic nature",
  "climate justice",
  "leftist",
  "anti-trump",
  "anti-fascist",
  "workers rights",
  "political satire",
  "protest symbolism",
  "romantic botanical",
  "surreal kitchen",
  "weird vintage domestic",
  "cowgirl western",
  "coastal nostalgia",
  "ecological grief",
  "feminine rage",
  "working class surrealism"
];

const randomTones = [
  "smart, original, visually cohesive, handmade",
  "hand-painted, textured, imperfect, artistic",
  "painterly, tactile, soft edges, human-made",
  "satirical, sharp, poster-like, bold",
  "poetic, strange, intimate, handmade",
  "dry, witty, graphic, screenprint-inspired",
  "earthy, collage-like, tactile, illustrative",
  "vintage, whimsical, textured, imperfect",
  "sardonic, layered, political, visually bold",
  "folk-art inspired, painterly, warm, handmade"
];

const randomCounts = [2, 3, 4, 5, 6];
const randomCanvasFormats = ["square", "portrait", "landscape", "circle", "oval"];

function getFeedbackData() {
  return JSON.parse(localStorage.getItem("designFeedback") || "[]");
}

function saveFeedbackData(data) {
  localStorage.setItem("designFeedback", JSON.stringify(data));
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function saveFeedback(type, variation) {
  const feedback = getFeedbackData();

  feedback.push({
    type,
    timestamp: new Date().toISOString(),
    theme: variation.theme,
    tone: variation.tone,
    concept: variation.concept,
    slogan: variation.slogan,
    artStyle: variation.artStyle,
    palette: variation.palette,
    composition: variation.composition,
    imagePrompt: variation.imagePrompt,
    canvasFormat: variation.canvasFormat
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
    <p>Your future generations will gradually reflect this feedback more.</p>
  `;
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 30000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

function buildFormatInstruction(canvasFormat) {
  if (canvasFormat === "square") {
    return "Compose the design to fit cleanly inside a square canvas with balanced spacing on all sides.";
  }
  if (canvasFormat === "portrait") {
    return "Compose the design vertically for a portrait canvas, with strong top-to-bottom balance.";
  }
  if (canvasFormat === "landscape") {
    return "Compose the design horizontally for a landscape canvas, with a wide balanced layout.";
  }
  if (canvasFormat === "circle") {
    return "Compose the design so the important artwork stays centered and fits safely inside a circular boundary.";
  }
  if (canvasFormat === "oval") {
    return "Compose the design so the important artwork stays centered and fits safely inside an oval boundary, leaving breathing room at the edges.";
  }
  return "Compose the design in a clean balanced way.";
}

async function generateConcept(theme, tone, canvasFormat) {
  const strongerTone = `${tone}, handmade, textured, painterly, imperfect edges, visible brush texture, drawn feel, tactile, human-made, avoid glossy 3D rendering, avoid stock-vector look, avoid generic AI sheen`;

  const response = await fetchWithTimeout(`${WORKER_BASE}/concept`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      theme,
      tone: strongerTone,
      likes: getLikedTraits(),
      dislikes: getDislikedTraits(),
      canvasFormat
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
Style emphasis: handmade-looking, textured, painterly, imperfect edges, tactile illustration, visible brush or drawing texture, procreate-like or hand-rendered feel, not glossy, not plastic, not vector-clean, not mockup-like.
Format constraint: ${formatInstruction}
Final output rules: isolated design only, no mockup, no product photo, no shirt or poster preview, no readable text, no gibberish text, plain or transparent background.
`.trim();

  return concept;
}

async function generateVariationsFromAI() {
  const resultsEl = document.getElementById("results");
  resultsEl.innerHTML = `<div class="card"><p>Generating fresh concepts...</p></div>`;

  const theme = document.getElementById("theme").value.trim() || "nature";
  const tone = document.getElementById("tone").value.trim() || "smart, original, visually cohesive, handmade";
  const count = Math.max(1, Math.min(8, Number(document.getElementById("count").value) || 4));
  const canvasFormat = document.getElementById("canvasFormat").value;

  try {
    const concepts = [];

    for (let i = 0; i < count; i++) {
      const concept = await generateConcept(theme, tone, canvasFormat);

      concepts.push({
        id: i + 1,
        theme,
        tone,
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
  document.getElementById("count").value = randomItem(randomCounts);
  document.getElementById("canvasFormat").value = randomItem(randomCanvasFormats);
}

document.getElementById("randomizeControlsBtn").addEventListener("click", randomizeControls);
document.getElementById("generateBtn").addEventListener("click", generateVariationsFromAI);
document.getElementById("randomizeBtn").addEventListener("click", generateVariationsFromAI);

renderTasteProfile();
