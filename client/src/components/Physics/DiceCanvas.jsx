import { useEffect, useRef } from 'react'
import Matter from 'matter-js'

export default function DiceCanvas({ seed = 1, onEnd }) {
  const ref = useRef(null)
  useEffect(() => {
    const { Engine, Render, Runner, Bodies, World, Body, Composite } = Matter
    const engine = Engine.create()
    const width = 320
    const height = 240
    const render = Render.create({ element: ref.current, engine, options: { width, height, wireframes: false, background: 'transparent' } })
    const ground = Bodies.rectangle(width / 2, height, width, 40, { isStatic: true })
    const left = Bodies.rectangle(0, height / 2, 20, height, { isStatic: true })
    const right = Bodies.rectangle(width, height / 2, 20, height, { isStatic: true })
    World.add(engine.world, [ground, left, right])

    const die = Bodies.rectangle(width / 2, 40, 40, 40, { restitution: 0.4, render: { fillStyle: '#ffffff' } })
    Body.setVelocity(die, { x: (seed % 5) - 2, y: 5 + (seed % 5) })
    Body.setAngularVelocity(die, (seed % 10) / 3)
    World.add(engine.world, die)

    Render.run(render)
    const runner = Runner.create()
    Runner.run(runner, engine)

    const t = setTimeout(() => {
      onEnd && onEnd(Math.floor((Math.abs(die.angle) % (Math.PI * 2)) / (Math.PI / 3)) + 1)
    }, 2500)

    return () => {
      clearTimeout(t)
      Render.stop(render)
      Runner.stop(runner)
      Composite.clear(engine.world, false)
      Engine.clear(engine)
      render.canvas.remove()
      render.textures = {}
    }
  }, [seed, onEnd])
  return <div ref={ref} />
}

