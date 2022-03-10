import {
    Vector3,
    WebGPUEngine,
    Camera,
    MeshRenderer,
    PrimitiveMesh,
    BaseMaterial, ShaderProperty,
    Engine, Shader, Buffer,
    BindGroupInfo, WGSL,
    ShaderMacroCollection, ComputePass
} from "arche-engine";
import {OrbitControl} from "@arche-engine/controls";

class AtomicMaterial extends BaseMaterial {
    private _atomicProp: ShaderProperty = Shader.getPropertyByName("u_atomic")
    private readonly _atomicBuffer: Buffer;

    constructor(engine: Engine) {
        super(engine, Shader.find("atomicRender"));
        this._atomicBuffer = new Buffer(engine, 4, 'storage');
        this.atomicBuffer = this._atomicBuffer;
    }

    get atomicBuffer(): Buffer {
        return this._atomicBuffer;
    }

    set atomicBuffer(buffer: Buffer) {
        this.shaderData.setBufferFunctor(this._atomicProp, () => {
            return this._atomicBuffer;
        });
    }
}

class WGSLAtomicCompute extends WGSL {
    compile(macros: ShaderMacroCollection): [string, BindGroupInfo] {
        this._source = "";
        this._bindGroupInfo.clear();
        {
            const encoder = this.createSourceEncoder(GPUShaderStage.Compute);
            encoder.addStruct("struct Counter {\n" +
                "counter: atomic<u32>;\n" +
                "}\n");
            encoder.addStorageBufferBinding("u_atomic", "Counter", false);

            encoder.addComputeEntry([2, 2, 2], () => {
                // source += "atomicStore(&u_atomic.counter, 0u);\n";
                // source += "storageBarrier();\n";
                return "atomicAdd(&u_atomic.counter, 1u);\n";
            });
            encoder.flush();
        }
        return [this._source, this._bindGroupInfo];
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
    cameraEntity.addComponent(OrbitControl);

    const cubeEntity = rootEntity.createChild();
    const renderer = cubeEntity.addComponent(MeshRenderer);
    renderer.mesh = PrimitiveMesh.createCuboid(engine, 1);
    const material = new AtomicMaterial(engine);
    renderer.setMaterial(material);

    const _pass = new ComputePass(engine, Shader.create("atomic", new WGSLAtomicCompute(), null));
    _pass.setDispatchCount(1, 1, 1);
    _pass.attachShaderData(material.shaderData);

    engine.run();
});
