type DebugPayload = {
  runId?: string
  hypothesisId: string
  location: string
  message: string
  data?: Record<string, unknown>
}

export function debugLog(payload: DebugPayload) {
  if (!import.meta.dev) return

  console.debug('[admin-debug]', {
    runId: payload.runId || 'local',
    hypothesisId: payload.hypothesisId,
    location: payload.location,
    message: payload.message,
    data: payload.data || {},
    timestamp: Date.now()
  })
}
