console.log("studymaterial.js loaded");

const API_URL = "https://studymaterial-1heb.onrender.com/api/materials";

document.addEventListener("DOMContentLoaded", () => {
  fetch(API_URL)
    .then(res => {
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      return res.json();
    })
    .then(data => renderStudyMaterial(data))
    .catch(err => {
      console.error("[studymaterial.js] Failed to load:", err);
      const container = document.getElementById("studyMaterialContainer");
      if (container) {
        container.innerHTML = `
          <div class="col-12 text-center">
            <p style="color:#aaa;">
              ⚠️ Failed to load materials. Server may be waking up — please refresh in 30 seconds.
            </p>
            <button onclick="location.reload()" class="btn btn-primary mt-2">Retry</button>
          </div>`;
      }
    });
});

function renderStudyMaterial(materials) {
  const container = document.getElementById("studyMaterialContainer");
  if (!container) return;

  container.innerHTML = "";

  if (!materials.length) {
    container.innerHTML = `<div class="col-12 text-center"><p style="color:#aaa;">No materials available yet.</p></div>`;
    return;
  }

  materials.forEach(item => {
    // ── Format date safely ──────────────────────
    let formattedDate = "";
    if (item.date) {
      const d = new Date(item.date);
      if (!isNaN(d)) {
        const day   = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        formattedDate = `${day}-${month}-${d.getFullYear()}`;
      } else {
        // date stored as "05-01-2026" string — use as-is
        formattedDate = item.date;
      }
    }

    // ── Build card using your original CSS classes ──
    // ✅ Uses blog-entry, block-20, zoom-effect — exactly like before
    // ✅ Only addition: download count <p> and tracking via addEventListener
    const col = document.createElement("div");
    col.className = "col-md-4 justify-content-center";

    col.innerHTML = `
      <div class="blog-entry justify-content-end">

        <a href="${item.pdfUrl}" target="_blank" rel="noopener noreferrer"
           class="block-20 zoom-effect"
           style="background-image: url('${item.imageUrl}');">
        </a>

        <div class="text mt-3 float-right d-block">
          <h2 class="heading">
            <a href="${item.pdfUrl}" target="_blank" rel="noopener noreferrer">
              ${item.title}
            </a>
          </h2>
          <h5 class="category">${item.category || "Practice Material"}</h5>
          <h5 class="type">${item.type || "PDF Download"}</h5>
          <h5 class="date">${formattedDate}</h5>

          <p>${item.description || ""}</p>

          <!-- ✅ NEW: download count display -->
          <p class="download-count"
             id="dl-count-${item._id}"
             style="color:#ffbd39; font-weight:600; font-size:0.85rem; margin-bottom:8px;">
            ⬇️ ${item.downloads ?? 0} downloads
          </p>

          <!-- Download button — uses addEventListener so we can track clicks -->
          <a href="${item.pdfUrl}"
             target="_blank"
             rel="noopener noreferrer"
             class="btn btn-primary mt-2 dl-btn"
             data-id="${item._id}">
            Download PDF
          </a>
        </div>

      </div>
    `;

    container.appendChild(col);

    // ✅ Attach click listener AFTER the element is in the DOM
    // PDF still opens instantly (no preventDefault) — tracking fires in background
    const btn = col.querySelector(".dl-btn");
    if (btn) {
      btn.addEventListener("click", () => {
        fetch(`https://studymaterial-1heb.onrender.com/api/materials/${item._id}/download`, {
          method: "POST"
        })
          .then(res => res.json())
          .then(data => {
            const countEl = document.getElementById(`dl-count-${item._id}`);
            if (countEl) {
              countEl.textContent = `⬇️ ${data.downloads} downloads`;
            }
          })
          .catch(() => {}); // Silent — non-critical
      });
    }
  });
}