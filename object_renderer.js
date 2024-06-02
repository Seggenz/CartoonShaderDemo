import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MMDLoader } from 'three/examples/jsm/loaders/MMDLoader.js';

export class ObjectRenderer {
    constructor() {
        console.log('Initializing ObjectRenderer...');
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        this.textureLoader = new THREE.TextureLoader();
        this.textureLoader.load('./images/background.jpg', (texture) => {
            this.scene.background = texture;
        });

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);

        // Add ambient light
        this.ambientLight = new THREE.AmbientLight(0x404040); // soft white light
        this.scene.add(this.ambientLight);

        // Add a directional light
        this.directionalLight1 = new THREE.DirectionalLight(0xffffff, 1);
        this.directionalLight1.position.set(5, 5, 5).normalize();
        this.scene.add(this.directionalLight1);

        // Add a second directional light
        this.directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
        this.directionalLight2.position.set(-5, -5, -5).normalize();
        this.scene.add(this.directionalLight2);

        this.composer = new EffectComposer(this.renderer);
        this.renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(this.renderPass);

        this.camera.position.z = 5;

        this.currentModel = null;

        window.addEventListener('resize', () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(width, height);
            this.composer.setSize(width, height);
        });
    }

    renderObject(modelPath) {
        const loader = new GLTFLoader();
        if (this.currentModel) {
            this.scene.remove(this.currentModel);
        }
        loader.load(modelPath, (gltf) => {
            gltf.scene.traverse((child) => {
                if (child.isMesh) {
                    if (child.material instanceof THREE.MeshStandardMaterial) {
                        if (child.material.map) {
                            child.material.map.needsUpdate = true;
                        }
                        if (child.material.normalMap) {
                            child.material.normalMap.needsUpdate = true;
                        }
                        if (child.material.roughnessMap) {
                            child.material.roughnessMap.needsUpdate = true;
                        }
                        if (child.material.metalnessMap) {
                            child.material.metalnessMap.needsUpdate = true;
                        }
                        child.material.needsUpdate = true;

                        // Create gradient texture
                        const canvas = document.createElement('canvas');
                        canvas.width = 256;
                        canvas.height = 1;
                        const context = canvas.getContext('2d');
                        const gradient = context.createLinearGradient(0, 0, 256, 0);
                        gradient.addColorStop(0, '#000000');
                        gradient.addColorStop(0.2, '#555555');
                        gradient.addColorStop(0.4, '#aaaaaa');
                        gradient.addColorStop(0.6, '#ffffff');
                        gradient.addColorStop(1, '#ffffff');
                        context.fillStyle = gradient;
                        context.fillRect(0, 0, 256, 1);
                        const gradientTexture = new THREE.CanvasTexture(canvas);

                        // Store original color
                        const originalColor = new THREE.Color();
                        if (child.material.color) {
                            originalColor.copy(child.material.color);
                        } else {
                            originalColor.set(0xffffff); // Default color
                        }

                        // Define shader
                        const toonShader = {
                            uniforms: {
                                uTexture: { value: gradientTexture },
                                uColor: { value: originalColor },
                                uMap: { value: child.material.map || null },
                                hasTexture: { value: !!child.material.map }
                            },
                            vertexShader: `
                                varying vec3 vNormal;
                                varying vec2 vUv;
                                void main() {
                                    vNormal = normalize(normalMatrix * normal);
                                    vUv = uv;
                                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                                }
                            `,
                            fragmentShader: `
                                uniform sampler2D uTexture;
                                uniform vec3 uColor;
                                uniform sampler2D uMap;
                                uniform bool hasTexture;
                                varying vec3 vNormal;
                                varying vec2 vUv;
                                void main() {
                                    float intensity = dot(vNormal, vec3(0.0, 0.0, 1.0));
                                    vec4 gradientColor = texture2D(uTexture, vec2(intensity, 0.0));
                                    vec4 mapColor = hasTexture ? texture2D(uMap, vUv) : vec4(1.0);
                                    gl_FragColor = vec4(uColor * gradientColor.rgb * mapColor.rgb, 1.0);
                                }
                            `,
                            side: THREE.DoubleSide
                        };

                        const toonMaterial = new THREE.ShaderMaterial(toonShader);
                        const outlineMaterial = new THREE.ShaderMaterial({
                            vertexShader: `
                                void main() {
                                    vec3 newPosition = position + normal * 0.01;
                                    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
                                }
                            `,
                            fragmentShader: `
                                void main() {
                                    gl_FragColor = vec4(0, 0, 0, 1);
                                }
                            `,
                            side: THREE.BackSide
                        });

                        const outline = new THREE.Mesh(child.geometry, outlineMaterial);
                        child.add(outline);
                        child.material = toonMaterial;
                    }
                }
            });
            this.currentModel = gltf.scene;
            this.scene.add(gltf.scene);
        }, undefined, (error) => {
            console.error('Error loading model:', error);
        });
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        this.controls.update();
        this.composer.render();
    }
}

export default ObjectRenderer;
