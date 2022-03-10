import {
    BaseMaterial,
    BindGroupInfo,
    Buffer,
    BufferUsage,
    Camera,
    ComputePass,
    Engine,
    MeshRenderer,
    PrimitiveMesh,
    Shader,
    ShaderMacroCollection,
    ShaderProperty,
    ShaderStage,
    Vector3,
    WebGPUEngine,
    WGSL,
    WGSLEncoder,
    WGSLUnlitVertex,
    WGSLUVShare
} from "arche-engine";
import {OrbitControl} from "@arche-engine/controls";

class WGSLAtomicFragment extends WGSL {
    private _uvShare: WGSLUVShare;

    constructor() {
        super();
        this._uvShare = new WGSLUVShare("VertexOut");
    }

    compile(macros: ShaderMacroCollection): [string, BindGroupInfo] {
        this._source = "";
        this._bindGroupInfo.clear();
        const inputStructCounter = WGSLEncoder.startCounter(0);
        {
            const encoder = this.createSourceEncoder(ShaderStage.FRAGMENT);
            this._uvShare.execute(encoder, macros, inputStructCounter);

            encoder.addStorageBufferBinding("u_atomic", "u32", true);
            encoder.addInoutType("Output", 0, "finalColor", "vec4<f32>");

            encoder.addRenderEntry([["in", "VertexOut"]], ["out", "Output"], () => {
                let source: string = "";
                source += "var counter:f32 = f32(u_atomic % 255u);\n";
                source += "out.finalColor = vec4<f32>(counter / 255.0, 1.0 - counter / 255.0, counter / 255.0, 1.0);\n";
                return source;
            });
            encoder.flush();
        }
        WGSLEncoder.endCounter(inputStructCounter);
        return [this._source, this._bindGroupInfo];
    }
}

class AtomicMaterial extends BaseMaterial {
    private _atomicProp: ShaderProperty = Shader.getPropertyByName("u_atomic")
    private readonly _atomicBuffer: Buffer;

    constructor(engine: Engine) {
        super(engine, Shader.find("atomicRender"));
        this._atomicBuffer = new Buffer(engine, 4, BufferUsage.STORAGE);
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
            const encoder = this.createSourceEncoder(ShaderStage.COMPUTE);
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
    Shader.create("atomicRender", new WGSLUnlitVertex(), ShaderStage.VERTEX, new WGSLAtomicFragment());

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

    const _pass = new ComputePass(engine, Shader.create("atomic", new WGSLAtomicCompute(), ShaderStage.COMPUTE));
    _pass.setDispatchCount(1, 1, 1);
    _pass.attachShaderData(material.shaderData);
    engine.computePasses.push(_pass);

    engine.run();
});
