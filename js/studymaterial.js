/*********************************
 * CONFIG
 *********************************/
const API_BASE = "https://studymaterial-1heb.onrender.com/api";

/*********************************
 * LOAD & RENDER STUDY MATERIALS
 *********************************/
(function loadStudyMaterials() {
  const container = document.getElementById("studyMaterialContainer");
  if (!container) return;

  container.innerHTML = `<div class="col-12 text-center"><p>Loading materials…</p></div>`;

  fetch(`${API_BASE}/materials`)
    .then(res => {
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      return res.json();
    })
    .then(materials => {
      container.innerHTML = "";

      if (!materials.length) {
        container.innerHTML = `<div class="col-12 text-center"><p>No materials available yet.</p></div>`;
        return;
      }

      materials.forEach(material => {
        const col = document.createElement("div");
        col.className = "col-md-4 d-flex ftco-animate";

        // ── Card wrapper ──────────────────────────────
        const card = document.createElement("div");
        card.className = "blog-entry align-self-stretch";
        card.style.cssText = "background:#1a1a2e; border-radius:12px; overflow:hidden; width:100%; margin-bottom:30px;";

        // ── Image ─────────────────────────────────────
        if (material.imageUrl) {
          const imgWrapper = document.createElement("a");
          imgWrapper.href = material.pdfUrl || "#";
          imgWrapper.target = "_blank";
          imgWrapper.rel = "noopener noreferrer";
          imgWrapper.style.cssText = "display:block; overflow:hidden;";

          const img = document.createElement("img");
          img.src = material.imageUrl;
          img.alt = material.title;         // ✅ textContent equivalent for alt
          img.style.cssText = "width:100%; height:220px; object-fit:cover; transition:transform 0.3s ease;";
          img.addEventListener("mouseover", () => img.style.transform = "scale(1.05)");
          img.addEventListener("mouseout",  () => img.style.transform = "scale(1)");
          img.onerror = () => { imgWrapper.style.display = "none"; }; // Hide broken images

          imgWrapper.appendChild(img);
          card.appendChild(imgWrapper);
        }

        // ── Body ──────────────────────────────────────
        const body = document.createElement("div");
        body.style.cssText = "padding:20px;";

        // Title
        const title = document.createElement("h3");
        title.style.cssText = "color:#fff; font-size:1.1rem; font-weight:700; margin-bottom:10px;";
        title.textContent = material.title; // ✅ textContent, never innerHTML

        // Meta: category, type, date
        const metaCategory = makeMeta(material.category || "Practice Material");
        const metaType      = makeMeta(material.type     || "PDF Download");
        const metaDate      = makeMeta(material.date     || "");

        // Description
        const desc = document.createElement("p");
        desc.style.cssText = "color:#aaa; font-size:0.85rem; margin:10px 0 15px;";
        desc.textContent = material.description || "";

        // ── Download count display ─────────────────────
        const dlCount = document.createElement("p");
        dlCount.style.cssText = "color:#ffbd39; font-size:0.8rem; margin-bottom:12px;";
        dlCount.textContent = `⬇️ ${material.downloads ?? 0} downloads`;
        dlCount.id = `dl-count-${material._id}`; // So we can update it after click

        // ── Download button ───────────────────────────
        const btn = document.createElement("a");
        btn.href = material.pdfUrl || "#";
        btn.target = "_blank";
        btn.rel = "noopener noreferrer";
        btn.className = "btn btn-primary py-2 px-4";
        btn.style.cssText = "background:#ffbd39; border:none; color:#000; font-weight:600; font-size:0.85rem; letter-spacing:1px; border-radius:4px;";
        btn.textContent = "DOWNLOAD PDF";

        // ── Track download on click ───────────────────
        // Every click on the button fires a POST to increment the counter.
        // We use `fetch` in the background — the PDF still opens immediately
        // because we don't `preventDefault()`.
        btn.addEventListener("click", () => {
          fetch(`${API_BASE}/materials/${material._id}/download`, { method: "POST" })
            .then(res => res.json())
            .then(data => {
              // Update the count shown on the card without a page reload
              const countEl = document.getElementById(`dl-count-${material._id}`);
              if (countEl) {
                countEl.textContent = `⬇️ ${data.downloads} downloads`;
              }
            })
            .catch(() => {}); // Silent — download count is non-critical
        });

        body.append(title, metaCategory, metaType, metaDate, desc, dlCount, btn);
        card.appendChild(body);
        col.appendChild(card);
        container.appendChild(col);
      });
    })
    .catch(err => {
      console.error("Study materials load error:", err);
      container.innerHTML = `<div class="col-12 text-center"><p>Failed to load materials. Please try again later.</p></div>`;
    });
})();

/*********************************
 * HELPER – create a small meta line
 *********************************/
function makeMeta(text) {
  if (!text) return document.createDocumentFragment();
  const p = document.createElement("p");
  p.style.cssText = "color:#ccc; font-size:0.9rem; font-weight:600; margin:4px 0;";
  p.textContent = text;
  return p;
}