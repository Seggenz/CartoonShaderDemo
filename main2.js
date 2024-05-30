import * as THREE from 'three';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/jsm/controls/OrbitControls.js';
import { OutlinePass } from 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/jsm/postprocessing/OutlinePass.js';
import { EffectComposer } from 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/jsm/postprocessing/RenderPass.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/jsm/loaders/GLTFLoader.js';



const vertexShader = `
varying vec3 vColor;

void main() {
    vColor = color; // Przekazujemy oryginalny kolor
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
varying vec3 vColor;

void main() {
    vec3 color = vColor; // Zachowujemy oryginalny kolor

    // Docienienie
    //float threshold = 0.3; // Graniczna wartość dla efektu docienienia
    //float brightness = dot(color.rgb, vec3(0.2126, 0.7152, 0.0722)); // Konwertujemy do odcieni szarości

    // Manipulacja jasnością (docienienie)
    //color.rgb = mix(color.rgb, vec3(0.0), brightness); // Mieszamy kolor z czarnym proporcjonalnie do jasności

    gl_FragColor = vec4(color, 1.0); // Ustawienie koloru fragmentu
}
`;

const material = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color() } // Deklaracja uniform przechowującego kolor obiektu
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader
});

const loader = new GLTFLoader();
let model;

loader.load('monkey2.glb', (gltf) => {
    gltf.scene.traverse((child) => {
        if (child.isMesh && child.material instanceof THREE.MeshStandardMaterial) {
            // Wyodrębnienie koloru z oryginalnego materiału
            //const color = child.material.color.clone();
            // Przekazanie koloru jako uniform do materiału ShaderMaterial
            //material.uniforms.uColor.value.copy(color);
            // Przekazanie koloru do atrybutu "vColor" w shaderze
            //child.material = material;
        }
    });

    model = gltf.scene;
    scene.add(model);

    // Dodanie modelu do OutlinePass
    outlinePass.selectedObjects = [model];
    console.log('Model załadowany i dodany do OutlinePass:', model);
}, undefined, (error) => {
    console.error('Błąd podczas ładowania modelu:', error);
});

// Inicjalizacja sceny, kamery i renderera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Dodanie tła
const textureLoader = new THREE.TextureLoader();
textureLoader.load('background-borderlands.jpg', function(texture) {
    scene.background = texture;
});

// Dodanie kontroli orbity
const controls = new OrbitControls(camera, renderer.domElement);

// Dodanie światła kierunkowego
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5).normalize();
scene.add(directionalLight);

// Konfiguracja EffectComposer do post-processingu
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);
/*
// Dodanie efektu toon-shading do modelu GLTF
const loader = new GLTFLoader();
let model;
loader.load('monkey2.glb', (gltf) => {
    gltf.scene.traverse((child) => {
        if (child.isMesh) {
            const color = child.material.color;
            child.material = material;
        }
    });
    model = gltf.scene;
    scene.add(model);

    // Dodanie modelu do OutlinePass
    outlinePass.selectedObjects = [model];
    console.log('Model załadowany i dodany do OutlinePass:', model);
}, undefined, (error) => {
    console.error('Błąd podczas ładowania modelu:', error);
});
*/
camera.position.z = 5;

// Dodanie efektu konturów
const outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
//outlinePass.renderToScreen = true;
//outlinePass.model = model;
outlinePass.edgeStrength = 20.0;
outlinePass.edgeThickness = 2.0;
outlinePass.edgeGlow = 0.0;
outlinePass.visibleEdgeColor.set(0x000000);
outlinePass.hiddenEdgeColor.set(0x000000);
outlinePass.overlayMaterial.blending = THREE.CustomBlending
composer.addPass(outlinePass);





window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    composer.setSize(width, height);
});

// Funkcja animacji
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    composer.render(scene, camera);
}

animate();