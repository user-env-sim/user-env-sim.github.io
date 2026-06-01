const canvas = document.querySelector("#hero-canvas");
const header = document.querySelector(".site-header");
const year = document.querySelector("#year");
const ctx = canvas.getContext("2d");
const css = getComputedStyle(document.documentElement);
const colorToken = (name) => css.getPropertyValue(name).trim();
const rgbaToken = (name, alpha) => {
  const hex = colorToken(name).replace("#", "");
  const value = hex.length === 3
    ? hex.split("").map((channel) => channel + channel).join("")
    : hex;
  const red = parseInt(value.slice(0, 2), 16);
  const green = parseInt(value.slice(2, 4), 16);
  const blue = parseInt(value.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
};

let width = 0;
let height = 0;
let points = [];
let pointer = { x: 0, y: 0, active: false };
let animationFrame = 0;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

year.textContent = new Date().getFullYear();

function resizeCanvas() {
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  width = canvas.offsetWidth;
  height = canvas.offsetHeight;
  canvas.width = Math.floor(width * pixelRatio);
  canvas.height = Math.floor(height * pixelRatio);
  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

  const count = Math.max(34, Math.floor((width * height) / 19000));
  points = Array.from({ length: count }, (_, index) => ({
    x: (index * 97) % width,
    y: (index * 131) % height,
    vx: (Math.random() - 0.5) * 0.32,
    vy: (Math.random() - 0.5) * 0.32,
    radius: 2 + Math.random() * 3,
  }));
}

function draw() {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = colorToken("--color-surface-soft");
  ctx.fillRect(0, 0, width, height);

  for (let i = 0; i < points.length; i += 1) {
    const point = points[i];

    if (!prefersReducedMotion) {
      point.x += point.vx;
      point.y += point.vy;

      if (point.x < 0 || point.x > width) point.vx *= -1;
      if (point.y < 0 || point.y > height) point.vy *= -1;
    }

    const pointerDistance = Math.hypot(point.x - pointer.x, point.y - pointer.y);
    if (pointer.active && pointerDistance < 150) {
      const force = (150 - pointerDistance) / 150;
      point.x += (point.x - pointer.x) * force * 0.012;
      point.y += (point.y - pointer.y) * force * 0.012;
    }

    for (let j = i + 1; j < points.length; j += 1) {
      const next = points[j];
      const distance = Math.hypot(point.x - next.x, point.y - next.y);

      if (distance < 150) {
        ctx.strokeStyle = rgbaToken("--color-slate-teal", 0.22 - distance / 780);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(point.x, point.y);
        ctx.lineTo(next.x, next.y);
        ctx.stroke();
      }
    }

    ctx.fillStyle = i % 3 === 0
      ? colorToken("--color-warm-red")
      : i % 3 === 1
        ? colorToken("--color-slate-teal")
        : colorToken("--color-soft-gold");
    ctx.beginPath();
    ctx.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  if (!prefersReducedMotion) {
    animationFrame = requestAnimationFrame(draw);
  }
}

function updateHeader() {
  header.dataset.elevated = window.scrollY > 12 ? "true" : "false";
}

window.addEventListener("resize", () => {
  cancelAnimationFrame(animationFrame);
  resizeCanvas();
  draw();
});

window.addEventListener("scroll", updateHeader, { passive: true });

window.addEventListener("pointermove", (event) => {
  pointer = { x: event.clientX, y: event.clientY, active: true };
});

window.addEventListener("pointerleave", () => {
  pointer.active = false;
});

resizeCanvas();
updateHeader();
draw();
