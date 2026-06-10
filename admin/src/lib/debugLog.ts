type DebugPayload = {
  runId?: string
  hypothesisId: string
  location: string
  message: string
  data?: Record<string, unknown>
}

export function debugLog(payload: DebugPayload) {
  // #region agent log
  fetch('http://127.0.0.1:7933/ingest/f1a139e3-2004-4935-a126-1e2f98a5c88e', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '94b795' },
    body: JSON.stringify({
      sessionId: '94b795',
      runId: payload.runId || 'pre-fix',
      hypothesisId: payload.hypothesisId,
      location: payload.location,
      message: payload.message,
      data: payload.data || {},
      timestamp: Date.now()
    })
  }).catch(() => {})
  // #endregion
}

