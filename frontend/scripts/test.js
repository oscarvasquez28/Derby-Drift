import * as THREE from 'three';
import { GlbModel } from './model.js';
import World from './level/world.js';

var world = new World('textures/heightmap.jpg', 0x005500, 3);
world.initWorld();

var dobeto = new GlbModel(world.scene, 'models/Dobeto/DobetoAnimations.glb', false);

dobeto.initModel().then((mesh) => {
    // mesh.position.y = 0;
    // mesh.position.x = 0;
    // mesh.position.z = 0;
    // mesh.scale.set(15, 15, 15);
    // mesh.rotation.y = -125 * Math.PI / 180;
});

const fps = 60;
const interval = 1000 / fps;
let lastTime = 0;

const animate = (time) => {
    if (time - lastTime >= interval) {
        lastTime = time;
        world.update();
        world.renderer.render(world.scene, world.camera);
        if (dobeto.isLoaded()) {
            dobeto.update(1 / fps);
        }
    }
    requestAnimationFrame(animate);
};

requestAnimationFrame(animate);