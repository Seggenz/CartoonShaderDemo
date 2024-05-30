console.log('main.js loaded');

import {ObjectRenderer} from './object_renderer.js';


console.log('Creating ObjectRenderer instance');
const objectRenderer = new ObjectRenderer();
console.log('Calling renderObject');
objectRenderer.renderObject('monkey2.glb');
console.log('Calling animate');
objectRenderer.animate();