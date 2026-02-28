import { useState, useEffect, useRef } from 'react'

const sampleTexts = [
  "The quick brown fox jumps over the lazy dog near the riverbank.",
  "Cognitive health monitoring can help detect early signs of decline through behavioral patterns.",
  "Technology enables us to track subtle changes in how we interact with digital devices over time."
]

const TypingTest = ({ onComplete, onBack }) => {
  const [testStarted, setTestStarted] = useState(false)
  const [testComplete, setTestComplete] = useState(false)
  const [targetText] = useState(sampleTexts[Math.floor(Math.random() * sampleTexts.length)])
  const [typedText, setTypedText] = useState('')
  const [startTime, setStartTime] = useState(null)
  const [keystrokeData, setKeystrokeData] = useState([])
  const [results, setResults] = useState(null)
  const lastKeystrokeTime = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (testStarted && inputRef.current) {
      inputRef.current.focus()
    }
  }, [testStarted])

  const handleStart = () => {
    setTestStarted(true)
    setStartTime(Date.now())
    lastKeystrokeTime.current = Date.now()
  }

  const handleKeyPress = (e) => {
    if (!testStarted) return

    const currentTime = Date.now()
    const timeSinceLastKey = lastKeystrokeTime.current 
      ? currentTime - lastKeystrokeTime.current 
      : 0

    setKeystrokeData(prev => [...prev, {
      key: e.key,
      timestamp: currentTime,
      timeSinceLastKey
    }])

    lastKeystrokeTime.current = currentTime
  }

  const handleInputChange = (e) => {
    const value = e.target.value
    setTypedText(value)

    // Check if test is complete
    if (value === targetText) {
      completeTest(value)
    }
  }

  const completeTest = (finalText) => {
    setTestComplete(true)
    const endTime = Date.now()
    const totalTime = (endTime - startTime) / 1000 // seconds
    const wordCount = finalText.trim().split(/\s+/).length
    const wpm = Math.round((wordCount / totalTime) * 60)

    // Calculate accuracy
    const correctChars = finalText.split('').filter((char, idx) => char === targetText[idx]).length
    const accuracy = Math.round((correctChars / targetText.length) * 100)

    // Calculate pause metrics
    const pauses = keystrokeData.filter(k => k.timeSinceLastKey > 500) // pauses > 500ms
    const avgPauseTime = pauses.length > 0
      ? pauses.reduce((sum, p) => sum + p.timeSinceLastKey, 0) / pauses.length
      : 0

    // Calculate typing rhythm variance
    const keyTimes = keystrokeData.map(k => k.timeSinceLastKey).filter(t => t > 0)
    const avgKeyTime = keyTimes.reduce((sum, t) => sum + t, 0) / keyTimes.length
    const variance = keyTimes.reduce((sum, t) => sum + Math.pow(t - avgKeyTime, 2), 0) / keyTimes.length
    const standardDeviation = Math.sqrt(variance)

    const testResults = {
      wpm,
      accuracy,
      totalTime: totalTime.toFixed(2),
      pauseCount: pauses.length,
      avgPauseTime: avgPauseTime.toFixed(0),
      rhythmVariance: standardDeviation.toFixed(2),
      keystrokeCount: keystrokeData.length
    }

    setResults(testResults)
  }

  const handleSave = () => {
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
            <div className="text-6xl mb-4">⌨️</div>
            <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>
              Typing Pattern Test
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Type the displayed text as accurately as possible. We'll analyze your typing speed, 
              rhythm, and pause patterns to detect any irregularities.
            </p>
            
            <div className="bg-[var(--color-neural-light)] p-6 rounded-lg">
              <h3 className="text-lg font-bold mb-3">What we measure:</h3>
              <div className="grid md:grid-cols-2 gap-4 text-left text-sm">
                <div>
                  <span className="text-[var(--color-synapse)]">→</span> Words per minute (WPM)
                </div>
                <div>
                  <span className="text-[var(--color-synapse)]">→</span> Typing accuracy
                </div>
                <div>
                  <span className="text-[var(--color-synapse)]">→</span> Pause frequency & duration
                </div>
                <div>
                  <span className="text-[var(--color-synapse)]">→</span> Rhythm consistency
                </div>
              </div>
            </div>

            <button onClick={handleStart} className="btn-primary">
              Start Test
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (testComplete && results) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="neural-card space-y-6">
            <div className="text-center">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-4xl font-bold mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
                Test Complete!
              </h2>
              <p className="text-gray-400">Here are your results:</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-[var(--color-neural-light)] p-6 rounded-lg">
                <div className="text-3xl font-bold text-[var(--color-synapse)] mb-1">
                  {results.wpm}
                </div>
                <div className="text-sm text-gray-400">Words Per Minute</div>
              </div>

              <div className="bg-[var(--color-neural-light)] p-6 rounded-lg">
                <div className="text-3xl font-bold text-[var(--color-synapse)] mb-1">
                  {results.accuracy}%
                </div>
                <div className="text-sm text-gray-400">Accuracy</div>
              </div>

              <div className="bg-[var(--color-neural-light)] p-6 rounded-lg">
                <div className="text-3xl font-bold text-[var(--color-synapse)] mb-1">
                  {results.pauseCount}
                </div>
                <div className="text-sm text-gray-400">Pauses Detected</div>
              </div>

              <div className="bg-[var(--color-neural-light)] p-6 rounded-lg">
                <div className="text-3xl font-bold text-[var(--color-synapse)] mb-1">
                  {results.totalTime}s
                </div>
                <div className="text-sm text-gray-400">Total Time</div>
              </div>
            </div>

            <div className="bg-[var(--color-neural-light)] p-4 rounded-lg text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Rhythm Variance:</span>
                <span className="font-bold">{results.rhythmVariance}ms</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-gray-400">Avg Pause Duration:</span>
                <span className="font-bold">{results.avgPauseTime}ms</span>
              </div>
            </div>

            <button onClick={handleSave} className="btn-primary w-full">
              Save Results
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-3xl w-full">
        <div className="neural-card space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
              Type the text below
            </h2>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
              <span className="status-dot status-good pulse-active"></span>
              Recording in progress...
            </div>
          </div>

          {/* Target Text */}
          <div className="bg-[var(--color-neural-light)] p-6 rounded-lg">
            <div className="text-xl leading-relaxed font-mono">
              {targetText.split('').map((char, idx) => {
                let colorClass = 'text-gray-500'
                if (idx < typedText.length) {
                  colorClass = typedText[idx] === char ? 'text-green-400' : 'text-red-400'
                }
                return (
                  <span key={idx} className={colorClass}>
                    {char}
                  </span>
                )
              })}
            </div>
          </div>

          {/* Input Area */}
          <div>
            <textarea
              ref={inputRef}
              value={typedText}
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
              className="w-full h-32 bg-[var(--color-neural-mid)] border-2 border-[var(--color-synapse)] rounded-lg p-4 text-lg font-mono text-white resize-none focus:outline-none focus:border-[var(--color-pulse)]"
              placeholder="Start typing here..."
              autoFocus
            />
          </div>

          {/* Progress */}
          <div className="flex justify-between text-sm text-gray-400">
            <span>Progress: {typedText.length}/{targetText.length} characters</span>
            <span>{Math.round((typedText.length / targetText.length) * 100)}%</span>
          </div>

          <div className="w-full bg-[var(--color-neural-light)] rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(typedText.length / targetText.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default TypingTest