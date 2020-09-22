import { Live2DCubismFramework } from '../Framework/src/live2dcubismframework.ts'
import { Live2DCubismFramework as cubismusermodel } from '../Framework/src/model/cubismusermodel.ts'
import { Live2DCubismFramework as cubismmodelsettingjson } from '../Framework/src/cubismmodelsettingjson.ts'
import { Live2DCubismFramework as cubismeyeblink } from '../Framework/src/effect/cubismeyeblink.ts'
import { Live2DCubismFramework as cubismdefaultparameterid } from '../Framework/src/cubismdefaultparameterid.ts'
import { Live2DCubismFramework as cubismbreath } from '../Framework/src/effect/cubismbreath.ts'
import { Live2DCubismFramework as csmvector } from '../Framework/src/type/csmvector.ts'
import { Live2DCubismFramework as cubismmatrix44 } from '../Framework/src/math/cubismmatrix44.ts'
import Config from '../config.js'
const CubismFramework = Live2DCubismFramework.CubismFramework
const CubismUserModel = cubismusermodel.CubismUserModel
const CubismModelSettingJson = cubismmodelsettingjson.CubismModelSettingJson
const CubismEyeBlink = cubismeyeblink.CubismEyeBlink
const CubismDefaultParameterId = cubismdefaultparameterid
const CubismBreath = cubismbreath.CubismBreath
const csmVector = csmvector.csmVector
const BreathParameterData = cubismbreath.BreathParameterData
const CubismMatrix44 = cubismmatrix44.CubismMatrix44

export default class extends CubismUserModel {
  async initialize(canvas, gl) {
    this.canvas = canvas
    this.gl = gl
    await this.initSettings()
    await this.initModel()
    this.initRenderer()
    this.initTextures()
    await this.initPhysics()
    this.initParamId()
    this.initBreath()
    this.initMatrix()
    this.initGL()
  }

  async initSettings() {
    const settings = await (await fetch(`${Config.MODEL_DIR}/${Config.MODEL_SETTINGS}`)).arrayBuffer()
    this.settings = new CubismModelSettingJson(settings, settings.byteLength)
  }

  async initModel() {
    const model = await (await fetch(`${Config.MODEL_DIR}/${this.settings.getModelFileName()}`)).arrayBuffer()
    this.loadModel(model)
  }

  initRenderer() {
    const side = Math.min(innerWidth, innerHeight)
    this.canvas.width = this.canvas.height = side
    this.createRenderer()
    const renderer = this.getRenderer()
    renderer.setIsPremultipliedAlpha(true)
    renderer.startUp(this.gl)
    renderer.setRenderState(this.gl.getParameter(this.gl.FRAMEBUFFER_BINDING), [0, 0, this.canvas.width, this.canvas.height])
  }

  initTextures() {
    for (let i = 0; i != this.settings.getTextureCount(); ++i) {
      let image = new Image()
      image.onload = () => {
        let tex = this.gl.createTexture()
        this.gl.bindTexture(this.gl.TEXTURE_2D, tex)
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_LINEAR)
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR)
        this.gl.pixelStorei(this.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1)
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image)
        this.gl.generateMipmap(this.gl.TEXTURE_2D)
        this.getRenderer().bindTexture(i, tex)
      }
      image.src = `${Config.MODEL_DIR}/${this.settings.getTextureFileName(i)}`
    }
  }

  async initPhysics() {
    const physics = await (await fetch(`${Config.MODEL_DIR}/${this.settings.getPhysicsFileName()}`)).arrayBuffer()
    this.loadPhysics(physics, physics.byteLength)
  }

  initParamId() {
    this._idParamAngleX = CubismFramework.getIdManager().getId(CubismDefaultParameterId.ParamAngleX)
    this._idParamAngleY = CubismFramework.getIdManager().getId(CubismDefaultParameterId.ParamAngleY)
    this._idParamAngleZ = CubismFramework.getIdManager().getId(CubismDefaultParameterId.ParamAngleZ)
    this._idParamEyeLOpen = CubismFramework.getIdManager().getId(CubismDefaultParameterId.ParamEyeLOpen)
    this._idParamEyeROpen = CubismFramework.getIdManager().getId(CubismDefaultParameterId.ParamEyeROpen)
    this._idParamEyeBallX = CubismFramework.getIdManager().getId(CubismDefaultParameterId.ParamEyeBallX)
    this._idParamEyeBallY = CubismFramework.getIdManager().getId(CubismDefaultParameterId.ParamEyeBallY)
    this._idParamMouthOpenY = CubismFramework.getIdManager().getId(CubismDefaultParameterId.ParamMouthOpenY)
    this._idParamBodyAngleY = CubismFramework.getIdManager().getId(CubismDefaultParameterId.ParamBodyAngleY)
    this._idParamBodyAngleZ = CubismFramework.getIdManager().getId(CubismDefaultParameterId.ParamBodyAngleZ)
    this._idParamBreath = CubismFramework.getIdManager().getId(CubismDefaultParameterId.ParamBreath)
  }

  initBreath() {
    this._breath = CubismBreath.create()
    let breathParameters = new csmVector()
    breathParameters.pushBack(new BreathParameterData(this._idParamBreath, 0, 0.2, 6, 0.2))
    breathParameters.pushBack(new BreathParameterData(this._idParamBodyAngleY, 0, 0.1, 6, 0.1))
    this._breath.setParameters(breathParameters)
  }

  initMatrix() {
    let matrix = new CubismMatrix44()
    matrix.scale(Config.MODEL_SCALE, Config.MODEL_SCALE)
    matrix.translateRelative(Config.MODEL_OFFSET_X, Config.MODEL_OFFSET_Y)
    this.getRenderer().setMvpMatrix(matrix)
  }

  initGL() {
    this.gl.enable(this.gl.DEPTH_TEST)
    this.gl.depthFunc(this.gl.LEQUAL)
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT)
    this.gl.clearDepth(1.0)
    this.gl.enable(this.gl.BLEND)
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA)
  }

  draw(delta) {
    this._breath.updateParameters(this._model, delta)
    this._physics.evaluate(this._model, delta)
    this._model.update()
    this.getRenderer().drawModel()
    this.gl.flush()
  }
}
