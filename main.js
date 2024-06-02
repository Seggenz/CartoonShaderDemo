  console.log('main.js loaded');

  import {ObjectRenderer} from './object_renderer.js';


  console.log('Creating ObjectRenderer instance');
  const objectRenderer = new ObjectRenderer();
  console.log('Calling renderObject');
  //objectRenderer.renderObject('./models/box2.glb');
  console.log('Calling animate');
  objectRenderer.animate();

  document.getElementById('boxModelButton').addEventListener('click', () => {
    objectRenderer.renderObject('./models/box.glb');
  });

  document.getElementById('claptrapModelButton').addEventListener('click', () => {
    objectRenderer.renderObject('./models/claptrap.glb');
  });

  document.getElementById('gunModelButton').addEventListener('click', () => {
    objectRenderer.renderObject('./models/gun.glb');
  });