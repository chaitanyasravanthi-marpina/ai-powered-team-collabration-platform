import OpenAI from 'openai'

// Groq is OpenAI compatible
// We just change the baseURL and API key
const getOpenAI = () => {
  return new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1'
  })
}

// ─── Extract plain text from Quill Delta JSON ─────────────────
export const deltaToPlainText = (content) => {
  try {
    if (typeof content === 'string') return content

    if (content?.ops) {
      return content.ops
        .map(op => typeof op.insert === 'string' ? op.insert : '')
        .join('')
        .trim()
    }

    return JSON.stringify(content)

  } catch (error) {
    return ''
  }
}

// ─── Summarize Note ───────────────────────────────────────────
export const summarizeNote = async (noteContent, noteTitle) => {
  const openai = getOpenAI()

  const plainText = deltaToPlainText(noteContent)

  if (!plainText || plainText.length < 50) {
    throw new Error('Note is too short to summarize')
  }

  const truncated = plainText.split(' ').slice(0, 3000).join(' ')

  const response = await openai.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      {
        role: 'system',
        content: `You are a helpful assistant that summarizes team collaboration notes.
                  Be concise, clear, and highlight key decisions and action items.`
      },
      {
        role: 'user',
        content: `Please summarize this note titled "${noteTitle}":
                  
                  ${truncated}`
      }
    ],
    max_tokens: 500,
    temperature: 0.3
  })

  return response.choices[0].message.content
}

// ─── AI Workspace Assistant ───────────────────────────────────
export const askWorkspaceAssistant = async (question, notes) => {
  const openai = getOpenAI()

  if (!notes || notes.length === 0) {
    return "No notes found in this workspace to answer your question."
  }

  // Simple keyword search — basic RAG
  const questionWords = question.toLowerCase().split(' ')
    .filter(word => word.length > 3)

  const relevantNotes = notes.filter(note => {
    const noteText = deltaToPlainText(note.content).toLowerCase()
    const titleText = note.title.toLowerCase()
    return questionWords.some(word =>
      noteText.includes(word) || titleText.includes(word)
    )
  })

  const contextNotes = relevantNotes.length > 0
    ? relevantNotes.slice(0, 5)
    : notes.slice(0, 5)

  const context = contextNotes.map(note => `
    Title: ${note.title}
    Content: ${deltaToPlainText(note.content).slice(0, 500)}
    Created by: ${note.createdBy?.name || 'Unknown'}
    Date: ${new Date(note.createdAt).toLocaleDateString()}
  `).join('\n---\n')

  const response = await openai.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      {
        role: 'system',
        content: `You are an AI assistant for a team collaboration platform.
                  Answer questions based ONLY on the provided workspace notes.
                  If the answer is not in the notes, say so clearly.
                  Be concise and helpful.`
      },
      {
        role: 'user',
        content: `Based on these workspace notes:
                  
                  ${context}
                  
                  Answer this question: ${question}`
      }
    ],
    max_tokens: 600,
    temperature: 0.3
  })

  return response.choices[0].message.content
}