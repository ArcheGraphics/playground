import {
    Vector3,
    Script,
    PointLight,
    SampledTexture2D,
    WebGPUEngine,
    Camera,
    MeshRenderer,
    PrimitiveMesh,
    BlinnPhongMaterial
} from "arche-engine";
import {OrbitControl} from "@arche-engine/controls";

class MoveScript extends Script {
    private _rTri = 0

    onUpdate(deltaTime: number) {
        this._rTri += 90 * deltaTime / 1000.0;
        this.entity.transform.setRotation(0, this._rTri, 0);
    }
}

const engine = new WebGPUEngine("canvas");
engine.canvas.resizeByClientSize();
engine.init().then(() => {
    const scene = engine.sceneManager.activeScene;
    const diffuseSolidColor = scene.ambientLight.diffuseSolidColor;
    diffuseSolidColor.setValue(0.5, 0.5, 0.5, 1);
    scene.ambientLight.diffuseSolidColor = diffuseSolidColor;
    const rootEntity = scene.createRootEntity();

    // init camera
    const cameraEntity = rootEntity.createChild("camera");
    cameraEntity.addComponent(Camera);
    cameraEntity.transform.setPosition(10, 10, 10);
    cameraEntity.transform.lookAt(new Vector3());
    cameraEntity.addComponent(OrbitControl)

    // init point light
    const light = rootEntity.createChild("light");
    light.transform.setPosition(0, 10, 0);
    light.transform.lookAt(new Vector3());
    const pointLight = light.addComponent(PointLight);
    pointLight.intensity = 0.6;

    const cubeEntity = rootEntity.createChild();
    cubeEntity.addComponent(MoveScript);
    const renderer = cubeEntity.addComponent(MeshRenderer);
    renderer.mesh = PrimitiveMesh.createCuboid(engine, 1);
    const material = new BlinnPhongMaterial(engine);
    material.baseColor.setValue(0.7, 0.5, 0.4, 1);
    material.baseColor = material.baseColor;
    renderer.setMaterial(material);

    const sphereEntity = rootEntity.createChild();
    sphereEntity.transform.setPosition(0, 5, 0);
    sphereEntity.addComponent(MoveScript);
    const sphereRenderer = sphereEntity.addComponent(MeshRenderer);
    sphereRenderer.mesh = PrimitiveMesh.createSphere(engine, 1);

    engine.resourceManager
        .load<SampledTexture2D>("http://192.168.31.204:8000/Textures/wood.png")
        // @ts-ignore
        .then((texture) => {
            const unlit = new BlinnPhongMaterial(engine)
            unlit.baseTexture = texture;
            sphereRenderer.setMaterial(unlit);
        });

    engine.run();
});
