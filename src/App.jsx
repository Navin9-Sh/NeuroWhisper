import { useState, useEffect } from 'react'
import LandingPage from './components/LandingPage'
import Dashboard from './components/Dashboard'
import TypingTest from './components/TypingTest'
import SpeechTest from './components/SpeechTest'
import ReactionTest from './components/ReactionTest'
import { getStoredData, calculateHealthScore } from './utils/analytics'

function App() {
  const [currentView, setCurrentView] = useState('landing')
  const [userData, setUserData] = useState(null)
  const [healthScore, setHealthScore] = useState(null)

  useEffect(() => {
    // Load existing data on mount
    const data = getStoredData()
    if (data && data.sessions && data.sessions.length > 0) {
      setUserData(data)
      const score = calculateHealthScore(data)
      setHealthScore(score)
    }
  }, [])

  const handleTestComplete = (testType, results) => {
    const timestamp = new Date().toISOString()
    const sessionData = {
      timestamp,
      type: testType,
      results
    }

    // Get existing data or create new
    const existingData = getStoredData() || { sessions: [], baseline: null }
    
    // Add new session
    existingData.sessions.push(sessionData)
    
    // Set baseline if first session of this type
    if (!existingData.baseline) {
      existingData.baseline = {}
    }
    if (!existingData.baseline[testType]) {
      existingData.baseline[testType] = results
    }

    // Save to localStorage
    localStorage.setItem('cognitiveHealthData', JSON.stringify(existingData))
    
    // Update state
    setUserData(existingData)
    const score = calculateHealthScore(existingData)
    setHealthScore(score)
    
    // Return to dashboard
    setCurrentView('dashboard')
  }

  const renderView = () => {
    switch(currentView) {
      case 'landing':
        return <LandingPage onStart={() => setCurrentView('dashboard')} />
      case 'dashboard':
        return (
          <Dashboard 
            userData={userData}
            healthScore={healthScore}
            onStartTest={(testType) => setCurrentView(testType)}
            onReset={() => {
              localStorage.removeItem('cognitiveHealthData')
              setUserData(null)
              setHealthScore(null)
              setCurrentView('landing')
            }}
          />
        )
      case 'typing':
        return (
          <TypingTest 
            onComplete={(results) => handleTestComplete('typing', results)}
            onBack={() => setCurrentView('dashboard')}
          />
        )
      case 'speech':
        return (
          <SpeechTest 
            onComplete={(results) => handleTestComplete('speech', results)}
            onBack={() => setCurrentView('dashboard')}
          />
        )
      case 'reaction':
        return (
          <ReactionTest 
            onComplete={(results) => handleTestComplete('reaction', results)}
            onBack={() => setCurrentView('dashboard')}
          />
        )
      default:
        return <LandingPage onStart={() => setCurrentView('dashboard')} />
    }
  }

return (
  <>
    <div className="grid-bg"></div>
    <div className="glow-orb glow-orb-1"></div>
    <div className="glow-orb glow-orb-2"></div>

    <div className="relative z-10 min-h-screen flex justify-center">
      <div className="w-full max-w-6xl px-6">
        {renderView()}
      </div>
    </div>
  </>
)
}

export default App