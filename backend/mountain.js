import Level from "./level.js";

export default class Mountain extends Level {
    constructor() {
        super('./public/models/ExplorableWorld/HeightMap.png', 3);
        this.checkpoints = [];
        this.boxCollisions = [];
        this.sphereCollisions = [];
        this.debug = true;
        this.init();
    }

    init() {
        this.world.createCircularBoundary(280, 550);
        this.createCollisions();
    }

    createCollisions() {
        this.boxCollisions.push(this.world.createCollisionBox({ x: 0, y: 0, z: 0 }, { x: 20, y: 1, z: 20 }));
        this.sphereCollisions.push(this.world.createCollisionSphere({ x: -227.28408848883032, y: 1.9336560325685157, z: 11.197025432804969 }, 5));
    }

    getBoxCollisionsJson() {
        return this.boxCollisions.map((boxCollision) => {
            return {
                position: boxCollision.position,
                size: {x: boxCollision.shapes[0].halfExtents.x * 2, y: boxCollision.shapes[0].halfExtents.y * 2, z: boxCollision.shapes[0].halfExtents.z * 2} 
            }
        });
    }

    getSphereCollisionsJson() {
        return this.sphereCollisions.map((sphereCollision) => {
            return {
                position: sphereCollision.position,
                radius: sphereCollision.shapes[0].radius
            }
        });
    }

    getDebugInfo() {
        return {
            boxCollisions: this.getBoxCollisionsJson(),
            sphereCollisions: this.getSphereCollisionsJson()
        }
    }


}