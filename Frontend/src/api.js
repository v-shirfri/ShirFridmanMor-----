const API_BASE_URL = 'http://localhost:8001'

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

