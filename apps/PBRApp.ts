import {
    Vector3,
    WebGPUEngine,
    Camera,
    MeshRenderer,
    PrimitiveMesh,
    PBRMaterial,
    DirectLight,
    MathUtil
} from "arche-engine";
import {OrbitControl} from "@arche-engine/controls";
import {Color} from "@arche-engine/math";

class Material {
    name: string;
    baseColor: Color;
    roughness: number;
    metallic: number;

    constructor(n: string, c: Color, r: number, m: number) {
        this.name = n;
        this.roughness = r;
        this.metallic = m;
        this.baseColor = c;
    };
}

const materials = [
    new Material("Gold", new Color(1.0, 0.765557, 0.336057, 1.0), 0.1, 1.0),
    new Material("Copper", new Color(0.955008, 0.637427, 0.538163, 1.0), 0.1, 1.0),
    new Material("Chromium", new Color(0.549585, 0.556114, 0.554256, 1.0), 0.1, 1.0),
    new Material("Nickel", new Color(0.659777, 0.608679, 0.525649, 1.0), 0.1, 1.0),
    new Material("Titanium", new Color(0.541931, 0.496791, 0.449419, 1.0), 0.1, 1.0),
    new Material("Cobalt", new Color(0.662124, 0.654864, 0.633732, 1.0), 0.1, 1.0),
    new Material("Platinum", new Color(0.672411, 0.637331, 0.585456, 1.0), 0.1, 1.0),
    // Testing materials
    new Material("White", new Color(1.0, 1.0, 1.0, 1.0), 0.1, 1.0),
    new Material("Red", new Color(1.0, 0.0, 0.0, 1.0), 0.1, 1.0),
    new Material("Blue", new Color(0.0, 0.0, 1.0, 1.0), 0.1, 1.0),
    new Material("Black", new Color(0.0, 1.0, 1.0, 1.0), 0.1, 1.0)
]

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
    light.transform.setPosition(3, 3, 3);
    light.transform.lookAt(new Vector3());
    const pointLight = light.addComponent(DirectLight);
    pointLight.intensity = 0.6;

    const materialIndex = 0;
    const mat = materials[materialIndex];

    const sphere = PrimitiveMesh.createSphere(engine, 0.5, 30);
    for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 7; j++) {
            const sphereEntity = rootEntity.createChild("SphereEntity" + i.toString() + j.toString());
            sphereEntity.transform.setPosition(i - 3, j - 3, 0);
            const sphereMtl = new PBRMaterial(engine);
            sphereMtl.setBaseColor(mat.baseColor);
            sphereMtl.metallic = MathUtil.clamp(i / (7 - 1), 0.1, 1.0);
            sphereMtl.roughness = MathUtil.clamp(j / (7 - 1), 0.05, 1.0);

            const sphereRenderer = sphereEntity.addComponent(MeshRenderer);
            sphereRenderer.mesh = sphere;
            sphereRenderer.setMaterial(sphereMtl);
        }
    }

    engine.run();
});
