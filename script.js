const canvas = document.querySelector("#hero-canvas");
const header = document.querySelector(".site-header");
const year = document.querySelector("#year");
const ctx = canvas.getContext("2d");

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
  ctx.fillStyle = "#f7f3ec";
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
        ctx.strokeStyle = `rgba(31, 138, 138, ${0.22 - distance / 780})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(point.x, point.y);
        ctx.lineTo(next.x, next.y);
        ctx.stroke();
      }
    }

    ctx.fillStyle = i % 3 === 0 ? "#d95d39" : i % 3 === 1 ? "#1f8a8a" : "#c28a20";
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
