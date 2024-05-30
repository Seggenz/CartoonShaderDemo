/*
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
//import { OrbitControls } from './OrbitControls.js';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
*/

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class ObjectRenderer {
    constructor() {
        console.log('Initializing ObjectRenderer...');
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        this.textureLoader = new THREE.TextureLoader();
        this.textureLoader.load('background-borderlands.jpg', (texture) => {
            //console.log('Background texture loaded');
            this.scene.background = texture;
        });

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        this.directionalLight.position.set(5, 5, 5).normalize();
        this.scene.add(this.directionalLight);

        this.composer = new EffectComposer(this.renderer);
        this.renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(this.renderPass);

        this.camera.position.z = 5;

        this.outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), this.scene, this.camera);
        this.outlinePass.edgeStrength = 20.0;
        this.outlinePass.edgeThickness = 2.0;
        this.outlinePass.edgeGlow = 0.0;
        this.outlinePass.visibleEdgeColor.set(0x000000);
        this.outlinePass.hiddenEdgeColor.set(0x000000);
        this.outlinePass.overlayMaterial.blending = THREE.CustomBlending;
        this.composer.addPass(this.outlinePass);

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
        loader.load(modelPath, (gltf) => {
            gltf.scene.traverse((child) => {
                if (child.isMesh && child.material instanceof THREE.MeshStandardMaterial) {
                    /*
                    const vertexShader = `
                        varying vec3 vColor;
                        void main() {
                            vColor = color;
                            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                        }
                    `;
                    const fragmentShader = `
                        varying vec3 vColor;
                        void main() {
                            vec3 color = vColor;
                            gl_FragColor = vec4(color, 1.0);
                        }
                    `;
                    
                    const material = new THREE.ShaderMaterial({
                        transparent: true,
                        vertexShader: vertexShader,
                        fragmentShader: fragmentShader,
                        uniforms: {
                            uColor: { value: new THREE.Color() }
                        }
                    });

                    const color = child.material.color.clone();
                    material.uniforms.uColor.value.copy(color);
                    child.material = material;
                    */
                }
            });

            this.scene.add(gltf.scene);
            this.outlinePass.selectedObjects = [gltf.scene];
            console.log('Model loaded and added to OutlinePass:', gltf.scene);
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

