import { useState, useEffect, useRef } from 'react'

const ReactionTest = ({ onComplete, onBack }) => {
  const [testStarted, setTestStarted] = useState(false)
  const [testPhase, setTestPhase] = useState('waiting') // waiting, ready, go, clicked, complete
  const [round, setRound] = useState(0)
  const [reactionTimes, setReactionTimes] = useState([])
  const [startTime, setStartTime] = useState(null)
  const [tooEarly, setTooEarly] = useState(false)
  const timeoutRef = useRef(null)
  const totalRounds = 5

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const handleStart = () => {
    setTestStarted(true)
    startRound()
  }

  const startRound = () => {
    setTestPhase('waiting')
    setTooEarly(false)
    
    // Random delay between 2-5 seconds
    const delay = 2000 + Math.random() * 3000
    
    timeoutRef.current = setTimeout(() => {
      setTestPhase('go')
      setStartTime(Date.now())
    }, delay)
  }

  const handleClick = () => {
    if (testPhase === 'waiting') {
      setTooEarly(true)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      setTimeout(() => {
        startRound()
      }, 1500)
      return
    }

    if (testPhase === 'go') {
      const reactionTime = Date.now() - startTime
      setReactionTimes(prev => [...prev, reactionTime])
      setTestPhase('clicked')

      setTimeout(() => {
        if (round + 1 < totalRounds) {
          setRound(round + 1)
          startRound()
        } else {
          completeTest([...reactionTimes, reactionTime])
        }
      }, 1000)
    }
  }

  const completeTest = (times) => {
    setTestPhase('complete')
    const avgTime = times.reduce((sum, t) => sum + t, 0) / times.length
    const minTime = Math.min(...times)
    const maxTime = Math.max(...times)
    
    // Calculate consistency (standard deviation)
    const variance = times.reduce((sum, t) => sum + Math.pow(t - avgTime, 2), 0) / times.length
    const stdDev = Math.sqrt(variance)

    const results = {
      averageTime: Math.round(avgTime),
      minTime,
      maxTime,
      consistency: Math.round(stdDev),
      allTimes: times,
      roundsCompleted: totalRounds
    }

    onComplete(results)
  }

  if (!testStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <button
            onClick={onBack}
            className="text-gray-400 hover:text-white mb-8 flex items-center gap-2 transition-colors"
          >
            ← Back to Dashboard
          </button>

          <div className="neural-card text-center space-y-6">
            <div className="text-6xl mb-4">⚡</div>
            <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>
              Reaction Time Test
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Test your cognitive processing speed and attention. Click as fast as you can 
              when the screen turns green. Complete 5 rounds for accurate results.
            </p>
            
            <div className="bg-[var(--color-neural-light)] p-6 rounded-lg">
              <h3 className="text-lg font-bold mb-3">What we measure:</h3>
              <div className="grid md:grid-cols-2 gap-4 text-left text-sm">
                <div>
                  <span className="text-[var(--color-synapse)]">→</span> Average reaction time
                </div>
                <div>
                  <span className="text-[var(--color-synapse)]">→</span> Response consistency
                </div>
                <div>
                  <span className="text-[var(--color-synapse)]">→</span> Attention stability
                </div>
                <div>
                  <span className="text-[var(--color-synapse)]">→</span> Processing speed
                </div>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-sm text-blue-300">
              💡 Tip: Stay focused and don't click until you see green!
            </div>

            <button onClick={handleStart} className="btn-primary">
              Start Test
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (testPhase === 'complete') {
    return null // The onComplete callback will handle navigation
  }

  const getBackgroundColor = () => {
    if (tooEarly) return 'bg-red-600'
    if (testPhase === 'waiting') return 'bg-red-900'
    if (testPhase === 'go') return 'bg-green-500'
    if (testPhase === 'clicked') return 'bg-blue-600'
    return 'bg-[var(--color-neural-dark)]'
  }

  const getMessage = () => {
    if (tooEarly) return 'Too early! Wait for green...'
    if (testPhase === 'waiting') return 'Wait for green...'
    if (testPhase === 'go') return 'CLICK NOW!'
    if (testPhase === 'clicked') return `${reactionTimes[reactionTimes.length - 1]}ms`
    return ''
  }

  return (
    <div 
      className={`min-h-screen flex items-center justify-center p-4 transition-all duration-300 cursor-pointer ${getBackgroundColor()}`}
      onClick={handleClick}
    >
      <div className="text-center space-y-8">
        <div className="text-white text-6xl md:text-8xl font-black" style={{ fontFamily: 'Syne, sans-serif' }}>
          {getMessage()}
        </div>

        <div className="text-white text-2xl">
          Round {round + 1} / {totalRounds}
        </div>

        {reactionTimes.length > 0 && (
          <div className="bg-black/30 backdrop-blur-lg rounded-lg p-6 max-w-md mx-auto">
            <div className="text-white text-sm mb-2">Previous Times:</div>
            <div className="flex gap-2 justify-center flex-wrap">
              {reactionTimes.map((time, idx) => (
                <div key={idx} className="bg-white/20 rounded px-3 py-1 text-white text-sm">
                  {time}ms
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-white/70 text-sm">
          {testPhase === 'waiting' ? 'Get ready...' : ''}
        </div>
      </div>
    </div>
  )
}

export default ReactionTest