import {
    BlinnPhongMaterial,
    BoxColliderShape,
    Camera,
    Entity,
    MeshRenderer,
    PlaneColliderShape,
    SpotLight,
    PrimitiveMesh,
    StaticCollider,
    DynamicCollider,
    WebGPUEngine,
    Quaternion,
    Vector2,
    Vector3
} from "arche-engine";
import {OrbitControl} from "@arche-engine/controls";
import {
    PhysXPhysics
} from "@arche-engine/physics-physx";
import {
    PhysXDebugPhysics
} from "@arche-engine/physics-physx-debug";

PhysXPhysics.init().then(() => {
    const engine = new WebGPUEngine("canvas");
    engine.canvas.resizeByClientSize();
    engine.init(PhysXPhysics).then(() => {
        // PhysXDebugPhysics.setEngine(engine);

        const scene = engine.sceneManager.activeScene;
        const rootEntity = scene.createRootEntity();

        // init camera
        const cameraEntity = rootEntity.createChild("camera");
        cameraEntity.addComponent(Camera);
        const pos = cameraEntity.transform.position;
        pos.setValue(10, 10, 10);
        cameraEntity.transform.position = pos;
        cameraEntity.addComponent(OrbitControl);

        // init light
        const solidColor = scene.ambientLight.diffuseSolidColor;
        solidColor.setValue(1, 1, 1, 1);
        scene.ambientLight.diffuseSolidColor = solidColor;
        scene.ambientLight.diffuseIntensity = 0.5;

        const light = rootEntity.createChild("light");
        light.transform.position = new Vector3(0, 10, 0);
        light.transform.lookAt(new Vector3(), new Vector3(1, 0, 0));
        const p = light.addComponent(SpotLight);
        p.enableShadow = true;
        p.distance = 100;

        function addPlane(size: Vector2, position: Vector3, rotation: Quaternion): Entity {
            const mtl = new BlinnPhongMaterial(engine);
            mtl.baseColor.setValue(0.03179807202597362, 0.3939682161541871, 0.41177952549087604, 1);
            const planeEntity = rootEntity.createChild();

            const renderer = planeEntity.addComponent(MeshRenderer);
            renderer.mesh = PrimitiveMesh.createPlane(engine, size.x, size.y);
            renderer.setMaterial(mtl);
            planeEntity.transform.position = position;
            planeEntity.transform.rotationQuaternion = rotation;

            const physicsPlane = new PlaneColliderShape();
            physicsPlane.setPosition(0, 0.1, 0);
            const planeCollider = planeEntity.addComponent(StaticCollider);
            planeCollider.addShape(physicsPlane);

            return planeEntity;
        }

        addPlane(new Vector2(30, 30), new Vector3, new Quaternion);

        function addTable(): void {
            const entity = rootEntity.createChild("entity");
            entity.transform.setPosition(Math.random() * 4 - 2, 10, Math.random() * 4 - 2);
            // entity.transform.setRotation(Math.random() * 360, Math.random() * 360, Math.random() * 360);
            // entity.transform.setScale(3, 3, 3);
            const boxCollider = entity.addComponent(DynamicCollider);
            boxCollider.mass = 10.0;

            const boxMtl = new BlinnPhongMaterial(engine);
            boxMtl.baseColor.setValue(Math.random(), Math.random(), Math.random(), 1.0);
            {
                const physicsBox = new BoxColliderShape();
                physicsBox.size = new Vector3(0.5, 0.4, 0.045);
                physicsBox.setPosition(0, 0, 0.125);
                boxCollider.addShape(physicsBox);
                const child = entity.createChild();
                child.transform.setPosition(0, 0, 0.125);
                const boxRenderer = child.addComponent(MeshRenderer);
                boxRenderer.mesh = PrimitiveMesh.createCuboid(engine, 0.5, 0.4, 0.045);
                boxRenderer.setMaterial(boxMtl);
            }

            {
                const physicsBox1 = new BoxColliderShape();
                physicsBox1.size = new Vector3(0.1, 0.1, 0.3);
                physicsBox1.setPosition(-0.2, -0.148, -0.048);
                boxCollider.addShape(physicsBox1);
                const child = entity.createChild();
                child.transform.setPosition(-0.2, -0.148, -0.048);
                const boxRenderer = child.addComponent(MeshRenderer);
                boxRenderer.mesh = PrimitiveMesh.createCuboid(engine, 0.1, 0.1, 0.3);
                boxRenderer.setMaterial(boxMtl);
            }

            {
                const physicsBox2 = new BoxColliderShape();
                physicsBox2.size = new Vector3(0.1, 0.1, 0.3);
                physicsBox2.setPosition(0.2, -0.148, -0.048);
                boxCollider.addShape(physicsBox2);
                const child = entity.createChild();
                child.transform.setPosition(0.2, -0.148, -0.048);
                const boxRenderer = child.addComponent(MeshRenderer);
                boxRenderer.mesh = PrimitiveMesh.createCuboid(engine, 0.1, 0.1, 0.3);
                boxRenderer.setMaterial(boxMtl);
            }

            {
                const physicsBox3 = new BoxColliderShape();
                physicsBox3.size = new Vector3(0.1, 0.1, 0.3);
                physicsBox3.setPosition(-0.2, 0.153, -0.048);
                boxCollider.addShape(physicsBox3);
                const child = entity.createChild();
                child.transform.setPosition(-0.2, 0.153, -0.048);
                const boxRenderer = child.addComponent(MeshRenderer);
                boxRenderer.mesh = PrimitiveMesh.createCuboid(engine, 0.1, 0.1, 0.3);
                boxRenderer.setMaterial(boxMtl);
            }

            {
                const physicsBox4 = new BoxColliderShape();
                physicsBox4.size = new Vector3(0.1, 0.1, 0.3);
                physicsBox4.setPosition(0.2, 0.153, -0.048);
                boxCollider.addShape(physicsBox4);
                const child = entity.createChild();
                child.transform.setPosition(0.2, 0.153, -0.048);
                const boxRenderer = child.addComponent(MeshRenderer);
                boxRenderer.mesh = PrimitiveMesh.createCuboid(engine, 0.1, 0.1, 0.3);
                boxRenderer.setMaterial(boxMtl);
            }
        }

        for (let j = 0; j < 15; j++) {
            addTable();
        }

        engine.run();
    });
});
