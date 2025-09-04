import { useEffect, useRef } from 'react'
import Matter from 'matter-js'

export default function CoinflipCanvas({ seed = 1, onEnd }) {
  const ref = useRef(null)
  useEffect(() => {
    const Engine = Matter.Engine
    const Render = Matter.Render
    const Runner = Matter.Runner
    const Bodies = Matter.Bodies
    const Body = Matter.Body
    const World = Matter.World

    const engine = Engine.create()
    const width = 300
    const height = 300
    const render = Render.create({ element: ref.current, engine, options: { width, height, wireframes: false, background: 'transparent' } })

    const ground = Bodies.rectangle(width / 2, height, width, 40, { isStatic: true })
    World.add(engine.world, [ground])
    const coin = Bodies.circle(width / 2, height / 2 - 80, 40, { restitution: 0.6, render: { fillStyle: '#D4AF37' } })
    Body.setAngularVelocity(coin, (seed % 10) / 5 + 1)
    Body.setVelocity(coin, { x: 0, y: 5 + (seed % 5) })
    World.add(engine.world, coin)

    Render.run(render)
    const runner = Runner.create()
    Runner.run(runner, engine)

    const t = setTimeout(() => {
      onEnd && onEnd(coin.angularVelocity)
    }, 2500)

    return () => {
      clearTimeout(t)
      Render.stop(render)
      Runner.stop(runner)
      Matter.Composite.clear(engine.world, false)
      Matter.Engine.clear(engine)
      render.canvas.remove()
      render.textures = {}
    }
  }, [seed, onEnd])
  return <div ref={ref} />
}

