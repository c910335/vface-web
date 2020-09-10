import { Live2DCubismFramework } from '../Framework/src/live2dcubismframework.ts'
import Config from '../config.js'
import Model from './model.js'
import Updater from './updater.js'
const CubismFramework = Live2DCubismFramework.CubismFramework

CubismFramework.startUp()
CubismFramework.initialize()
const canvas = document.getElementById('vface')
const gl = canvas.getContext('webgl')

function loop() {
  const now = Date.now()
  const delta = (now - lastDate) / 1000
  window.lastDate = now

  gl.flush()
  model.draw(delta)
  setTimeout(() => requestAnimationFrame(loop), Config.DELAY)
}

async function main() {
  window.lastDate = Date.now()
  window.model = new Model()
  await model.initialize(canvas, gl)
  window.updater = new Updater(model)
  loop()
}

main()
