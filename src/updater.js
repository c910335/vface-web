export default class {
  constructor(model) {
    this.model = model
    this.socket = new WebSocket('ws://localhost:5566')
    this.socket.onmessage = e => this.update(e.data)
  }

  update(data) {
    const [param, value] = data.split(' ')
    this.model._model.setParameterValueById(this.model[`_idParam${param}`], Number(value), 1)
  }
}
