import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const Dashboard = ({ userData, healthScore, onStartTest, onReset }) => {
  const hasData = userData && userData.sessions && userData.sessions.length > 0

  const getStatusInfo = (score) => {
    if (score >= 85) return { status: 'Excellent', color: 'status-good', message: 'Your cognitive patterns are stable and healthy' }
    if (score >= 70) return { status: 'Good', color: 'status-good', message: 'Minor variations detected, within normal range' }
    if (score >= 50) return { status: 'Monitor', color: 'status-warning', message: 'Some concerning patterns detected, continue monitoring' }
    return { status: 'Alert', color: 'status-alert', message: 'Significant deviations detected, consider professional consultation' }
  }

  const statusInfo = healthScore ? getStatusInfo(healthScore) : null

  // Prepare chart data
  const getChartData = () => {
    if (!hasData) return null

    const typingSessions = userData.sessions.filter(s => s.type === 'typing')
    const speechSessions = userData.sessions.filter(s => s.type === 'speech')
    const reactionSessions = userData.sessions.filter(s => s.type === 'reaction')

    return {
      labels: userData.sessions.map((_, idx) => `Session ${idx + 1}`),
      datasets: [
        {
          label: 'Typing Speed (WPM)',
          data: typingSessions.map(s => s.results.wpm || 0),
          borderColor: 'rgb(0, 245, 255)',
          backgroundColor: 'rgba(0, 245, 255, 0.1)',
          tension: 0.4,
          fill: true,
        },
        {
          label: 'Speech Fluency',
          data: speechSessions.map(s => 100 - (s.results.pauseCount * 2) || 0),
          borderColor: 'rgb(131, 56, 236)',
          backgroundColor: 'rgba(131, 56, 236, 0.1)',
          tension: 0.4,
          fill: true,
        },
        {
          label: 'Reaction Time (inverse)',
          data: reactionSessions.map(s => Math.max(0, 1000 - s.results.averageTime) / 10 || 0),
          borderColor: 'rgb(255, 0, 110)',
          backgroundColor: 'rgba(255, 0, 110, 0.1)',
          tension: 0.4,
          fill: true,
        }
      ]
    }
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#ffffff',
          font: { family: 'Space Mono' }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#00f5ff',
        bodyColor: '#ffffff',
        borderColor: '#00f5ff',
        borderWidth: 1,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: '#ffffff',
          font: { family: 'Space Mono' }
        }
      },
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: '#ffffff',
          font: { family: 'Space Mono' }
        }
      }
    }
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-black mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
              <span className="text-gradient">Dashboard</span>
            </h1>
            <p className="text-gray-400">Track your cognitive health patterns over time</p>
          </div>
          {hasData && (
            <button
              onClick={onReset}
              className="text-sm text-gray-400 hover:text-red-400 transition-colors underline"
            >
              Reset All Data
            </button>
          )}
        </div>

        {/* Health Score Card */}
        {hasData && healthScore !== null && (
          <div className="neural-card">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>
                  Cognitive Health Score
                </h2>
                <div className="flex items-center gap-4 mb-2">
                  <div className="text-6xl font-black text-gradient">{healthScore}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`status-dot ${statusInfo.color}`}></span>
                      <span className="text-xl font-bold">{statusInfo.status}</span>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">{statusInfo.message}</p>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-400 mb-1">Total Sessions</div>
                <div className="text-4xl font-bold text-[var(--color-synapse)]">
                  {userData.sessions.length}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Test Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <div 
            onClick={() => onStartTest('typing')}
            className="neural-card hover-lift cursor-pointer"
          >
            <div className="text-5xl mb-4">⌨️</div>
            <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
              Typing Test
            </h3>
            <p className="text-gray-400 mb-4">
              Measure typing speed, accuracy, and pause patterns
            </p>
            <div className="text-[var(--color-synapse)] font-bold text-sm">
              START TEST →
            </div>
            {hasData && (
              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="text-xs text-gray-500">
                  Completed: {userData.sessions.filter(s => s.type === 'typing').length} times
                </div>
              </div>
            )}
          </div>

          <div 
            onClick={() => onStartTest('speech')}
            className="neural-card hover-lift cursor-pointer"
          >
            <div className="text-5xl mb-4">🎤</div>
            <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
              Speech Test
            </h3>
            <p className="text-gray-400 mb-4">
              Analyze speech fluency and pause duration
            </p>
            <div className="text-[var(--color-synapse)] font-bold text-sm">
              START TEST →
            </div>
            {hasData && (
              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="text-xs text-gray-500">
                  Completed: {userData.sessions.filter(s => s.type === 'speech').length} times
                </div>
              </div>
            )}
          </div>

          <div 
            onClick={() => onStartTest('reaction')}
            className="neural-card hover-lift cursor-pointer"
          >
            <div className="text-5xl mb-4">⚡</div>
            <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
              Reaction Test
            </h3>
            <p className="text-gray-400 mb-4">
              Test cognitive processing speed and attention
            </p>
            <div className="text-[var(--color-synapse)] font-bold text-sm">
              START TEST →
            </div>
            {hasData && (
              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="text-xs text-gray-500">
                  Completed: {userData.sessions.filter(s => s.type === 'reaction').length} times
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Progress Chart */}
        {hasData && getChartData() && (
          <div className="neural-card">
            <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: 'Syne, sans-serif' }}>
              Performance Trends
            </h2>
            <div className="chart-container">
              <Line data={getChartData()} options={chartOptions} />
            </div>
          </div>
        )}

        {/* First Time Message */}
        {!hasData && (
          <div className="neural-card text-center py-12">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>
              Welcome! Let's establish your baseline
            </h3>
            <p className="text-gray-400 max-w-2xl mx-auto mb-6">
              Complete at least one test from each category to establish your cognitive baseline. 
              We'll track changes over time and alert you to any concerning patterns.
            </p>
            <p className="text-sm text-[var(--color-synapse)]">
              Click any test card above to begin →
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard