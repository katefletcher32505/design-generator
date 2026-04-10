const WORKER_BASE = "https://design-generator-api.katefletcher32505.workers.dev";

let currentVariations = [];

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
  const feedback = getFeedbackData().filter(item => item.type === "like");
  return feedback.slice(-10).map(item => ({
    concept: item.concept,
    slogan: item.slogan,
    artStyle: item.artStyle,
    palette: item.palette,
    composition: item.composition
  }));
}

function getDislikedTraits() {
  const feedback = getFeedbackData().filter(item => item.type === "dislike");
  return feedback.slice(-10).map(item => ({
    concept: item.concept,
    slogan: item.slogan,
    artStyle: item.artStyle,
    palette: item.palette,
    composition: item.composition
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

async function generateConcept(theme, tone) {
  const response = await fetch(`${WORKER_BASE}/concept`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      theme,
      tone,
      likes: getLikedTraits(),
      dislikes: getDislikedTraits()
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText);
  }

  return await response.json();
}

async function generateVariationsFromAI() {
  const resultsEl = document.getElementById("results");
  resultsEl.innerHTML = `<div class="card"><p>Generating fresh concepts...</p></div>`;

  const theme = document.getElementById("theme").value.trim() || "nature";
  const tone = document.getElementById("tone").value.trim() || "smart, original, visually cohesive";
  const count = Math.max(1, Math.min(8, Number(document.getElementById("count").value) || 4));

  try {
    const concepts = [];

    for (let i = 0; i < count; i++) {
      const concept = await generateConcept(theme, tone);
      concepts.push({
        id: i + 1,
        theme,
        tone,
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
        <p>Something went wrong while generating concepts.</p>
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

      <div class="image-preview" id="image-preview-${index}">
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
    const response = await fetch(`${WORKER_BASE}/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prompt: variation.imagePrompt
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
      <img src="${imageUrl}" alt="${variation.concept}" class="generated-image" />
    `;
  } catch (error) {
    preview.innerHTML = `
      <div class="image-placeholder">Something went wrong while generating the image.</div>
    `;
    console.error(error);
  }
}

document.getElementById("generateBtn").addEventListener("click", generateVariationsFromAI);
document.getElementById("randomizeBtn").addEventListener("click", generateVariationsFromAI);

renderTasteProfile();
generateVariationsFromAI();
