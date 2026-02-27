/*********************************
 * CONFIG
 *********************************/
const API_BASE = "https://studymaterial-1heb.onrender.com/api";

/*********************************
 * LOAD & RENDER STUDY MATERIALS
 *********************************/
(function loadStudyMaterials() {
  const container = document.getElementById("studyMaterialContainer");

  // ── Guard: container must exist on this page ──
  if (!container) {
    console.warn("[studymaterial.js] #studyMaterialContainer not found on this page.");
    return;
  }

  // ── Show loading spinner ──────────────────────
  container.innerHTML = `
    <div class="col-12 text-center" style="padding: 60px 0;">
      <div style="
        display: inline-block;
        width: 48px; height: 48px;
        border: 5px solid #333;
        border-top-color: #ffbd39;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      "></div>
      <p style="color:#aaa; margin-top:16px;">Loading materials…</p>
      <style>@keyframes spin { to { transform: rotate(360deg); } }</style>
    </div>
  `;

  fetch(`${API_BASE}/materials`)
    .then(res => {
      console.log("[studymaterial.js] API response status:", res.status);
      if (!res.ok) throw new Error(`API returned ${res.status}`);
      return res.json();
    })
    .then(materials => {
      console.log("[studymaterial.js] Materials received:", materials);

      container.innerHTML = "";

      if (!Array.isArray(materials) || materials.length === 0) {
        container.innerHTML = `
          <div class="col-12 text-center" style="padding:60px 0;">
            <p style="color:#aaa; font-size:1rem;">No materials available yet. Check back soon!</p>
          </div>`;
        return;
      }

      materials.forEach(material => {
        const col = document.createElement("div");
        col.className = "col-md-4 d-flex ftco-animate";
        col.style.marginBottom = "30px";

        // ── Card ─────────────────────────────────
        const card = document.createElement("div");
        card.style.cssText = `
          background: #111827;
          border-radius: 12px;
          overflow: hidden;
          width: 100%;
          display: flex;
          flex-direction: column;
          box-shadow: 0 4px 20px rgba(0,0,0,0.4);
        `;

        // ── Image ─────────────────────────────────
        if (material.imageUrl) {
          const imgLink = document.createElement("a");
          imgLink.href   = material.pdfUrl || "#";
          imgLink.target = "_blank";
          imgLink.rel    = "noopener noreferrer";
          imgLink.style.cssText = "display:block; overflow:hidden; flex-shrink:0;";

          const img = document.createElement("img");
          img.src   = material.imageUrl;
          img.alt   = material.title;
          img.style.cssText = `
            width: 100%;
            height: 200px;
            object-fit: cover;
            display: block;
            transition: transform 0.3s ease;
          `;
          img.addEventListener("mouseover", () => img.style.transform = "scale(1.05)");
          img.addEventListener("mouseout",  () => img.style.transform = "scale(1)");
          img.onerror = () => { imgLink.style.display = "none"; };

          imgLink.appendChild(img);
          card.appendChild(imgLink);
        }

        // ── Body ──────────────────────────────────
        const body = document.createElement("div");
        body.style.cssText = "padding: 20px; display:flex; flex-direction:column; flex:1;";

        // Title
        const title = document.createElement("h3");
        title.textContent = material.title;
        title.style.cssText = "color:#fff; font-size:1.05rem; font-weight:700; margin-bottom:10px; line-height:1.4;";

        // Category
        const cat = document.createElement("p");
        cat.textContent = material.category || "Practice Material";
        cat.style.cssText = "color:#ccc; font-size:0.88rem; font-weight:600; margin:3px 0;";

        // Type
        const type = document.createElement("p");
        type.textContent = material.type || "PDF Download";
        type.style.cssText = "color:#ccc; font-size:0.88rem; font-weight:600; margin:3px 0;";

        // Date
        const date = document.createElement("p");
        date.textContent = material.date || "";
        date.style.cssText = "color:#ccc; font-size:0.88rem; margin:3px 0 10px;";

        // Description
        const desc = document.createElement("p");
        desc.textContent = material.description || "";
        desc.style.cssText = "color:#aaa; font-size:0.85rem; margin-bottom:14px; flex:1;";

        // Download count
        const dlCount = document.createElement("p");
        dlCount.id = `dl-count-${material._id}`;
        dlCount.textContent = `⬇️ ${material.downloads ?? 0} downloads`;
        dlCount.style.cssText = "color:#ffbd39; font-size:0.82rem; margin-bottom:14px; font-weight:600;";

        // Download button
        const btn = document.createElement("a");
        btn.href        = material.pdfUrl || "#";
        btn.target      = "_blank";
        btn.rel         = "noopener noreferrer";
        btn.textContent = "DOWNLOAD PDF";
        btn.style.cssText = `
          display: inline-block;
          background: #ffbd39;
          color: #000;
          font-weight: 700;
          font-size: 0.82rem;
          letter-spacing: 1px;
          padding: 10px 20px;
          border-radius: 4px;
          text-decoration: none;
          text-align: center;
          transition: background 0.2s ease;
          align-self: flex-start;
        `;
        btn.addEventListener("mouseover", () => btn.style.background = "#e6a800");
        btn.addEventListener("mouseout",  () => btn.style.background = "#ffbd39");

        // ── Track download count on click ──────────
        btn.addEventListener("click", () => {
          fetch(`${API_BASE}/materials/${material._id}/download`, { method: "POST" })
            .then(res => res.json())
            .then(data => {
              const el = document.getElementById(`dl-count-${material._id}`);
              if (el) el.textContent = `⬇️ ${data.downloads} downloads`;
            })
            .catch(err => console.warn("[studymaterial.js] Download count error:", err));
        });

        body.append(title, cat, type, date, desc, dlCount, btn);
        card.appendChild(body);
        col.appendChild(card);
        container.appendChild(col);
      });
    })
    .catch(err => {
      console.error("[studymaterial.js] Failed to load materials:", err);
      container.innerHTML = `
        <div class="col-12 text-center" style="padding:60px 0;">
          <p style="color:#e74c3c; font-size:1rem;">
            ⚠️ Failed to load materials.<br>
            <span style="color:#aaa; font-size:0.85rem;">
              The server may be starting up (can take ~30s on free tier). Please refresh the page.
            </span>
          </p>
          <button
            onclick="location.reload()"
            style="margin-top:16px; background:#ffbd39; border:none; color:#000;
                   font-weight:700; padding:10px 24px; border-radius:4px; cursor:pointer;">
            Retry
          </button>
        </div>`;
    });
})();