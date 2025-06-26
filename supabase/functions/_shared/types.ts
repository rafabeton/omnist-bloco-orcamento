// Tipos compartilhados para as funções Supabase Edge Functions

declare global {
  const Deno: {
    env: {
      get(key: string): string | undefined;
    };
  };
}

export interface SupabaseRequest extends Request {
  json(): Promise<any>;
}

export interface SupabaseResponse {
  status: number;
  headers: Headers;
  body: string;
}

export interface ErrorResponse {
  error: string;
  message?: string;
}

export interface SuccessResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

export function createErrorResponse(message: string, status: number = 400): Response {
  return new Response(
    JSON.stringify({ error: message }),
    {
      status,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

export function createSuccessResponse<T>(data: T, message?: string): Response {
  return new Response(
    JSON.stringify({ success: true, data, message }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

