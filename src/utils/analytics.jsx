// Analytics and data processing utilities

export const getStoredData = () => {
  const data = localStorage.getItem('cognitiveHealthData')
  return data ? JSON.parse(data) : null
}

export const calculateHealthScore = (userData) => {
  if (!userData || !userData.sessions || userData.sessions.length === 0) {
    return null
  }

  const { sessions, baseline } = userData
  let totalScore = 0
  let scoreCount = 0

  // Analyze each test type
  const testTypes = ['typing', 'speech', 'reaction']
  
  testTypes.forEach(testType => {
    const testSessions = sessions.filter(s => s.type === testType)
    if (testSessions.length === 0) return

    // Get baseline for this test type
    const baselineData = baseline && baseline[testType] ? baseline[testType] : testSessions[0].results

    // Get most recent session
    const recentSession = testSessions[testSessions.length - 1].results

    // Calculate score based on test type
    let typeScore = 100

    if (testType === 'typing') {
      // Compare WPM (words per minute)
      const wpmDeviation = Math.abs(recentSession.wpm - baselineData.wpm) / baselineData.wpm
      typeScore -= wpmDeviation * 50

      // Compare pause patterns
      if (baselineData.pauseCount > 0) {
        const pauseDeviation = Math.abs(recentSession.pauseCount - baselineData.pauseCount) / baselineData.pauseCount
        typeScore -= pauseDeviation * 30
      }

      // Compare rhythm variance
      if (baselineData.rhythmVariance > 0) {
        const varianceDeviation = Math.abs(recentSession.rhythmVariance - baselineData.rhythmVariance) / baselineData.rhythmVariance
        typeScore -= varianceDeviation * 20
      }
    }

    if (testType === 'speech') {
      // Compare fluency score
      const fluencyDeviation = Math.abs(recentSession.fluencyScore - baselineData.fluencyScore) / 100
      typeScore -= fluencyDeviation * 40

      // Compare pause count
      if (baselineData.pauseCount > 0) {
        const pauseDeviation = Math.abs(recentSession.pauseCount - baselineData.pauseCount) / baselineData.pauseCount
        typeScore -= pauseDeviation * 30
      }

      // Compare words per minute
      if (baselineData.wordsPerMinute > 0) {
        const wpmDeviation = Math.abs(recentSession.wordsPerMinute - baselineData.wordsPerMinute) / baselineData.wordsPerMinute
        typeScore -= wpmDeviation * 30
      }
    }

    if (testType === 'reaction') {
      // Compare average reaction time
      const timeDeviation = Math.abs(recentSession.averageTime - baselineData.averageTime) / baselineData.averageTime
      typeScore -= timeDeviation * 50

      // Compare consistency
      if (baselineData.consistency > 0) {
        const consistencyDeviation = Math.abs(recentSession.consistency - baselineData.consistency) / baselineData.consistency
        typeScore -= consistencyDeviation * 50
      }
    }

    // Ensure score is within bounds
    typeScore = Math.max(0, Math.min(100, typeScore))
    totalScore += typeScore
    scoreCount++
  })

  // Calculate average score across all test types
  const finalScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 100

  return finalScore
}

export const getTrendData = (userData, testType) => {
  if (!userData || !userData.sessions) return []

  const sessions = userData.sessions.filter(s => s.type === testType)
  
  return sessions.map((session, index) => ({
    session: index + 1,
    timestamp: new Date(session.timestamp).toLocaleDateString(),
    ...session.results
  }))
}

export const getInsights = (userData) => {
  if (!userData || !userData.sessions || userData.sessions.length < 2) {
    return []
  }

  const insights = []
  const { sessions, baseline } = userData

  // Typing insights
  const typingSessions = sessions.filter(s => s.type === 'typing')
  if (typingSessions.length >= 2) {
    const recent = typingSessions[typingSessions.length - 1].results
    const base = baseline?.typing || typingSessions[0].results

    if (recent.wpm < base.wpm * 0.8) {
      insights.push({
        type: 'warning',
        category: 'Typing',
        message: 'Typing speed has decreased significantly',
        detail: `Current: ${recent.wpm} WPM, Baseline: ${base.wpm} WPM`
      })
    }

    if (recent.pauseCount > base.pauseCount * 1.5) {
      insights.push({
        type: 'warning',
        category: 'Typing',
        message: 'Increased pause frequency detected',
        detail: `Current: ${recent.pauseCount} pauses, Baseline: ${base.pauseCount} pauses`
      })
    }
  }

  // Speech insights
  const speechSessions = sessions.filter(s => s.type === 'speech')
  if (speechSessions.length >= 2) {
    const recent = speechSessions[speechSessions.length - 1].results
    const base = baseline?.speech || speechSessions[0].results

    if (recent.fluencyScore < base.fluencyScore * 0.8) {
      insights.push({
        type: 'warning',
        category: 'Speech',
        message: 'Speech fluency has decreased',
        detail: `Current score: ${recent.fluencyScore}, Baseline: ${base.fluencyScore}`
      })
    }

    if (recent.pauseCount > base.pauseCount * 1.5) {
      insights.push({
        type: 'warning',
        category: 'Speech',
        message: 'More frequent speech pauses detected',
        detail: `Current: ${recent.pauseCount} pauses, Baseline: ${base.pauseCount} pauses`
      })
    }
  }

  // Reaction insights
  const reactionSessions = sessions.filter(s => s.type === 'reaction')
  if (reactionSessions.length >= 2) {
    const recent = reactionSessions[reactionSessions.length - 1].results
    const base = baseline?.reaction || reactionSessions[0].results

    if (recent.averageTime > base.averageTime * 1.3) {
      insights.push({
        type: 'alert',
        category: 'Reaction',
        message: 'Reaction time has slowed significantly',
        detail: `Current: ${recent.averageTime}ms, Baseline: ${base.averageTime}ms`
      })
    }

    if (recent.consistency > base.consistency * 1.5) {
      insights.push({
        type: 'warning',
        category: 'Reaction',
        message: 'Reaction time consistency has decreased',
        detail: 'More variability in response times'
      })
    }
  }

  // If no warnings, add positive insight
  if (insights.length === 0 && sessions.length >= 3) {
    insights.push({
      type: 'success',
      category: 'Overall',
      message: 'Cognitive patterns remain stable',
      detail: 'All metrics are within normal range'
    })
  }

  return insights
}

export const exportData = (userData) => {
  const dataStr = JSON.stringify(userData, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = `cognitive-health-data-${new Date().toISOString().split('T')[0]}.json`
  link.click()
  URL.revokeObjectURL(url)
}