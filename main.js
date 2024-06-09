  console.log('main.js loaded');

  import {ObjectRenderer} from './object_renderer.js';


  console.log('Creating ObjectRenderer instance');
  const objectRenderer = new ObjectRenderer();
  console.log('Calling renderObject');
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

  document.getElementById('boxRawModelButton').addEventListener('click', () => {
    objectRenderer.renderObjectRaw('./models/box.glb');
  });

  document.getElementById('claptrapRawModelButton').addEventListener('click', () => {
    objectRenderer.renderObjectRaw('./models/claptrap.glb');
  });

  document.getElementById('gunRawModelButton').addEventListener('click', () => {
    objectRenderer.renderObjectRaw('./models/gun.glb');
  });