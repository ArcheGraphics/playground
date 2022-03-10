import {
    Vector3,
    Script,
    PointLight,
    WebGPUEngine,
    Camera,
    MeshRenderer,
    PrimitiveMesh,
    BlinnPhongMaterial,
    SpotLight,
    DirectLight,
    RenderFace
} from "arche-engine";
import {OrbitControl} from "@arche-engine/controls";
import {Color} from "@arche-engine/math";

class lightMovement extends Script {
    speed = 1;
    totalTime = 0;

    onUpdate(deltaTime: number) {
        this.totalTime += deltaTime/1000;
        this.totalTime = this.totalTime % 100;
        this.entity.transform.setPosition(10 * Math.sin(this.speed * this.totalTime), 10, 10 * Math.cos(this.speed * this.totalTime));
        this.entity.transform.lookAt(new Vector3(0, 0, 0));
    }
}

class lightMovementReverse extends Script {
    speed = 1;
    totalTime = 0;

    onUpdate(deltaTime: number) {
        this.totalTime += deltaTime/1000;
        this.totalTime = this.totalTime % 100;
        this.entity.transform.setPosition(10 * Math.cos(this.speed * this.totalTime), 10, 10 * Math.sin(this.speed * this.totalTime));
        this.entity.transform.lookAt(new Vector3(0, 0, 0));
    }
}

const engine = new WebGPUEngine("canvas");
engine.canvas.resizeByClientSize();
engine.init().then(() => {
    const scene = engine.sceneManager.activeScene;
    const rootEntity = scene.createRootEntity();

    // init camera
    const cameraEntity = rootEntity.createChild("camera");
    cameraEntity.addComponent(Camera);
    cameraEntity.transform.setPosition(10, 10, 10);
    cameraEntity.transform.lookAt(new Vector3());
    cameraEntity.addComponent(OrbitControl)

    // init point light
    const light = rootEntity.createChild("light");
    light.addComponent(lightMovement);
    const spotLight = light.addComponent(SpotLight);
    spotLight.distance = 100;
    spotLight.intensity = 0.2;
    spotLight.enableShadow = true;

    const light2 = rootEntity.createChild("light2");
    light2.transform.setPosition(0, 10, 0);
    light2.transform.lookAt(new Vector3(0, 0, 0), new Vector3(1, 0, 0));
    const pointLight = light2.addComponent(PointLight);
    pointLight.distance = 100;
    pointLight.intensity = 0.2;
    pointLight.enableShadow = true;

    const light3 = rootEntity.createChild("light3");
    light3.addComponent(lightMovementReverse);
    const directLight = light3.addComponent(DirectLight);
    directLight.intensity = 0.2;
    directLight.enableShadow = true;

    // create box test entity
    const cubeSize = 2.0;
    const boxEntity = rootEntity.createChild("BoxEntity");
    boxEntity.transform.setPosition(0, 2, 0);
    const boxMtl = new BlinnPhongMaterial(engine);
    boxMtl.baseColor = new Color(0.3, 0.3, 0.3, 0.5);

    const boxRenderer = boxEntity.addComponent(MeshRenderer);
    boxRenderer.mesh = PrimitiveMesh.createCuboid(engine, cubeSize, cubeSize, cubeSize);
    boxRenderer.setMaterial(boxMtl);
    boxRenderer.castShadow = true;

    const planeEntity = rootEntity.createChild("PlaneEntity");
    const planeMtl = new BlinnPhongMaterial(engine);
    planeMtl.baseColor = new Color(1.0, 0, 0, 1.0);
    planeMtl.renderFace = RenderFace.Double;

    const planeRenderer = planeEntity.addComponent(MeshRenderer);
    planeRenderer.mesh = PrimitiveMesh.createPlane(engine, 10, 10);
    planeRenderer.setMaterial(planeMtl);
    planeRenderer.receiveShadow = true;

    engine.run();
});
