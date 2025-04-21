
const ELEVEN_LABS_API = "https://api.elevenlabs.io/v1";

export interface KnowledgeBase {
  knowledge_base_id: string;
  name: string;
}

export async function initializeKnowledgeBase(apiKey: string): Promise<KnowledgeBase> {
  try {
    // First try to get existing knowledge bases
    const response = await fetch(`${ELEVEN_LABS_API}/knowledge-bases`, {
      method: "GET",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // If there's an existing knowledge base, use it
    if (data.knowledge_bases && data.knowledge_bases.length > 0) {
      return data.knowledge_bases[0];
    }

    // If no knowledge base exists, create one
    const createResponse = await fetch(`${ELEVEN_LABS_API}/knowledge-bases`, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: "FileChatSage KB",
        description: "Knowledge base for FileChatSage documents"
      })
    });

    if (!createResponse.ok) {
      throw new Error(`HTTP error! status: ${createResponse.status}`);
    }

    return await createResponse.json();
  } catch (error) {
    console.error("Failed to initialize knowledge base:", error);
    throw error;
  }
}

export async function fetchDocuments(apiKey: string, knowledgeBaseId: string) {
  const response = await fetch(`${ELEVEN_LABS_API}/knowledge-bases/${knowledgeBaseId}/documents`, {
    method: "GET",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

export async function uploadDocument(apiKey: string, knowledgeBaseId: string, file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${ELEVEN_LABS_API}/knowledge-bases/${knowledgeBaseId}/documents/create`, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey
    },
    body: formData
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

export async function deleteDocument(apiKey: string, knowledgeBaseId: string, documentId: string) {
  const response = await fetch(`${ELEVEN_LABS_API}/knowledge-bases/${knowledgeBaseId}/documents/${documentId}`, {
    method: "DELETE",
    headers: {
      "xi-api-key": apiKey
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}
