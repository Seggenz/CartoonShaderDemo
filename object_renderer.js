
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
        this.textureLoader.load('./images/background-borderlands.jpg', (texture) => {
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
                if (child.isMesh && child.material instanceof THREE.MeshStandardMaterial) {

                    const thickness = 0.01;
                    const material = new THREE.ShaderMaterial({
                        vertexShader: /* glsl */`
                            void main() {
                                vec3 newPosition = position + normal * ${thickness};
                                gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1);
                            }
                        `,
                        fragmentShader: /* glsl */`
                            void main() {
                                gl_FragColor = vec4(0,0,0,1);
                            }
                        `,
                        side: THREE.BackSide
                    });
                    
                    const outline = new THREE.Mesh(child.geometry, material);
                    child.add(outline);
                    
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


