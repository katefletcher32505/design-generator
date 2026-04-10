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
  "block-print inspired artwork"
];

const graphicSubjects = [
  "sardine tin",
  "tomato cluster",
  "lemon branch",
  "bird on a teacup",
  "disco ball with flowers",
  "cowgirl boots",
  "mushroom trio",
  "garden rabbit",
  "olive jar",
  "strawberry bowl",
  "cat in a window",
  "sun and moon motif",
  "wildflowers in a vase",
  "handwritten starburst layout"
];

const sloganFragmentsA = [
  "emotionally",
  "slightly",
  "deeply",
  "romantically",
  "visually",
  "ethically",
  "chronically",
  "spiritually",
  "artistically",
  "mildly"
];

const sloganFragmentsB = [
  "unstable",
  "packed in oil",
  "overcommitted",
  "offline",
  "feral",
  "overwatered",
  "under-rested",
  "sunlit",
  "dramatic",
  "unbothered"
];

let currentVariations = [];

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

function buildTags(theme, vibe, product, concept) {
  const raw = [
    theme,
    vibe,
    product,
    concept,
    `${theme} design`,
    `${vibe} art`,
    `${product} design`,
    `hand painted ${theme}`,
    `illustrated ${product}`,
    `art print style`,
    `gift idea`,
    `indie aesthetic`,
    `maximalist art`,
    `retro inspired`,
    `whimsical design`
  ];

  const cleaned = raw
    .map((t) => slugify(t))
    .filter(Boolean)
    .filter((value, index, self) => self.indexOf(value) === index);

  return cleaned.slice(0, 15);
}

function generateVariations({ theme, vibe, designType, product, count }) {
  const results = [];

  for (let i = 0; i < count; i++) {
    const subject = randomItem(graphicSubjects);
    const artStyle = randomItem(artStyles);
    const slogan = `${randomItem(sloganFragmentsA)} ${randomItem(sloganFragmentsB)}`;

    let concept = "";
    let artPrompt = "";
    let sloganPrompt = "";
    let title = "";
    let description = "";

    if (designType === "graphic") {
      concept = `${theme} ${subject}`;
      artPrompt = `Create a ${artStyle} ${product} design featuring a ${subject}, inspired by ${theme}, with a ${vibe} mood. Transparent background. Cohesive composition. No mockup.`;
      sloganPrompt = "No slogan needed.";
      title = `${theme} ${subject} ${product} design`;
      description = `A ${vibe} ${product} concept featuring a ${subject} in a ${artStyle} style, inspired by ${theme}.`;
    }

    if (designType === "slogan") {
      concept = `${theme} text concept`;
      artPrompt = `Create a typography-only ${product} design inspired by ${theme} with a ${vibe} mood. Focus on lettering composition, hierarchy, and visual personality. No illustration.`;
      sloganPrompt = `Generate a short, original slogan for a ${theme} design with a ${vibe} tone.`;
      title = `${theme} slogan ${product}`;
      description = `A typography-led ${product} concept inspired by ${theme} with a ${vibe} tone.`;
    }

    if (designType === "graphic+slogan") {
      concept = `${theme} ${subject} with slogan`;
      artPrompt = `Create a ${artStyle} ${product} design featuring a ${subject}, inspired by ${theme}, with a ${vibe} mood. Leave room for a slogan. Transparent background.`;
      sloganPrompt = `Create a short slogan for a design about ${theme} with a ${vibe} mood. Example tone only, not exact wording: ${slogan}.`;
      title = `${theme} ${subject} slogan ${product}`;
      description = `A ${vibe} ${product} design pairing a ${subject} with a short slogan, rendered in a ${artStyle} style inspired by ${theme}.`;
    }

    if (designType === "pattern") {
      concept = `${theme} repeating pattern`;
      artPrompt = `Create a seamless repeating pattern for a ${product}, featuring ${subject} motifs inspired by ${theme}, with a ${vibe} mood, in a ${artStyle} style.`;
      sloganPrompt = "No slogan needed for pattern version.";
      title = `${theme} repeating pattern`;
      description = `A seamless pattern concept for ${product} inspired by ${theme}, with a ${vibe} feel and ${artStyle} styling.`;
    }

    const tags = buildTags(theme, vibe, product, concept);
    const mainTag = tags[0] || slugify(theme);

    results.push({
      id: i + 1,
      concept,
      artStyle,
      artPrompt,
      sloganPrompt,
      title,
      description,
      mainTag,
      tags,
      imageUrl: null
    });
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

      <div class="block">
        <div class="block-title">Concept</div>
        <p>${item.concept}</p>
      </div>

      <div class="block">
        <div class="block-title">Art Prompt</div>
        <p>${item.artPrompt}</p>
      </div>

      <div class="block">
        <div class="block-title">Slogan Prompt</div>
        <p>${item.sloganPrompt}</p>
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

async function generateDesign(index) {
  const variation = currentVariations[index];
  const preview = document.getElementById(`image-preview-${index}`);

  preview.innerHTML = `<div class="image-placeholder">Generating design...</div>`;

  try {
    const response = await fetch(
      "https://design-generator-api.katefletcher32505.workers.dev/generate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt: variation.artPrompt
        })
      }
    );

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

function runGenerator() {
  const theme = document.getElementById("theme").value.trim() || "retro kitchen";
  const vibe = document.getElementById("vibe").value.trim() || "witty feminine";
  const designType = document.getElementById("designType").value;
  const product = document.getElementById("product").value;
  const count = Math.max(1, Math.min(12, Number(document.getElementById("count").value) || 4));

  currentVariations = generateVariations({
    theme,
    vibe,
    designType,
    product,
    count
  });

  renderResults(currentVariations);
}

document.getElementById("generateBtn").addEventListener("click", runGenerator);

runGenerator();
