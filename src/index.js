import { Live2DCubismFramework } from "../Framework/src/live2dcubismframework.ts"
import { Live2DCubismFramework as cubismusermodel } from '../Framework/src/model/cubismusermodel.ts'
import { Live2DCubismFramework as cubismmodelsettingjson } from '../Framework/src/cubismmodelsettingjson.ts'
import { Live2DCubismFramework as cubismeyeblink } from '../Framework/src/effect/cubismeyeblink.ts'
import { Live2DCubismFramework as cubismdefaultparameterid } from '../Framework/src/cubismdefaultparameterid.ts'
import { Live2DCubismFramework as cubismbreath } from '../Framework/src/effect/cubismbreath.ts'
import { Live2DCubismFramework as csmvector } from '../Framework/src/type/csmvector.ts'
import { Live2DCubismFramework as cubismmatrix44 } from '../Framework/src/math/cubismmatrix44.ts'
const CubismFramework = Live2DCubismFramework.CubismFramework
const CubismUserModel = cubismusermodel.CubismUserModel
const CubismModelSettingJson = cubismmodelsettingjson.CubismModelSettingJson
const CubismEyeBlink = cubismeyeblink.CubismEyeBlink
const CubismDefaultParameterId = cubismdefaultparameterid
const CubismBreath = cubismbreath.CubismBreath
const csmVector = csmvector.csmVector
const BreathParameterData = cubismbreath.BreathParameterData
const CubismMatrix44 = cubismmatrix44.CubismMatrix44

const DIR = 'model'

CubismFramework.startUp()
CubismFramework.initialize()
const canvas = document.getElementById('vface')
const gl = canvas.getContext("webgl")

class VFaceModel extends CubismUserModel {
  async initialize() {
    const json = await (await fetch(`${DIR}/hiyori_free_t06.model3.json`)).arrayBuffer()
    this.settings = new CubismModelSettingJson(json, json.byteLength)

    const model = await (await fetch(`${DIR}/${this.settings.getModelFileName()}`)).arrayBuffer()
    this.loadModel(model)

    const side = Math.min(innerWidth, innerHeight)
    canvas.width = canvas.height = side
    this.createRenderer()
    const renderer = this.getRenderer()

    let images = []
    for (let i = 0; i != this.settings.getTextureCount(); ++i) {
      let image = new Image()
      image.onload = () => {
        let tex = gl.createTexture()
        gl.bindTexture(gl.TEXTURE_2D, tex)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
        gl.generateMipmap(gl.TEXTURE_2D)
        renderer.bindTexture(i, tex)
      }
      image.src = `model/${this.settings.getTextureFileName(i)}`
      images.push(image)
    }

    const physics = await (await fetch(`model/${this.settings.getPhysicsFileName()}`)).arrayBuffer()
    this.loadPhysics(physics, physics.byteLength)

    if (this.settings.getEyeBlinkParameterCount()) {
      this._eyeBlink = CubismEyeBlink.create(this.settings)
      this._eyeBlink.setBlinkingInterval(8)
      this._eyeBlink.setBlinkingSetting(0.1, 0, 0.1)
    }

    this._idParamBreath = CubismFramework.getIdManager().getId(CubismDefaultParameterId.ParamBreath)
    this._idParamBodyAngleY = CubismFramework.getIdManager().getId(CubismDefaultParameterId.ParamBodyAngleY)
    this._idParamBodyAngleZ = CubismFramework.getIdManager().getId(CubismDefaultParameterId.ParamBodyAngleZ)
    this._idParamAngleZ = CubismFramework.getIdManager().getId(CubismDefaultParameterId.ParamAngleZ)
    this._breath = CubismBreath.create()
    let breathParameters = new csmVector()
    breathParameters.pushBack(new BreathParameterData(this._idParamBreath, 0, 0.2, 6, 0.2))
    breathParameters.pushBack(new BreathParameterData(this._idParamBodyAngleY, 0, 0.1, 6, 0.1))
    breathParameters.pushBack(new BreathParameterData(this._idParamBodyAngleZ, 0, 0.3, 3, 1))
    breathParameters.pushBack(new BreathParameterData(this._idParamAngleZ, 0, 1, 3, 1))
    this._breath.setParameters(breathParameters)

    renderer.setIsPremultipliedAlpha(true)
    renderer.startUp(gl);
    renderer.setRenderState(gl.getParameter(gl.FRAMEBUFFER_BINDING), [0, 0, canvas.width, canvas.height])

    let matrix = new CubismMatrix44();
    matrix.scale(4.5, 4.5);
    matrix.translateRelative(0, -0.4);
    this.getRenderer().setMvpMatrix(matrix);

    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LEQUAL)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    gl.clearDepth(1.0)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
  }

  draw(delta) {
    this._eyeBlink.updateParameters(this._model, delta)
    this._breath.updateParameters(this._model, delta)
    this._physics.evaluate(this._model, delta)
    this._model.update()
    this.getRenderer().drawModel()
  }
}

function loop() {
  const now = Date.now()
  const delta = (now - lastDate) / 1000
  window.lastDate = now

  gl.flush()
  model.draw(delta)
  requestAnimationFrame(loop)
}

async function main() {
  window.lastDate = Date.now()
  window.model = new VFaceModel()
  await model.initialize()
  loop()
}

main()
