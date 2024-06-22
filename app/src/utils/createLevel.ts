import { Object3D, Scene } from 'three'
import { FBXLoader, GLTFLoader } from "three/examples/jsm/Addons.js";

export const createLevel = async (rowsAmount: number, colsAmount: number, scene: Scene) => {
    const scale = 0.01

    const loader = new GLTFLoader()
    const tile = await loader.loadAsync('models/level/dungeon/Level.glb')
    console.log(tile.scene)
    //tile.scale.set(scale, scale, scale)

    // const tilesObject = new Object3D()

    // for (let i = 0; i < rowsAmount; i++) {
    //     for (let j = 0; j < colsAmount; j++) {
    //         const clonedTile = tile.clone()
    //         clonedTile.position.set(i, 0, j)
    //         tilesObject.attach(clonedTile)
    //     }
    // }
tile.scene.position.set(rowsAmount / 2 - 1, -0.5, colsAmount / 2 - 1)
    scene.add(tile.scene)
}