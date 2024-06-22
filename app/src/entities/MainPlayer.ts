import { AnimationAction, AnimationMixer, Color, InstancedMesh, Matrix4, PerspectiveCamera, Quaternion, Raycaster, Vector2, Vector3, WebGLRenderer } from "three";
import { GLTF, GLTFLoader } from "three/examples/jsm/Addons.js";
import { AStarFinder } from 'pathfinding'
import { ExtendedGrid } from "../utils/createBoard";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

type PlayerAnimations = {
    idle: AnimationAction
    walk: AnimationAction
    run: AnimationAction
}

export class MainPlayer {
    gltf: GLTF
    object: GLTF['scene']
    mixer: AnimationMixer
    animations: PlayerAnimations
    camera: PerspectiveCamera
    renderer: WebGLRenderer
    controls: OrbitControls
    board: ExtendedGrid
    boardMesh: InstancedMesh
    cameraHeight = 10

    pointerDown: boolean
    pointer: Vector2
    move: boolean
    path: number[][]
    finder: AStarFinder
    activePathPoint: number
    rotationMatrix = new Matrix4()
    targetQuaternion = new Quaternion()

    currentAnimation: keyof PlayerAnimations

    constructor(gltf: GLTF, mixer: AnimationMixer, animations: PlayerAnimations, camera: PerspectiveCamera, renderer: WebGLRenderer, board: ExtendedGrid, boardMesh: InstancedMesh) {
        this.gltf = gltf
        this.object = gltf.scene
        this.mixer = mixer
        this.animations = animations
        this.camera = camera
        this.renderer = renderer
        this.board = board
        this.boardMesh = boardMesh

        this.pointerDown = false
        this.pointer = new Vector2(1000, 1000);
        this.move = false

        this.currentAnimation = 'idle'

        this.camera.position.copy(new Vector3(this.object.position.x + 6, this.cameraHeight, this.object.position.z + 5))
        this.camera.lookAt(new Vector3(this.object.position.x, 0, this.object.position.z))
        
        this.controls = new OrbitControls(this.camera, this.renderer.domElement)
        this.controls.enableRotate = true
        this.controls.update()

        this.finder = new AStarFinder({
            diagonalMovement: 4
        })
        
        this.path = [[0, 0]]
        this.activePathPoint = 0

        window.addEventListener('pointerdown', (e) => this.onPointerDown(e))
        window.addEventListener('pointerup', () => this.onPointerUp())
    }

    static async create(camera: PerspectiveCamera, renderer: WebGLRenderer, board: ExtendedGrid, boardMesh: InstancedMesh) {
        const loader = new GLTFLoader();
        const gltf = await loader.loadAsync('models/players/Wizard.gltf')

        const mixer = new AnimationMixer(gltf.scene)
        const animations = {
            idle: mixer.clipAction(gltf.animations[1]),
            walk: mixer.clipAction(gltf.animations[14]),
            run: mixer.clipAction(gltf.animations[9])
        }

        return new MainPlayer(gltf, mixer, animations, camera, renderer, board, boardMesh)
    }

    onPointerDown(event: PointerEvent) {
        this.pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1
        this.pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1
        this.pointerDown = true
    }

    onPointerUp() {
        this.pointerDown = false
    }

    findPath(oldX: number, oldY: number, newX: number, newY: number) {
        const grid = this.board.clone()

        const path = this.finder.findPath(Math.floor(oldX), Math.floor(oldY), newX, newY, grid)

        if (path.length > 0) {
            this.path = path
            this.activePathPoint = 0
            this.move = true
        }
    }

    update(delta: number, raycaster: Raycaster) {
        this.animations[this.currentAnimation].play()

        let updateAnimation = this.currentAnimation

        if (this.pointerDown) {
            raycaster.setFromCamera(this.pointer, this.camera)
            const intersection = raycaster.intersectObject(this.boardMesh)

            if (intersection.length > 0 ) {
                const instanceId = intersection[0].instanceId

                if (instanceId && this.boardMesh.instanceColor) {
                    this.boardMesh.setColorAt(instanceId, new Color('#00ff00'))
                    this.boardMesh.instanceColor.needsUpdate = true

                    const flatBoard = this.board['nodes'].flat()
                    this.findPath(this.object.position.x, this.object.position.z, flatBoard[instanceId].x, flatBoard[instanceId].y)
                }
            }
        }

        if (!this.move) {
            updateAnimation = 'idle'
        }

        if (this.move) {
            const nextPoint = new Vector3(this.path[this.activePathPoint][0], 0 , this.path[this.activePathPoint][1])
            const lastPoint = new Vector3(this.path[this.path.length - 1][0], 0 , this.path[this.path.length - 1][1])

            const distanceToNextPoint = this.object.position.distanceTo(nextPoint)
            const distanceToLastPoint = this.object.position.distanceTo(lastPoint)

            this.object.position.lerp(nextPoint, 0.1)

            if (this.activePathPoint !== 0) {
                this.rotationMatrix.lookAt(nextPoint, this.object.position, this.object.up)
                this.targetQuaternion.setFromRotationMatrix(this.rotationMatrix);

			    if (!this.object.quaternion.equals(this.targetQuaternion)) {
					const step = 7 * delta;
					this.object.quaternion.rotateTowards(this.targetQuaternion, step);
				}
            }

            updateAnimation = 'walk'

            this.controls.target.set(this.object.position.x, 0, this.object.position.z)
            this.camera.position.copy(new Vector3(this.object.position.x + 6, this.cameraHeight, this.object.position.z + 5))
            
            
            
            if (distanceToNextPoint < 1 && this.activePathPoint !== this.path.length - 1) {
                this.activePathPoint += 1
            }

            if (distanceToLastPoint < 0.3) {
                this.move = false
            }
        }

        if (!this.animations[this.currentAnimation].isRunning()) {
            this.animations[this.currentAnimation].stop()
        }

        if (updateAnimation !== this.currentAnimation) {
            this.animations[this.currentAnimation].crossFadeTo(this.animations[updateAnimation], 0.3, false)
            
            this.currentAnimation = updateAnimation
        }

        //this.controls.update()
        this.mixer.update(delta)
    }
}