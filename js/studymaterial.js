
console.log("studymaterial.js loaded");

const API_URL = "https://studymaterial-1heb.onrender.com/api/materials";


document.addEventListener("DOMContentLoaded", () => {
  fetch(API_URL)
    .then(res => res.json())
    .then(data => renderStudyMaterial(data))
    .catch(err => console.error(err));
});

function renderStudyMaterial(materials) {
  const container = document.getElementById("studyMaterialContainer");
  container.innerHTML = "";

  materials.forEach(item => {
    container.innerHTML += `
      <div class="col-md-4 justify-content-center">
        <div class="blog-entry justify-content-end">
          
          <a href="${item.pdfUrl}" target="_blank"
             class="block-20 zoom-effect"
             style="background-image: url('${item.imageUrl}');">
          </a>

          <div class="text mt-3 float-right d-block">
            <h2 class="heading">
              <a href="${item.pdfUrl}" target="_blank">
                ${item.title}
              </a>
            </h2>
            <h5 class="category">${item.category}</h5>
            <h5 class="type">${item.type}</h5>
            <h5 class="date">
            ${(() => {
                const d = new Date(item.date);
                const day = String(d.getDate()).padStart(2, '0');
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const year = d.getFullYear();
                return `${day}-${month}-${year}`;
            })()}
            </h5>

            <p>${item.description}</p>

            <a href="${item.pdfUrl}" target="_blank"
               class="btn btn-primary mt-2">
               Download PDF
            </a>
          </div>

        </div>
      </div>
    `;
  });
}
