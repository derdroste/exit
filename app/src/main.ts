import './style.css'
import { AmbientLight, Clock, Color, PerspectiveCamera, PointLight, Raycaster, Scene, WebGLRenderer } from 'three'
import { createBoard } from './utils/createBoard';
import { MainPlayer } from './entities/MainPlayer';
import { createLevel } from './utils/createLevel';

window.addEventListener('DOMContentLoaded', async () => {
  const scene = new Scene()
  scene.background = new Color('#0000ff')
  const boardWidth = 18
  const boardHeight = 18

  const clock = new Clock()

  const camera = new PerspectiveCamera(50, window.innerWidth / window.innerHeight)

  const renderer = new WebGLRenderer()
  renderer.setSize(window.innerWidth, window.innerHeight)
  document.body.appendChild(renderer.domElement)

  const raycaster = new Raycaster();

  const amb = new AmbientLight()
  scene.add(amb)
  const spot = new PointLight(new Color('#fff'), 10)
  spot.position.set(0, 5, 0)
  spot.castShadow = true
  scene.add(spot)

  const { board, boardMesh } = createBoard(boardWidth, boardHeight, scene)

  await createLevel(boardWidth, boardHeight, scene)
  
  const mainPlayer = await MainPlayer.create(camera, renderer, board, boardMesh)
  scene.add(mainPlayer.object)

  function resize() {
      const width = window.innerWidth
      const height = window.innerHeight

      renderer.setSize(width, height)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
  }

  window.addEventListener('resize', resize)

  function animate() {
    const delta = clock.getDelta()

    requestAnimationFrame( animate )

    mainPlayer.update(delta, raycaster)

    renderer.render( scene, camera );
  }

  animate()
})