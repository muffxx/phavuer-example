import { createApp, inject, watch, onBeforeUnmount } from 'vue'
import components from './components'
import setters from './setters'

export const Scene = components.Scene
export const Container = components.Container
export const Sprite = components.Sprite
export const Text = components.Text
export const Rectangle = components.Rectangle

export const createPhavuerApp = (game, component) => {
  const app = createApp(component)
  app.provide('game', game)
  app.provide('scene', null)
  app.provide('container', null)
  // mount Vue 3 app
  const dummyElement = window.document.createElement('div')
  document.body.appendChild(dummyElement)
  return app.mount(dummyElement)
}

export const initGameObject = (object, props, context) => {
  // Append to parent container
  const container = inject('container')
  if (container) {
    container.add([object])
  } else {
    const scene = inject('scene')
    scene.add.existing(object)
  }
  // Make it reactive
  Object.keys(props).forEach(key => {
    if (!setters[key]) return
    const setter = setters[key](object)
    setter(props[key])
    watch(() => props[key], setter)
  })
  // Set update event
  if (context.attrs.onCreate) context.emit('create', object)
  if (context.attrs.onUpdate) object.preUpdate = (...arg) => context.emit('update', object, ...arg)
  // Set interactive events
  if (context.attrs.onPointerdown || context.attrs.onPointerup) {
    object.setInteractive()
    if (context.attrs.onPointerdown) object.on('pointerdown', (...arg) => context.emit('pointerdown', ...arg))
    if (context.attrs.onPointerup) object.on('pointerup', (...arg) => context.emit('pointerup', ...arg))
  }
  // Destroy when unmounted
  onBeforeUnmount(() => object.destroy())
  return object
}
