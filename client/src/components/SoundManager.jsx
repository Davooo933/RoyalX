import { useEffect, useRef } from 'react'
import { Howl } from 'howler'

export default function SoundManager({ gameKey }) {
  const bgRef = useRef(null)
  useEffect(() => {
    if (bgRef.current) {
      bgRef.current.stop()
    }
    const loops = {
      'coinflip': 'https://cdn.pixabay.com/download/audio/2022/03/29/audio_1e89a8a7a0.mp3?filename=soft-ambient-110241.mp3',
      'dice': 'https://cdn.pixabay.com/download/audio/2022/03/29/audio_1e89a8a7a0.mp3?filename=soft-ambient-110241.mp3',
      'roulette': 'https://cdn.pixabay.com/download/audio/2022/10/27/audio_0b0e3a03fd.mp3?filename=future-ambient-124608.mp3',
      'slots': 'https://cdn.pixabay.com/download/audio/2023/02/27/audio_2ca8063c11.mp3?filename=chilled-ambience-139796.mp3',
      'default': 'https://cdn.pixabay.com/download/audio/2023/02/27/audio_2ca8063c11.mp3?filename=chilled-ambience-139796.mp3',
    }
    const src = loops[gameKey] || loops['default']
    const howl = new Howl({ src: [src], loop: true, volume: 0.25 })
    howl.play()
    bgRef.current = howl
    return () => howl.stop()
  }, [gameKey])
  return null
}

