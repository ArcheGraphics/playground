import {
    Vector3,
    SampledTexture2D,
    WebGPUEngine,
    Camera,
    MeshRenderer,
    PrimitiveMesh,
    Engine,
    Shader,
    BaseMaterial,
    ShaderProperty,
    PBRMaterial,
    Entity,
    SampledTextureCube,
    AssetType,
    WGSLSkyboxDebuggerFragment,
    WGSLSkyboxDebuggerVertex
} from "arche-engine";
import {OrbitControl} from "@arche-engine/controls";

class BakerMaterial extends BaseMaterial {
    private static _baseTextureProp: ShaderProperty = Shader.getPropertyByName("u_baseTexture");
    private static _baseSamplerProp: ShaderProperty = Shader.getPropertyByName("u_baseSampler");
    private static _faceIndexProp: ShaderProperty = Shader.getPropertyByName("u_faceIndex");

    private _texture: SampledTexture2D
    private _faceIndex: number;

    constructor(engine: Engine) {
        super(engine, Shader.find("cubemapDebugger"))
    }

    /// Base texture.
    get baseTexture(): SampledTexture2D {
        return this._texture;
    }

    set baseTexture(newValue: SampledTexture2D) {
        this._texture = newValue;
        this.shaderData.setSampledTexture(BakerMaterial._baseTextureProp, BakerMaterial._baseSamplerProp, newValue);
    }

    /// Tiling and offset of main textures.
    get faceIndex(): number {
        return this._faceIndex;
    }

    set faceIndex(newValue: number) {
        this._faceIndex = newValue;
        this.shaderData.setInt(BakerMaterial._faceIndexProp, newValue);
    }
}

const engine = new WebGPUEngine("canvas");
engine.canvas.resizeByClientSize();
engine.init().then(() => {
    Shader.create("cubemapDebugger", new WGSLSkyboxDebuggerVertex(), new WGSLSkyboxDebuggerFragment());

    const scene = engine.sceneManager.activeScene;
    const rootEntity = scene.createRootEntity();

    // init camera
    const cameraEntity = rootEntity.createChild("camera");
    cameraEntity.addComponent(Camera);
    cameraEntity.transform.setPosition(0, 0, 10);
    cameraEntity.transform.lookAt(new Vector3());
    cameraEntity.addComponent(OrbitControl)

    // Create Sphere
    const sphereEntity = rootEntity.createChild("box");
    sphereEntity.transform.setPosition(-1, 2, 0);
    const sphereMaterial = new PBRMaterial(engine);
    sphereMaterial.roughness = 0;
    sphereMaterial.metallic = 1;
    const renderer = sphereEntity.addComponent(MeshRenderer);
    renderer.mesh = PrimitiveMesh.createSphere(engine, 1, 64);
    renderer.setMaterial(sphereMaterial);

    // Create planes
    let planes: Entity[] = [];
    let planeMaterials: BakerMaterial[] = [];

    for (let i = 0; i < 6; i++) {
        const bakerEntity = rootEntity.createChild("IBL Baker Entity");
        bakerEntity.transform.setRotation(90, 0, 0);
        const bakerMaterial = new BakerMaterial(engine);
        const bakerRenderer = bakerEntity.addComponent(MeshRenderer);
        bakerRenderer.mesh = PrimitiveMesh.createPlane(engine, 2, 2);
        bakerRenderer.setMaterial(bakerMaterial);
        planes.push(bakerEntity);
        planeMaterials.push(bakerMaterial);
    }

    planes[0].transform.setPosition(1, 0, 0); // PX
    planes[1].transform.setPosition(-3, 0, 0); // NX
    planes[2].transform.setPosition(1, 2, 0); // PY
    planes[3].transform.setPosition(1, -2, 0); // NY
    planes[4].transform.setPosition(-1, 0, 0); // PZ
    planes[5].transform.setPosition(3, 0, 0); // NZ

    engine.resourceManager
        .load<SampledTextureCube>({
                urls: [
                    "http://30.46.128.45:8000/SkyMap/country/posx.png",
                    "http://30.46.128.45:8000/SkyMap/country/negx.png",
                    "http://30.46.128.45:8000/SkyMap/country/posy.png",
                    "http://30.46.128.45:8000/SkyMap/country/negy.png",
                    "http://30.46.128.45:8000/SkyMap/country/posz.png",
                    "http://30.46.128.45:8000/SkyMap/country/negz.png",
                ],
                type: AssetType.TextureCube
            }
        )
        // @ts-ignore
        .then((cubeMap) => {
            scene.ambientLight.specularTexture = cubeMap;

            const changeMip = (mipLevel: number) => {
                for (let i = 0; i < 6; i++) {
                    const material = planeMaterials[i];
                    material.baseTexture = cubeMap.textureView2D(mipLevel, i);
                    material.faceIndex = i;
                }
            };
            changeMip(0);
            engine.run();
        })
});
