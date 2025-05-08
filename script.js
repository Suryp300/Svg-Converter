const fileInput = document.getElementById("fileInput");
const svgDisplay = document.getElementById("svgDisplay");
const exportBtn = document.getElementById("exportBtn");
const resetBtn = document.getElementById("resetBtn");
const toggleBgBtn = document.getElementById("toggleBgBtn");
const colorInput = document.getElementById("colorInput");
const logoInput = document.getElementById("logoInput");
const formatSelect = document.getElementById("exportFormat");
const ratioSelect = document.getElementById("ratioSelect");

let currentSvg = null;
let bgWhite = true;

fileInput.addEventListener("change", function () {
  const reader = new FileReader();
  reader.onload = function (e) {
    svgDisplay.innerHTML = e.target.result;
    currentSvg = svgDisplay.querySelector("svg");
    cleanSVG();
    applyAspectRatio(ratioSelect.value);
  };
  reader.readAsText(this.files[0]);
});

colorInput.addEventListener("input", function () {
  if (currentSvg) {
    applyColorToSVG(currentSvg, this.value);
  }
});

toggleBgBtn.addEventListener("click", () => {
  bgWhite = !bgWhite;
  svgDisplay.style.backgroundColor = bgWhite ? "#fff" : "transparent";
});

resetBtn.addEventListener("click", () => {
  svgDisplay.innerHTML = "";
  fileInput.value = "";
  currentSvg = null;
});

ratioSelect.addEventListener("change", function () {
  applyAspectRatio(this.value);
});

logoInput.addEventListener("change", function () {
  const reader = new FileReader();
  reader.onload = function (e) {
    const img = document.createElement("img");
    img.src = e.target.result;
    img.style.position = "absolute";
    img.style.bottom = "10px";
    img.style.right = "10px";
    img.style.width = "50px";
    img.style.height = "auto";
    svgDisplay.appendChild(img);
  };
  reader.readAsDataURL(this.files[0]);
});

exportBtn.addEventListener("click", () => {
  if (!currentSvg) return;

  const format = formatSelect.value;
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(currentSvg);

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const img = new Image();
  const width = currentSvg.viewBox.baseVal.width || 1024;
  const height = currentSvg.viewBox.baseVal.height || 1024;
  canvas.width = width;
  canvas.height = height;

  img.onload = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = bgWhite ? "#fff" : "transparent";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    if (format === "pdf") {
      const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [canvas.width, canvas.height] });
      pdf.addImage(canvas.toDataURL("image/jpeg"), "JPEG", 0, 0, canvas.width, canvas.height);
      pdf.save("export.pdf");
    } else {
      const link = document.createElement("a");
      link.download = `export.${format}`;
      link.href = canvas.toDataURL(`image/${format}`);
      link.click();
    }
  };

  const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  img.src = url;
});

// Helper Functions
function applyColorToSVG(svg, color) {
  const targets = svg.querySelectorAll("path, rect, circle, ellipse, polygon, polyline, line, text");
  targets.forEach(el => {
    if (el.hasAttribute("fill") && el.getAttribute("fill") !== "none") {
      el.setAttribute("fill", color);
    }
    if (el.hasAttribute("stroke")) {
      el.setAttribute("stroke", color);
    }
  });
}

function cleanSVG() {
  const rects = currentSvg.querySelectorAll("rect");
  rects.forEach(r => {
    const fill = r.getAttribute("fill");
    if (fill === "#ffffff" || fill === "#fff" || fill === "white") {
      r.remove();
    }       
  });
}

function applyAspectRatio(ratio) {
  if (!svgDisplay) return;
  let [w, h] = ratio.split(":").map(Number);
  svgDisplay.style.aspectRatio = `${w} / ${h}`;
}   