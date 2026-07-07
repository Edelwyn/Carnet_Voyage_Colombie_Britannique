gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function initRouteMap() {
    const path = document.getElementById("routePath");
    const glow = document.getElementById("routeGlow");
    if (!path) return;

    const len = path.getTotalLength();
    [path, glow].forEach(p => {
        p.style.strokeDasharray = len;
        p.style.strokeDashoffset = prefersReducedMotion ? 0 : len;
    });

    const markers = gsap.utils.toArray(".route-marker");

    const markerProgress = markers.map(m => {
        const x = parseFloat(m.dataset.cx);
        const y = parseFloat(m.dataset.cy);
        let best = 0, bestDist = Infinity;
        const steps = 300;
        for (let i = 0; i <= steps; i++) {
            const l = (len * i) / steps;
            const p = path.getPointAtLength(l);
            const d = Math.hypot(p.x - x, p.y - y);
            if (d < bestDist) { bestDist = d; best = i / steps; }
        }
        return best;
    });

    if (prefersReducedMotion) {
        markers.forEach(m => m.classList.add("visible"));
        return;
    }

    gsap.to([path, glow], {
        strokeDashoffset: 0,
        ease: "none",
        scrollTrigger: {
            trigger: "#itineraire",
            start: "top 80%",
            end: "bottom 30%",
            scrub: 0.5,
            onUpdate: self => {
                markers.forEach((m, i) => {
                    m.classList.toggle("visible", self.progress >= markerProgress[i] - 0.01);
                });
            }
        }
    });
}


function initScrapNoteEntrances() {
    gsap.utils.toArray(".scrap-note").forEach(note => {
        const computed = getComputedStyle(note).transform;
        let angle = 0;
        if (computed && computed !== "none") {
            const matrix = new DOMMatrixReadOnly(computed);
            angle = Math.atan2(matrix.b, matrix.a) * (180 / Math.PI);
        }

        const rect = note.getBoundingClientRect();
        const fromLeft = (rect.left + rect.width / 2) < window.innerWidth / 2;
        const xStart = fromLeft ? -260 : 260;

        gsap.fromTo(note,
            {
                x: xStart,
                y: -50,
                opacity: 0,
                rotate: angle + (fromLeft ? -7 : 7)
            },
            {
                x: 0,
                y: 0,
                opacity: 1,
                rotate: angle,
                duration: 1.1,
                ease: "back.out(1.5)",
                scrollTrigger: {
                    trigger: note,
                    start: "top 85%",
                    toggleActions: "play none none reverse"
                }
            }
        );
    });
}

document.addEventListener("DOMContentLoaded", () => {
    initRouteMap();
    if (!prefersReducedMotion) initScrapNoteEntrances();
});