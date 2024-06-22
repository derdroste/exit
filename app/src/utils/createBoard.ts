import { Color, DoubleSide, InstancedMesh, Matrix4, MeshBasicMaterial, PlaneGeometry, Scene } from "three";
import { Grid } from 'pathfinding'

export interface ExtendedGrid extends Grid {
    nodes: {
        x: number
        y: number
    }[]
}

export const createBoard = (rowsAmount: number, colsAmount: number, scene: Scene) => {
    const grid = new Grid(rowsAmount, colsAmount)

    const geo = new PlaneGeometry(1, 1)
    geo.rotateX(Math.PI / 180 * 90)
    const mat = new MeshBasicMaterial({ opacity: 0.4, transparent: true, side: DoubleSide })
    const mesh = new InstancedMesh(geo, mat, rowsAmount * colsAmount)

    for (let i = 0; i < rowsAmount; i++) {
        for (let j = 0; j < colsAmount; j++) {
            mesh.setMatrixAt(i + j * colsAmount * (rowsAmount / colsAmount), new Matrix4().setPosition(i, 0, j))
            mesh.setColorAt(i + j * colsAmount * (rowsAmount / colsAmount), new Color('#fff'))
        }
    }

    // for (let i = 5; i < rowsAmount - 1; i++) {
    //     mesh.setColorAt(i + 2 * colsAmount * (rowsAmount / colsAmount), new Color('#ff0000'))
    //     grid.setWalkableAt(i, 2, false);
    // }

    // for (let i = 5; i < rowsAmount - 1; i++) {
    //     mesh.setColorAt(i + 30 * colsAmount * (rowsAmount / colsAmount), new Color('#ff0000'))
    //     grid.setWalkableAt(i, 30, false);
    // }

    // for (let i = 5; i < rowsAmount - 1; i++) {
    //     mesh.setColorAt(i + 20 * colsAmount * (rowsAmount / colsAmount), new Color('#ff0000'))
    //     grid.setWalkableAt(i, 20, false);
    // }

    // for (let i = 20; i < colsAmount - 1; i++) {
    //     mesh.setColorAt(20 + i * colsAmount * (rowsAmount / colsAmount), new Color('#ff0000'))
    //     grid.setWalkableAt(20, i, false);
    // }


    scene.add(mesh)

    return { board: grid as ExtendedGrid, boardMesh: mesh  }
}