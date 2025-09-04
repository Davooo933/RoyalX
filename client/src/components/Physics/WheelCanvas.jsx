import { useEffect, useRef } from 'react'
import Matter from 'matter-js'

export default function WheelCanvas({ seed = 1, onStop }) {
  const ref = useRef(null)
  useEffect(() => {
    const { Engine, Render, Runner, Bodies, Constraint, World } = Matter
    const engine = Engine.create()
    const width = 320
    const height = 320
    const render = Render.create({ element: ref.current, engine, options: { width, height, wireframes: false, background: 'transparent' } })
    // wheel
    const wheel = Bodies.circle(width / 2, height / 2, 120, { restitution: 0.3, frictionAir: 0.02, render: { fillStyle: '#141421' } })
    const axle = Bodies.circle(width / 2, height / 2, 5, { isStatic: true, render: { fillStyle: '#D4AF37' } })
    const pin = Constraint.create({ bodyA: wheel, pointB: { x: width / 2, y: height / 2 }, stiffness: 0.1 })
    World.add(engine.world, [wheel, axle, pin])

    Matter.Body.setAngularVelocity(wheel, (seed % 8) + 4)

    Render.run(render)
    const runner = Runner.create()
    Runner.run(runner, engine)

    const t = setTimeout(() => {
      onStop && onStop(Math.floor((wheel.angle % (Math.PI * 2)) * 180 / Math.PI))
    }, 3000)

    return () => {
      clearTimeout(t)
      Render.stop(render)
      Runner.stop(runner)
      Matter.Composite.clear(engine.world, false)
      Matter.Engine.clear(engine)
      render.canvas.remove()
      render.textures = {}
    }
  }, [seed, onStop])
  return <div ref={ref} />
}

