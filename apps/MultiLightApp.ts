import {
    Camera,
    MeshRenderer,
    PointLight,
    PrimitiveMesh,
    SpotLight,
    Vector3,
    WebGPUEngine,
    ClusterDebugMaterial,
    SpriteDebug,
    Script,
    Entity
} from "arche-engine";
import {OrbitControl} from "@arche-engine/controls";
import {Color} from "@arche-engine/math";

class MoveScript extends Script {
    pos: Vector3;
    vel: number;
    velSign: number = -1;

    constructor(entity: Entity) {
        super(entity);
        this.pos = new Vector3(10 * Math.random(), 0, 10 * Math.random());
        this.vel = Math.abs(Math.random() * 4);
    }

    onUpdate(deltaTime: number) {
        if (this.pos.y >= 5) {
            this.velSign = -1;
        }
        if (this.pos.y <= -5) {
            this.velSign = 1;
        }
        this.pos.y += deltaTime * this.vel * this.velSign;

        this.entity.transform.position = this.pos;
        this.entity.transform.lookAt(new Vector3(0, 0, 0));
    }
}

const engine = new WebGPUEngine("canvas");
engine.canvas.resizeByClientSize();
engine.init().then(() => {
    const scene = engine.sceneManager.activeScene;
    const rootEntity = scene.createRootEntity();
    rootEntity.addComponent(SpriteDebug);

    // init camera
    const cameraEntity = rootEntity.createChild("camera");
    cameraEntity.addComponent(Camera);
    cameraEntity.transform.setPosition(10, 10, 10);
    cameraEntity.transform.lookAt(new Vector3());
    cameraEntity.addComponent(OrbitControl);

    // init point light
    for (let i = 0; i < 15; i++) {
        const light = rootEntity.createChild("light");
        light.addComponent(MoveScript);
        const pointLight = light.addComponent(PointLight);
        pointLight.color = new Color(Math.random(), Math.random(), Math.random(), 1);
    }

    // init spot light
    for (let i = 0; i < 15; i++) {
        const light = rootEntity.createChild("light");
        light.addComponent(MoveScript);
        const spotLight = light.addComponent(SpotLight);
        spotLight.color = new Color(Math.random(), Math.random(), Math.random(), 1);
    }

    // create box test entity
    const cubeSize = 20.0;
    const boxEntity = rootEntity.createChild("BoxEntity");
    const boxMtl = new ClusterDebugMaterial(engine);
    const boxRenderer = boxEntity.addComponent(MeshRenderer);
    boxRenderer.mesh = PrimitiveMesh.createPlane(engine, cubeSize, cubeSize, 100, 1000);
    boxRenderer.setMaterial(boxMtl);

    engine.run();
});
