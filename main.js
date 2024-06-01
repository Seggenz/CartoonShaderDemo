console.log('main.js loaded');

import {ObjectRenderer} from './object_renderer.js';


console.log('Creating ObjectRenderer instance');
const objectRenderer = new ObjectRenderer();
console.log('Calling renderObject');
objectRenderer.renderObject('./models/skrzynia.glb');
console.log('Calling animate');
objectRenderer.animate();

document.getElementById('boxModelButton').addEventListener('click', () => {
  objectRenderer.renderObject('./models/skrzynia.glb');
});

document.getElementById('claptrapModelButton').addEventListener('click', () => {
  objectRenderer.renderObject('./models/claptrap2.glb');
});

document.getElementById('gunModelButton').addEventListener('click', () => {
  objectRenderer.renderObject('./models/glock.glb');
});