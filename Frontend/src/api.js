const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001'

export async function checkHealth() {
  const response = await fetch(`${API_BASE_URL}/api/health`)
  if (!response.ok) throw new Error('Backend not reachable.')
  return response.json()
}

export async function listConversations() {
  const response = await fetch(`${API_BASE_URL}/api/conversations`)
  if (!response.ok) throw new Error('Failed to load conversations.')
  return response.json()
}

export async function createConversation() {
  const response = await fetch(`${API_BASE_URL}/api/conversations`, {
    method: 'POST',
  })
  if (!response.ok) throw new Error('Failed to create a new conversation.')
  return response.json()
}

export async function getConversationMessages(conversationId) {
  const response = await fetch(`${API_BASE_URL}/api/conversations/${conversationId}/messages`)
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.detail || 'Failed to load messages.')
  return data
}

export async function sendMessage(conversationId, message, effort = 'standard', image = null) {
  const body = { message, effort }
  if (image) body.image = image
  const response = await fetch(
    `${API_BASE_URL}/api/conversations/${conversationId}/messages`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  )
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.detail || 'Failed to send message.')
  return data
}

export async function sendMessageStream(conversationId, message, effort = 'standard', image = null, onChunk, onDone, onError) {
  const body = { message, effort }
  if (image) body.image = image

  let response
  try {
    response = await fetch(
      `${API_BASE_URL}/api/conversations/${conversationId}/messages/stream`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    )
  } catch {
    throw new Error('Could not connect to the server.')
  }

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error(data.detail || 'Failed to send message.')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const parts = buffer.split('\n\n')
    buffer = parts.pop() // keep any incomplete trailing chunk

    for (const part of parts) {
      const line = part.trim()
      if (!line.startsWith('data: ')) continue
      try {
        const event = JSON.parse(line.slice(6))
        if (event.type === 'chunk') onChunk(event.text)
        else if (event.type === 'done') onDone(event)
        else if (event.type === 'error') onError(new Error(event.detail))
      } catch {
        // malformed SSE line — skip
      }
    }
  }
}

