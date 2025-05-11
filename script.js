let canvas = document.getElementById("editorCanvas");
let ctx = canvas.getContext("2d");
let currentImage = null;

function triggerUpload() {
  document.getElementById("fileInput").click();
}

function handleFile(file) {
  const reader = new FileReader();
  reader.onload = function (e) {
    const img = new Image();
    img.onload = function () {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      currentImage = img;
      if (document.getElementById("smartMode").checked) generateAIContent();
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// Aspect Ratio Logic
function changeAspect(ratio) {
  if (ratio === "custom") {
    document.getElementById("customRatio").style.display = "block";
  } else {
    let [w, h] = ratio.split(":").map(Number);
    resizeCanvasByRatio(w, h);
    document.getElementById("customRatio").style.display = "none";
  }
}

function applyCustomRatio() {
  let w = parseInt(document.getElementById("widthRatio").value);
  let h = parseInt(document.getElementById("heightRatio").value);
  if (w > 0 && h > 0) resizeCanvasByRatio(w, h);
}

function resizeCanvasByRatio(w, h) {
  if (!currentImage) return;
  const maxWidth = 800;
  let height = Math.floor((maxWidth * h) / w);
  canvas.width = maxWidth;
  canvas.height = height;
  ctx.drawImage(currentImage, 0, 0, maxWidth, height);
}

// Color Changer
function changeSVGColor(hex) {
  let svg = ctx.getImageData(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < svg.data.length; i += 4) {
    svg.data[i] = parseInt(hex.substr(1, 2), 16);     // R
    svg.data[i + 1] = parseInt(hex.substr(3, 2), 16); // G
    svg.data[i + 2] = parseInt(hex.substr(5, 2), 16); // B
  }
  ctx.putImageData(svg, 0, 0);
}

// Download Dropdown
function toggleDownload() {
  const options = document.getElementById("formatOptions");
  options.style.display = options.style.display === "block" ? "none" : "block";
}

function downloadImage(type) {
  let link = document.createElement("a");
  link.download = `image.${type}`;
  if (type === "pdf") {
    const pdf = new jsPDF();
    pdf.addImage(canvas.toDataURL("image/jpeg"), "JPEG", 0, 0);
    pdf.save("image.pdf");
  } else {
    link.href = canvas.toDataURL(`image/${type}`);
    link.click();
  }
}

// Dummy AI Content Generator
function generateAIContent() {
  alert("AI generated:\nCaption: A beautiful Paithani saree.\nAlt: Handwoven silk Paithani in vibrant hues.");
}

function openEditor() {
  alert("Editor coming soon: crop, filters, erase, add text.");
}

function exportImage() {
  downloadImage("jpg");
}
