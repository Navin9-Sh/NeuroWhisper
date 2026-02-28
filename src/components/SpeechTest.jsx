import { useState, useRef } from 'react'

const prompts = [
  "Describe your morning routine in detail.",
  "Tell me about your favorite childhood memory.",
  "Explain how you would teach someone to make your favorite meal.",
  "Describe the last vacation or trip you took."
]

const SpeechTest = ({ onComplete, onBack }) => {
  const [testStarted, setTestStarted] = useState(false)
  const [recording, setRecording] = useState(false)
  const [testComplete, setTestComplete] = useState(false)
  const [prompt] = useState(prompts[Math.floor(Math.random() * prompts.length)])
  const [results, setResults] = useState(null)
  const [timer, setTimer] = useState(0)
  const [transcript, setTranscript] = useState('')
  
  const mediaRecorder = useRef(null)
  const audioChunks = useRef([])
  const recognitionRef = useRef(null)
  const timerInterval = useRef(null)
  const silenceTimeouts = useRef([])
  const pauseData = useRef([])
  const lastWordTime = useRef(null)

  const handleStart = () => {
    setTestStarted(true)
  }

  const startRecording = async () => {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      // Setup MediaRecorder
      mediaRecorder.current = new MediaRecorder(stream)
      audioChunks.current = []

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data)
      }

      // Setup Web Speech API for pause detection
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = true
        recognitionRef.current.interimResults = true
        
        let lastSpeechTime = Date.now()
        
        recognitionRef.current.onresult = (event) => {
          const current = event.resultIndex
          const transcriptPiece = event.results[current][0].transcript
          
          if (event.results[current].isFinal) {
            setTranscript(prev => prev + ' ' + transcriptPiece)
            
            // Record pause if there was silence
            const currentTime = Date.now()
            if (lastWordTime.current) {
              const pauseDuration = currentTime - lastWordTime.current
              if (pauseDuration > 500) { // Pause longer than 500ms
                pauseData.current.push({
                  duration: pauseDuration,
                  timestamp: currentTime
                })
              }
            }
            lastWordTime.current = currentTime
          }
        }

        recognitionRef.current.start()
      }

      // Start recording
      mediaRecorder.current.start()
      setRecording(true)
      lastWordTime.current = Date.now()

      // Start timer
      timerInterval.current = setInterval(() => {
        setTimer(prev => prev + 1)
      }, 1000)

      // Auto-stop after 60 seconds
      setTimeout(() => {
        if (recording) {
          stopRecording()
        }
      }, 60000)

    } catch (error) {
      console.error('Error accessing microphone:', error)
      alert('Unable to access microphone. Please grant permission and try again.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
      mediaRecorder.current.stop()
      
      // Stop all tracks
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop())
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }

    if (timerInterval.current) {
      clearInterval(timerInterval.current)
    }

    setRecording(false)
    analyzeResults()
  }

  const analyzeResults = () => {
    const wordCount = transcript.trim().split(/\s+/).filter(w => w.length > 0).length
    const wordsPerMinute = Math.round((wordCount / timer) * 60)
    
    // Calculate pause metrics
    const pauseCount = pauseData.current.length
    const avgPauseDuration = pauseCount > 0
      ? pauseData.current.reduce((sum, p) => sum + p.duration, 0) / pauseCount
      : 0
    
    // Calculate speech fluency score (inverse of pauses)
    const fluencyScore = Math.max(0, 100 - (pauseCount * 5))

    const testResults = {
      duration: timer,
      wordCount,
      wordsPerMinute,
      pauseCount,
      avgPauseDuration: Math.round(avgPauseDuration),
      fluencyScore,
      transcriptLength: transcript.length
    }

    setResults(testResults)
    setTestComplete(true)
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
            <div className="text-6xl mb-4">🎤</div>
            <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>
              Speech Pattern Test
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Speak naturally about the given prompt for 30-60 seconds. 
              We'll analyze your speech fluency, pause patterns, and verbal processing.
            </p>
            
            <div className="bg-[var(--color-neural-light)] p-6 rounded-lg">
              <h3 className="text-lg font-bold mb-3">What we measure:</h3>
              <div className="grid md:grid-cols-2 gap-4 text-left text-sm">
                <div>
                  <span className="text-[var(--color-synapse)]">→</span> Speech fluency
                </div>
                <div>
                  <span className="text-[var(--color-synapse)]">→</span> Pause frequency
                </div>
                <div>
                  <span className="text-[var(--color-synapse)]">→</span> Average pause duration
                </div>
                <div>
                  <span className="text-[var(--color-synapse)]">→</span> Words per minute
                </div>
              </div>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-sm text-yellow-300">
              ⚠️ This test requires microphone access. Please allow when prompted.
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
                  {results.fluencyScore}
                </div>
                <div className="text-sm text-gray-400">Fluency Score</div>
              </div>

              <div className="bg-[var(--color-neural-light)] p-6 rounded-lg">
                <div className="text-3xl font-bold text-[var(--color-synapse)] mb-1">
                  {results.wordsPerMinute}
                </div>
                <div className="text-sm text-gray-400">Words Per Minute</div>
              </div>

              <div className="bg-[var(--color-neural-light)] p-6 rounded-lg">
                <div className="text-3xl font-bold text-[var(--color-synapse)] mb-1">
                  {results.pauseCount}
                </div>
                <div className="text-sm text-gray-400">Pauses Detected</div>
              </div>

              <div className="bg-[var(--color-neural-light)] p-6 rounded-lg">
                <div className="text-3xl font-bold text-[var(--color-synapse)] mb-1">
                  {results.duration}s
                </div>
                <div className="text-sm text-gray-400">Recording Duration</div>
              </div>
            </div>

            <div className="bg-[var(--color-neural-light)] p-4 rounded-lg text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total Words:</span>
                <span className="font-bold">{results.wordCount}</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-gray-400">Avg Pause Duration:</span>
                <span className="font-bold">{results.avgPauseDuration}ms</span>
              </div>
            </div>

            {transcript && (
              <div className="bg-[var(--color-neural-light)] p-4 rounded-lg">
                <div className="text-sm text-gray-400 mb-2">Transcript:</div>
                <div className="text-sm text-gray-300 max-h-40 overflow-y-auto">
                  {transcript}
                </div>
              </div>
            )}

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
      <div className="max-w-2xl w-full">
        <div className="neural-card space-y-6">
          {!recording ? (
            <>
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-6" style={{ fontFamily: 'Syne, sans-serif' }}>
                  Ready to Record
                </h2>
                <div className="bg-[var(--color-neural-light)] p-8 rounded-lg mb-6">
                  <div className="text-xl text-[var(--color-synapse)] font-bold mb-2">
                    Your Prompt:
                  </div>
                  <div className="text-2xl leading-relaxed">
                    "{prompt}"
                  </div>
                </div>
                <p className="text-gray-400 mb-6">
                  Click the button below to start recording. Speak naturally and clearly.
                  The test will automatically stop after 60 seconds, or you can stop manually.
                </p>
              </div>

              <button 
                onClick={startRecording}
                className="btn-primary w-full text-xl py-6"
              >
                🎤 Start Recording
              </button>
            </>
          ) : (
            <>
              <div className="text-center">
                <div className="text-6xl mb-4 animate-pulse">🎤</div>
                <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
                  Recording...
                </h2>
                <div className="text-5xl font-bold text-[var(--color-synapse)] mb-4">
                  {timer}s
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                  <span className="status-dot status-alert pulse-active"></span>
                  Listening and analyzing...
                </div>
              </div>

              <div className="bg-[var(--color-neural-light)] p-6 rounded-lg">
                <div className="text-sm text-gray-400 mb-2">Live Transcript:</div>
                <div className="text-lg min-h-[100px] max-h-[200px] overflow-y-auto">
                  {transcript || 'Start speaking...'}
                </div>
              </div>

              <div className="bg-[var(--color-neural-light)] p-4 rounded-lg text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Words spoken:</span>
                  <span className="font-bold">
                    {transcript.trim().split(/\s+/).filter(w => w.length > 0).length}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-gray-400">Pauses detected:</span>
                  <span className="font-bold">{pauseData.current.length}</span>
                </div>
              </div>

              <button 
                onClick={stopRecording}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-lg transition-colors"
              >
                Stop Recording
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default SpeechTest