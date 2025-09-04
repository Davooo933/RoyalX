import { useEffect, useRef } from 'react'
import Matter from 'matter-js'

export default function PlinkoCanvas({ seed = 123, onEnd }) {
  const ref = useRef(null)
  useEffect(() => {
    const Engine = Matter.Engine
    const Render = Matter.Render
    const Runner = Matter.Runner
    const Bodies = Matter.Bodies
    const World = Matter.World
    const Composite = Matter.Composite

    const engine = Engine.create()
    const width = 400
    const height = 400
    const render = Render.create({ element: ref.current, engine, options: { width, height, wireframes: false, background: 'transparent' } })

    // pegs
    const pegs = []
    const rows = 10
    const cols = 11
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = 20 + c * 35 + (r % 2 === 0 ? 0 : 17)
        const y = 40 + r * 30
        pegs.push(Bodies.circle(x, y, 4, { isStatic: true, render: { fillStyle: '#D4AF37' } }))
      }
    }

    // walls
    const ground = Bodies.rectangle(width / 2, height - 10, width, 20, { isStatic: true })
    const left = Bodies.rectangle(0, height / 2, 20, height, { isStatic: true })
    const right = Bodies.rectangle(width, height / 2, 20, height, { isStatic: true })

    World.add(engine.world, [ground, left, right, ...pegs])

    // ball
    const xStart = width / 2 + ((seed % 100) - 50)
    const ball = Bodies.circle(xStart, 0, 8, { restitution: 0.4, render: { fillStyle: '#ffffff' } })
    World.add(engine.world, ball)

    Render.run(render)
    const runner = Runner.create()
    Runner.run(runner, engine)

    const interval = setInterval(() => {
      if (ball.position.y > height - 20) {
        onEnd && onEnd(ball.position.x)
        clearInterval(interval)
      }
    }, 200)

    return () => {
      clearInterval(interval)
      Render.stop(render)
      Runner.stop(runner)
      Composite.clear(engine.world, false)
      Engine.clear(engine)
      render.canvas.remove()
      render.textures = {}
    }
  }, [seed, onEnd])

  return <div ref={ref} className="w-full h-full" />
}

