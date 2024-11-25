import Level from "./level.js";

export default class Mountain extends Level {
    constructor() {
        super('./public/models/ExplorableWorld/HeightMap.png', 3);
        this.checkpoints = [];
        this.boxCollisions = [];
        this.sphereCollisions = [];
        this.debug = false;
        this.init();
    }

    init() {
        this.world.createCircularBoundary(280, 550);
        this.createCollisions();
    }

    createCollisions() {
        this.boxCollisions.push(this.world.createCollisionBox({"x": 6.2,"y": 4.9372707880269315,"z": -110.0334329288603}, { x: 13, y: 10, z: 13 }));
        this.boxCollisions.push(this.world.createCollisionBox({x: 136.62140242236944, y: 5.599449208327485, z: -127.15821633347028}, { x: 5, y: 40, z: 5 }));
        this.boxCollisions.push(this.world.createCollisionBox({x: -5.1870007955174, y: 4.561825609827594, z: 31.152166453351775}, { x: 5, y: 40, z: 5 }));
        this.boxCollisions.push(this.world.createCollisionBox({x: -47.8623677963893, y: 5.822080560621296, z: 115.21677575863987}, { x: 5, y: 40, z: 5 }));
        this.boxCollisions.push(this.world.createCollisionBox({x: -74.73829441984853, y: 5.291627542406271, z: 181.14158196476154}, { x: 5, y: 40, z: 5 }));
        this.boxCollisions.push(this.world.createCollisionBox({x: 45.123445789152754, y: 5.431243041252743, z: 201.63848809539274}, { x: 5, y: 40, z: 5 }));
        this.boxCollisions.push(this.world.createCollisionBox({x: -89.78908279468568, y: 5.11380720351876, z: -27.194039983997666}, { x: 5, y: 40, z: 5 }));
        this.boxCollisions.push(this.world.createCollisionBox({x: -146.11492570828443, y: 5.748670566345535, z: 21.12338102531103}, { x: 5, y: 40, z: 5 }));
        this.boxCollisions.push(this.world.createCollisionBox({x: -156.7903739985355, y: 5.217900092375368, z: -171.68675204561688}, { x: 5, y: 40, z: 5 }));
        this.boxCollisions.push(this.world.createCollisionBox({x: -109.38029355609636, y: 5.4244226043474235, z: -203.21313139979569}, { x: 60, y: 40, z: 30 }));
        this.boxCollisions.push(this.world.createCollisionBox({x: 109.98175210426733, y: 5.690256907931303, z: 128.11983454885507}, { x: 70, y: 40, z: 60 }));
        this.boxCollisions.push(this.world.createCollisionBox({x: 207.25270367024885, y: 4.937425986886087, z: -30.898426715194717}, { x: 70, y: 40, z: 85 }));
        this.boxCollisions.push(this.world.createCollisionBox({x: -182.17790336262024, y: 5.431896993375609, z: -55.53200377930554}, { x: 70, y: 40, z: 85 }));
        this.boxCollisions.push(this.world.createCollisionBox({x: -150.99334490088916, y: 6.526017637872581, z: 105.5175096843312}, { x: 70, y: 40, z: 100 }));
        this.boxCollisions.push(this.world.createCollisionBox( {x: 97.11742520427866, y: 5.208714819559401, z: -215.2601877590978}, { x: 80, y: 40, z: 100 }));
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