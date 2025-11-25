/**
 * 백엔드 API 클라이언트
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// ============ Types ============

export interface LLMModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  context_length: number;
  korean_support: boolean;
}

export interface EmbeddingModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  dimension: number;
  korean_support: boolean;
  max_tokens: number;
}

export interface ModelsResponse {
  llm: LLMModel[];
  embedding: EmbeddingModel[];
}

export interface Document {
  id: string;
  filename: string;
  filePath: string;
  fileType: string;
  fileSize: string;
  collectionName: string;
  chunkCount: string;
  embeddingModel: string;
  createdAt: string;
}

export interface Pipeline {
  id: string;
  name: string;
  description: string;
  blocks: any[];
  edges: any[];
  author: string;
  createdAt: string;
  updatedAt: string;
}

export interface QueryResponse {
  answer: string;
  sources: Array<{
    content: string;
    metadata: Record<string, any>;
    distance: number;
  }>;
  model_used: string;
}

export interface RunResponse {
  success: boolean;
  steps: Array<{
    blockId: string;
    blockType: string;
    blockName: string;
    status: string;
    output: any;
  }>;
  final_output: any;
  error: string | null;
}

// ============ API Functions ============

async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `API Error: ${response.status}`);
  }

  return response.json();
}

// ============ Models API ============

export async function getAvailableModels(): Promise<ModelsResponse> {
  return fetchAPI<ModelsResponse>('/models');
}

export async function getLLMModels(): Promise<LLMModel[]> {
  return fetchAPI<LLMModel[]>('/models/llm');
}

export async function getEmbeddingModels(): Promise<EmbeddingModel[]> {
  return fetchAPI<EmbeddingModel[]>('/models/embedding');
}

// ============ Upload API ============

export async function uploadFile(file: File): Promise<{
  id: string;
  filename: string;
  fileType: string;
  fileSize: number;
  message: string;
}> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Upload failed' }));
    throw new Error(error.detail);
  }

  return response.json();
}

export async function processDocument(
  documentId: string,
  embeddingModel: string = 'all-MiniLM-L6-v2',
  embeddingProvider: string = 'huggingface',
  chunkSize: number = 500,
  chunkOverlap: number = 50
): Promise<{
  id: string;
  filename: string;
  chunkCount: number;
  collectionName: string;
  embeddingModel: string;
  message: string;
}> {
  return fetchAPI('/upload/process', {
    method: 'POST',
    body: JSON.stringify({
      document_id: documentId,
      embedding_model: embeddingModel,
      embedding_provider: embeddingProvider,
      chunk_size: chunkSize,
      chunk_overlap: chunkOverlap,
    }),
  });
}

export async function getDocuments(): Promise<Document[]> {
  return fetchAPI<Document[]>('/upload/documents');
}

export async function deleteDocument(documentId: string): Promise<{ message: string }> {
  return fetchAPI(`/upload/documents/${documentId}`, {
    method: 'DELETE',
  });
}

// ============ Query API ============

export async function queryDocuments(params: {
  question: string;
  collection_name: string;
  llm_provider?: string;
  llm_model?: string;
  embedding_provider?: string;
  embedding_model?: string;
  top_k?: number;
  temperature?: number;
  max_tokens?: number;
  system_prompt?: string;
}): Promise<QueryResponse> {
  return fetchAPI('/query', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function chat(params: {
  question: string;
  llm_provider?: string;
  llm_model?: string;
  system_prompt?: string;
  temperature?: number;
  max_tokens?: number;
}): Promise<{ answer: string; model_used: string }> {
  const searchParams = new URLSearchParams();
  searchParams.append('question', params.question);
  if (params.llm_provider) searchParams.append('llm_provider', params.llm_provider);
  if (params.llm_model) searchParams.append('llm_model', params.llm_model);
  if (params.system_prompt) searchParams.append('system_prompt', params.system_prompt);
  if (params.temperature) searchParams.append('temperature', params.temperature.toString());
  if (params.max_tokens) searchParams.append('max_tokens', params.max_tokens.toString());

  return fetchAPI(`/query/chat?${searchParams.toString()}`, {
    method: 'POST',
  });
}

// ============ Pipeline API ============

export async function getPipelines(): Promise<Pipeline[]> {
  return fetchAPI<Pipeline[]>('/pipelines');
}

export async function getPipeline(pipelineId: string): Promise<Pipeline> {
  return fetchAPI<Pipeline>(`/pipelines/${pipelineId}`);
}

export async function createPipeline(data: {
  name: string;
  description?: string;
  blocks: any[];
  edges: any[];
  author?: string;
}): Promise<Pipeline> {
  return fetchAPI('/pipelines', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updatePipeline(
  pipelineId: string,
  data: {
    name?: string;
    description?: string;
    blocks?: any[];
    edges?: any[];
  }
): Promise<Pipeline> {
  return fetchAPI(`/pipelines/${pipelineId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deletePipeline(pipelineId: string): Promise<{ message: string }> {
  return fetchAPI(`/pipelines/${pipelineId}`, {
    method: 'DELETE',
  });
}

// ============ Run API ============

export async function runPipeline(params: {
  pipeline_id?: string;
  blocks?: any[];
  edges?: any[];
  input: {
    question?: string;
    documents?: any[];
    [key: string]: any;
  };
}): Promise<RunResponse> {
  return fetchAPI('/run', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function testBlock(
  block: any,
  inputData: Record<string, any> = {}
): Promise<RunResponse> {
  return fetchAPI('/run/test', {
    method: 'POST',
    body: JSON.stringify({
      block,
      input_data: inputData,
    }),
  });
}

// ============ Health Check ============

export async function healthCheck(): Promise<{ status: string }> {
  const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
  return response.json();
}
