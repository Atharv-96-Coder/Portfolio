import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';

import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';

import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

import { RGBShiftShader } from 'three/examples/jsm/shaders/RGBShiftShader.js';

import { aboutSection } from './about.js';
import { skillsSection } from './skills.js';
import { contactSection } from './contact.js';

const introSection = {
    name: 'intro',
    texture: '/assets/intro.webp',
    mtexture: '/assets/mobileTexture.webp',
    bloom: 0.22,
    rgbShift: 0.0005,
    driftStrength: 1,
    rippleBase: 0.28,
    colorBoost: 1,
    tint: [0.06, 0.13, 0.18]
};

export function landing(scene, camera, renderer) {
    const sectionConfigs = [
        introSection,
        aboutSection,
        skillsSection,
        contactSection
    ];

    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);
    const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        0.32, // strength
        0.18, // radius
        0.9 // threshold
    );
    composer.addPass(bloomPass);

    const rgbShiftPass = new ShaderPass(RGBShiftShader);
    rgbShiftPass.uniforms['amount'].value = introSection.rgbShift;
    composer.addPass(rgbShiftPass);


    const textureLoader = new THREE.TextureLoader();
    const sectionTextures = sectionConfigs.map((section) => {


        const texture = textureLoader.load(window.innerWidth <= 911
            ? section.mtexture
            : section.texture);

        texture.wrapS = THREE.MirroredRepeatWrapping;
        texture.wrapT = THREE.MirroredRepeatWrapping;
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
        return texture;
    });

    const light = new THREE.DirectionalLight(0xffffff, 2);

    light.position.set(2, 2, 5);

    scene.add(light);

    const planeGeometry = new THREE.PlaneGeometry(16, 9);
    const shaderMaterial = new THREE.ShaderMaterial({
        uniforms: {
            uTexture: { value: sectionTextures[0] },
            uTime: { value: 0 },
            uMouse: { value: new THREE.Vector2(0.5, 0.5) },
            uRippleStrength: { value: 0 },
            uDriftStrength: { value: introSection.driftStrength },
            uColorBoost: { value: introSection.colorBoost },
            uTint: { value: new THREE.Vector3(...introSection.tint) }

        },

    vertexShader: `
    varying vec2 vUv;  
    void main(){
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`,

    fragmentShader: `

    uniform sampler2D uTexture;
    uniform vec2 uMouse;
    uniform float uTime;
    uniform float uRippleStrength;
    uniform float uDriftStrength;
    uniform float uColorBoost;
    uniform vec3 uTint;
    varying vec2 vUv;

    void main(){

    vec2 uv = vUv;

    vec2 driftUv = uv;
    driftUv.x += sin(uv.y * 2.8 + uTime * 0.22) * 0.010 * uDriftStrength;
    driftUv.y += cos(uv.x * 4.4 + uTime * 0.18) * 0.007 * uDriftStrength;
    driftUv += vec2(
      sin(uTime * 0.055) * 0.012,
      cos(uTime * 0.045) * 0.008
    ) * uDriftStrength;

    vec2 dir = driftUv - uMouse;
    float dist = length(dir);
    vec2 rippleDir = dir / max(dist, 0.001);

    float softMask = smoothstep(0.40, 0.0, dist) * uRippleStrength;
    float wave1 = sin(dist * 95.0 - uTime * 5.5);
    float wave2 = sin(dist * 48.0 - uTime * 3.2);
    float ripple = (wave1 * 0.65 + wave2 * 0.35) * softMask;
 
    float lens = (1.0 - smoothstep(0.0, 0.22, dist)) * uRippleStrength;
    driftUv += rippleDir * ripple * 0.009;
    driftUv += rippleDir * lens * 0.009;

    vec2 redUv = driftUv + rippleDir * ripple * 0.0016;
    vec2 blueUv = driftUv - rippleDir * ripple * 0.0016;
    vec4 color;
    color.r = texture2D(uTexture, redUv).r;
    color.g = texture2D(uTexture, driftUv).g;
    color.b = texture2D(uTexture, blueUv).b;
    color.a = texture2D(uTexture, driftUv).a;

    float causticRing = smoothstep(0.018, 0.0, abs(fract(dist * 12.0 - uTime * 0.75) - 0.5)) * softMask;
    float cursorGlow = smoothstep(0.26, 0.0, dist) * uRippleStrength;
    color.rgb += uTint * cursorGlow * 0.55;
    color.rgb += (uTint + vec3(0.12, 0.25, 0.30)) * causticRing * 0.10;
    color.rgb = pow(color.rgb, vec3(0.88));
    color.rgb *= uColorBoost;
    color.rgb = clamp(color.rgb, 0.0, 1.0);

    gl_FragColor = color;

}
`
    })

    const btn = document.querySelector('.hero-link');
    btn.addEventListener('mouseenter', (e) => {

        gsap.to(shaderMaterial.uniforms.uColorBoost, {
            value: 2.5,
            delay: 0.2,
            duration: 0.4,
            ease: "none",
            onComplete: () => {
                gsap.to(shaderMaterial.uniforms.uColorBoost, {
                    value: 1.0,
                    duration: 1.0,
                    ease: "none"
                })
            }
        });

    })

    const btns = document.querySelector('.know-more');
    btns.addEventListener("mouseenter", () => {
        const tl = gsap.timeline();

        gsap.to(shaderMaterial.uniforms.uColorBoost, {
            value: 2.5,
            delay: 0.2,
            duration: 0.4,
            ease: "none",
            onComplete: () => {
                gsap.to(shaderMaterial.uniforms.uColorBoost, {
                    value: 1.1,
                    duration: 1.0,
                    ease: "none"
                })
            }
        });

    });

    const cv = document.querySelector('.cv');
    cv.addEventListener("mouseenter", () => {

        if (window.innerWidth <= 914) return;
        const tl = gsap.timeline();

        tl.to(shaderMaterial.uniforms.uColorBoost, {
            value: 2.5,
            duration: 0.4
        }, 0)

            .to(shaderMaterial.uniforms.uDriftStrength, {
                value: 2.2,
                duration: 0.4
            }, 0)

            .to(shaderMaterial.uniforms.uColorBoost, {
                value: 1.09,
                duration: 1
            })

            .to(shaderMaterial.uniforms.uDriftStrength, {
                value: 1.18,
                duration: 1
            }, "<");

    });
    const connect = document.querySelector('.btn');
    connect.addEventListener("mouseenter", () => {
        if (window.innerWidth <= 914) return;

        gsap.to(shaderMaterial.uniforms.uColorBoost, {
            value: 10.0,
            delay: 0.2,
            duration: 0.4,
            ease: "none",
            onComplete: () => {
                gsap.to(shaderMaterial.uniforms.uColorBoost, {
                    value: 1.09,
                    duration: 1.0,
                    ease: "none"
                })
            }
        });

    });

    const mouse = new THREE.Vector2(0.5, 0.5);
    const targetMouse = new THREE.Vector2(0.5, 0.5);
    let activeSection = introSection;

    window.addEventListener('mousemove', (e) => {
        targetMouse.x = e.clientX / window.innerWidth;
        targetMouse.y = 1 - e.clientY / window.innerHeight;
        shaderMaterial.uniforms.uRippleStrength.value = Math.min(
            shaderMaterial.uniforms.uRippleStrength.value + 0.42,
            0.86
        );
    });

    window.addEventListener('mouseleave', () => {
        shaderMaterial.uniforms.uRippleStrength.value = 0;
    });

    const material = new THREE.Mesh(planeGeometry, shaderMaterial);
    scene.add(material);

    const particlesCount = 500;
    const positions = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
        positions[i] = (Math.random() - 0.5) * 10;
    }

    const particlesGeometry = new THREE.BufferGeometry();
    particlesGeometry.setAttribute(
        'position', new THREE.BufferAttribute(positions, 3)
    )

    const particlesMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.03,
        map: new THREE.TextureLoader().load('assets/dot.png'),
        transparent: true,
        opacity: 1.3,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        alphaTest: 0.1,
    })

    const particles = new THREE.Points(
        particlesGeometry,
        particlesMaterial
    );

    scene.add(particles);

    camera.position.z = 5;

    function fitBackgroundPlane() {
        const distance = camera.position.z - material.position.z;
        const visibleHeight = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5)) * distance;
        const visibleWidth = visibleHeight * camera.aspect;
        const scale = Math.max(visibleWidth / 16, visibleHeight / 9) * 1.02;

        material.scale.set(scale, scale, 1);
    }

    function setSectionTexture(index) {
        const sectionIndex = THREE.MathUtils.clamp(index, 0, sectionTextures.length - 1);
        const texture = sectionTextures[sectionIndex];
        const section = sectionConfigs[sectionIndex];
        activeSection = section;

        if (shaderMaterial.uniforms.uTexture.value !== texture) {
            shaderMaterial.uniforms.uTexture.value = texture;
            shaderMaterial.uniforms.uRippleStrength.value = 0.56;
        }

        shaderMaterial.uniforms.uDriftStrength.value = section.driftStrength;
        shaderMaterial.uniforms.uColorBoost.value = section.colorBoost;
        shaderMaterial.uniforms.uTint.value.set(...section.tint);
        bloomPass.strength = section.bloom;
        rgbShiftPass.uniforms['amount'].value = section.rgbShift;
    }

    fitBackgroundPlane();

    function updateLanding() {

        shaderMaterial.uniforms.uTime.value += 0.016;
        shaderMaterial.uniforms.uRippleStrength.value = THREE.MathUtils.lerp(
            shaderMaterial.uniforms.uRippleStrength.value,
            activeSection.rippleBase,
            0.025
        );

        mouse.lerp(targetMouse, 0.05);
        material.position.y = camera.position.y;
        particles.position.y = camera.position.y;
        particles.rotation.y += 0.0005;
        particles.rotation.x += 0.0002;
        particles.rotation.z += 0.0002;
        shaderMaterial.uniforms.uMouse.value = mouse;
    }
    return {
        shaderMaterial,
        bloomPass,
        updateLanding,
        setSectionTexture,
        renderLanding: () => composer.render(),
        resizeLanding: () => {
            composer.setSize(window.innerWidth, window.innerHeight);
            bloomPass.setSize(window.innerWidth, window.innerHeight);
            fitBackgroundPlane();
        },

    }

}
