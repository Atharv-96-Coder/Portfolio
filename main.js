import * as THREE from "three";

import { landing } from "./landing.js";

gsap.registerPlugin(ScrollTrigger);
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

const landingScene = landing(scene, camera, renderer);
const scrollContainer = document.body;
const snapSections = [...document.querySelectorAll('section')];
let activeSectionIndex = 0;
let snapLocked = false;
let currentTextureIndex = -1;

const moon = new Audio('/fx/moon.mp3');
moon.preload = 'auto';
moon.volume = 1;

const underWater = new Audio('/fx/underwater.mp3');
underWater.preload = 'auto';
underWater.volume = 0.9;

const whale = new Audio('/fx/whale.mp3');
whale.preload = 'auto';
whale.volume = 0.7;

const hovers = new Audio('/fx/hover.wav')
hovers.preload = 'auto';
hovers.volume = 1;

const node = document.querySelector('.active');

const scrolls = document.querySelector('.scrolls');

const label = scrolls.querySelectorAll('.label');


setTimeout(() => {
    scrolls.classList.add('show-scroll');
}, 1000);

function getScrollTop() {
    return scrollContainer.scrollTop || document.documentElement.scrollTop || window.scrollY || 0;
};

let lastSection = -1;

function updateScrollState() {
    const scrollY = getScrollTop();
    const sectionIndex = THREE.MathUtils.clamp(
        Math.round(scrollY / window.innerHeight),
        0,
        snapSections.length - 1
    );

    activeSectionIndex = sectionIndex;

    if (currentTextureIndex !== sectionIndex) {
        currentTextureIndex = sectionIndex;
        landingScene.setSectionTexture(sectionIndex);
    }

    if (lastSection === activeSectionIndex) {
        return;
    }

    lastSection = activeSectionIndex;

    label.forEach(lbl => {
        lbl.classList.remove('label-node');
    });

    switch (activeSectionIndex) {

        case 0:
            gsap.to(node, {
                y: 100,
                duration: 1,
                ease: "sine.inOut",
            });
            moon.currentTime = 0;
            moon.play();
            label[0].classList.add('label-node');
            break;

        case 1:
            gsap.to(node, {
                y: 200,
                duration: 1,
                ease: "sine.inOut"
            });

            label[1].classList.add('label-node');


            const case1 = gsap.timeline();
            case1.to(landingScene.bloomPass, {
                strength: 8.3,
                duration: 1.5
            }, 0)
                .to(
                    landingScene.bloomPass,
                    {
                        strength: 0.5,
                        duration: 1.5
                    }, 0.3)

            break;

        case 2:
            gsap.to(node, {
                y: 300,
                duration: 1,
                ease: "sine.inOut"

            });

            label[2].classList.add('label-node');
            if (window.innerWidth <= 950) {
                return;
            } else {

                var case2 = gsap.timeline()
                case2.to(landingScene.bloomPass, {
                    strength: 20.2,
                    duration: 2.25,
                    ease: "power2.out"
                })

                    .to(landingScene.bloomPass, {
                        strength: 0.30,
                        duration: 1.2,
                        ease: "power2.out"
                    });
            }
            whale.currentTime = 0;
            whale.play()


            break;

        case 3:
            gsap.to(node, {
                y: 400,
                duration: 1,
                ease: "sine.inOut"

            });
            label[3].classList.add('label-node');

            if (window.innerWidth <= 950) {
                return;
            } else {

                var case3 = gsap.timeline()
                case3.to(landingScene.bloomPass, {
                    strength: 30.2,
                    duration: 2,
                    ease: "power2.out"
                })
                    .to(landingScene.bloomPass, {
                        strength: 0.60,
                        duration: 1.2,
                        ease: "power2.out"
                    });
            }
            setTimeout(() => {

                underWater.currentTime = 0;
                underWater.play();
            }, 5000)

            break;

    }

    if (window.innerWidth >= 911) {
        landingScene.setSectionTexture(sectionIndex);
    }
}

const know = document.querySelector('.know-more');
know.addEventListener('click', (e) => {
    window.location.href = 'loader.html?next=404.html'
})

const scrollCue = document.querySelector('.scroll-cue');

function glowEffect() {

    scrollCue.classList.add("scroll-cue-glow");

    setTimeout(() => {
        scrollCue.classList.remove("scroll-cue-glow");
    }, 2500);
}

setTimeout(() => {
    glowEffect();
}, 20000);

setTimeout(() => {
    glowEffect();
}, 30000);

setTimeout(() => {
    glowEffect();
}, 45000);

const hoverAbout = document.querySelector('.hero-link');
hoverAbout.addEventListener('mouseover', (e) => {
    hovers.currentTime = 0;
    hovers.play();
})

const knowAbout = document.querySelector('.know-more');
knowAbout.addEventListener('mouseover', (e) => {
    hovers.currentTime = 0;
    hovers.play();
})

const cv = document.querySelector('.cv');
cv.addEventListener('mouseover', (e) => {
    hovers.currentTime = 0;
    hovers.play();
})

const btn = document.querySelector('.btn');
btn.addEventListener('mouseover', (e) => {
    hovers.currentTime = 0;
    hovers.play();
})

const glow = document.querySelector(".glow");
const brand = document.querySelector(".brand");

// brand.addEventListener('mouseover',(e) => {
//    setTimeout(() => {
//     brand.classList.add("active-glow")
//    },3000)
//     brand.classList.remove("active-glow")
// })

setTimeout(() => {
    document
        .querySelector(".brand")
        .classList.add("active");
}, 5500);


const tl = gsap.timeline();

tl.to(glow, {
    delay: 5,
    opacity: 0,
})

tl.to(glow, {
    opacity: 0.4,
    rotation: 7200,
    duration: 3,
    ease: "expo.inOut"
})

    .to(glow, {
        x: 290,
        opacity: 0.8,
        duration: 6,
        ease: "sin.inOut",
        onStart: () => {
            brand.classList.add("active-glow")
        },
        onComplete: () => {
            brand.classList.remove("active-glow")
        },
    })

    .to(glow, {
        rotation: 180,
        opacity: 0,
        duration: 1,
        ease: "none"
    });

window.addEventListener('scroll', updateScrollState, { passive: true });
scrollContainer.addEventListener('scroll', updateScrollState, { passive: true });

setTimeout(() => {
    updateScrollState();
}, 3000);

function snapToSection(index) {
    activeSectionIndex = THREE.MathUtils.clamp(index, 0, snapSections.length - 1);
    scrollContainer.scrollTo({
        top: activeSectionIndex * window.innerHeight,
        behavior: 'smooth'
    });
}

const menu = document.querySelector('.menu');
menu.addEventListener('click', (e) => {
    menu.classList.toggle("open");
})

window.addEventListener('wheel', (event) => {
    if (window.matchMedia('(max-width: 914px)').matches) return;
    if (Math.abs(event.deltaY) < 10 || snapLocked) return;

    const direction = event.deltaY > 0 ? 1 : -1;
    const nextSectionIndex = activeSectionIndex + direction;

    if (nextSectionIndex < 0 || nextSectionIndex >= snapSections.length) {
        return;
    }

    event.preventDefault();
    snapLocked = true;
    snapToSection(nextSectionIndex);

    window.setTimeout(() => {
        snapLocked = false;
    }, 850);
}, { passive: false });


function animate() {
    requestAnimationFrame(animate);
    landingScene.updateLanding();
    landingScene.renderLanding();
}
animate();


window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    landingScene.resizeLanding();

});
