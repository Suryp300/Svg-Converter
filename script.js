let svgContent = null;
let bgWhite = true;

document.getElementById("fileInput").addEventListener("change", handleSVGUpload);
document.getElementById("colorInput").addEventListener("input", changeSVGColor);
document.getElementById("toggleBgBtn").addEventListener("click", toggleBackground);
document.getElementById("resetBtn").addEventListener("click", resetSVG);
document.getElementById("exportBtn").addEventListener("click", exportImage);
document.getElementById("logoInput").addEventListener("change", addLogo);
document.getElementById("ratioSelect").addEventListener("change", changeAspectRatio);

function handleSVGUpload(event) {
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.onload = () => {
    document.getElementById("svgDisplay").innerHTML = reader.result;
    svgContent = document.querySelector("#svgDisplay svg");
    cleanSVG();
  };
  reader.readAsText(file);
}

function cleanSVG() {
  if (svgContent) {
    svgContent.removeAttribute("width");
    svgContent.removeAttribute("height");
    svgContent.setAttribute("preserveAspectRatio", "xMidYMid meet");
  }
}

function changeSVGColor(e) {
  if (!svgContent) return;
  const color = e.target.value;
  svgContent.querySelectorAll("*").forEach(el => {
    if (el.getAttribute("fill") && el.getAttribute("fill") !== "none") {
      el.setAttribute("fill", color);
    }
    if (el.getAttribute("stroke") && el.getAttribute("stroke") !== "none") {
      el.setAttribute("stroke", color);
    }
  });
}

function toggleBackground() {
  const box = document.getElementById("svgDisplay");
  bgWhite = !bgWhite;
  box.style.background = bgWhite ? "#ffffff" : "transparent";
}

function resetSVG() {
  location.reload();
}

function exportImage() {
  if (!svgContent) return;
  const format = document.getElementById("exportFormat").value;
  const svgElement = svgContent.cloneNode(true);
  const svgData = new XMLSerializer().serializeToString(svgElement);
  const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);

  const canvas = document.createElement("canvas");
  const ratio = getAspectRatio(document.getElementById("ratioSelect").value);
  canvas.width = 1000;
  canvas.height = 1000 * ratio;

  const ctx = canvas.getContext("2d");
  const img = new Image();
  img.onload = () => {
    ctx.fillStyle = bgWhite ? "#fff" : "transparent";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    if (format === "jpg" || format === "png") {
      const type = format === "jpg" ? "image/jpeg" : "image/png";
      const dataURL = canvas.toDataURL(type);
      download(dataURL, `converted.${format}`);
    } else if (format === "pdf") {
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF();
      pdf.addImage(canvas.toDataURL("image/jpeg"), "JPEG", 10, 10, 190, 190 / ratio);
      pdf.save("converted.pdf");
    }
    URL.revokeObjectURL(url);
  };
  img.src = url;
}

function download(dataURL, name) {
  const a = document.createElement("a");
  a.href = dataURL;
  a.download = name;
  a.click();
}

function addLogo(event) {
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.onload = function () {
    const logo = document.createElement("img");
    logo.src = reader.result;
    logo.style.position = "absolute";
    logo.style.bottom = "10px";
    logo.style.right = "10px";
    logo.style.width = "60px";
    logo.style.opacity = "0.8";
    document.getElementById("svgDisplay").appendChild(logo);
  };
  reader.readAsDataURL(file);
}

function getAspectRatio(value) {
  const [w, h] = value.split(":").map(Number);
  return h / w;
}

function changeAspectRatio() {
  const value = document.getElementById("ratioSelect").value;
  const box = document.getElementById("svgDisplay");
  const [w, h] = value.split(":");
  box.style.aspectRatio = `${w} / ${h}`;
    }
