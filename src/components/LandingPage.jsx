import { useState } from 'react'

const LandingPage = ({ onStart }) => {
  const [showInfo, setShowInfo] = useState(false)

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 overflow-x-hidden">
      <div className="max-w-4xl w-full mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12 space-y-6">
          <div className="inline-block">
            <div className="relative">
              <h1 className="text-7xl md:text-8xl font-black mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>
                <span className="text-gradient">MindTrack</span>
              </h1>
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-xl opacity-70 animate-pulse"></div>
            </div>
          </div>
          
          <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Early cognitive health monitoring through{' '}
            <span className="text-[var(--color-synapse)] font-bold">behavioral pattern analysis</span>
          </p>

          <div className="flex flex-wrap gap-4 justify-center items-center text-sm text-gray-400 pt-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Non-invasive</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span>Privacy-first</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
              <span>Real-time insights</span>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="neural-card hover-lift p-6">
            <div className="text-4xl mb-4">⌨️</div>
            <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
              Typing Patterns
            </h3>
            <p className="text-gray-400 text-sm">
              Analyze keystroke dynamics, pauses, and typing rhythm for cognitive indicators
            </p>
          </div>

          <div className="neural-card hover-lift p-6">
            <div className="text-4xl mb-4">🎤</div>
            <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
              Speech Analysis
            </h3>
            <p className="text-gray-400 text-sm">
              Detect speech pauses, word-finding difficulties, and verbal fluency changes
            </p>
          </div>

          <div className="neural-card hover-lift p-6">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
              Response Time
            </h3>
            <p className="text-gray-400 text-sm">
              Track cognitive processing speed through reaction time measurements
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center space-y-6">
          <button 
            onClick={onStart}
            className="btn-primary text-lg px-12 py-4 relative z-10"
          >
            Start Monitoring
          </button>

          <button
            onClick={() => setShowInfo(!showInfo)}
            className="block mx-auto text-gray-400 hover:text-[var(--color-synapse)] transition-colors text-sm underline"
          >
            How does it work?
          </button>

          {showInfo && (
            <div className="neural-card max-w-2xl mx-auto text-left space-y-4 animate-fadeIn">
              <h4 className="text-lg font-bold text-[var(--color-synapse)]" style={{ fontFamily: 'Syne, sans-serif' }}>
                Science-Backed Approach
              </h4>
              <div className="space-y-3 text-sm text-gray-300">
                <p>
                  <strong className="text-white">Behavioral Biomarkers:</strong> Research shows that subtle changes in typing speed, speech patterns, and reaction times can appear years before cognitive symptoms become noticeable.
                </p>
                <p>
                  <strong className="text-white">Baseline Comparison:</strong> We establish your personal baseline in the first session, then track deviations over time to identify concerning patterns.
                </p>
                <p>
                  <strong className="text-white">Privacy First:</strong> All data is stored locally on your device. No personal information is transmitted to external servers.
                </p>
                <p className="text-yellow-400 text-xs pt-2 border-t border-gray-700">
                  ⚠️ Disclaimer: This tool is for awareness purposes only and is NOT a medical diagnostic tool. Consult healthcare professionals for medical advice.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-gray-500 text-xs">
          <p>Built for early cognitive health awareness | Data stored locally</p>
        </div>
      </div>
    </div>
  )
}

export default LandingPage