import { getSupabase } from "./supabase";
import type { Project, ProjectInput, ProjectStatus } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { data } = await getSupabase().auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new ApiError("You are signed out. Sign in again.", 401);

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...init.headers },
    });
  } catch {
    throw new ApiError(`Cannot reach the API at ${API_URL}. Check that the backend is running.`, 0);
  }
  if (res.status === 204) return undefined as T;
  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (typeof body.detail === "string") detail = body.detail;
      else if (Array.isArray(body.detail)) detail = body.detail.map((d: { msg: string }) => d.msg).join("; ");
    } catch {
      /* keep default message */
    }
    throw new ApiError(detail, res.status);
  }
  return res.json() as Promise<T>;
}

export const projectsApi = {
  list: () => request<Project[]>("/api/projects"),
  create: (input: ProjectInput) => request<Project>("/api/projects", { method: "POST", body: JSON.stringify(input) }),
  update: (id: string, patch: Partial<ProjectInput> & { status?: ProjectStatus }) =>
    request<Project>(`/api/projects/${id}`, { method: "PATCH", body: JSON.stringify(patch) }),
  remove: (id: string) => request<void>(`/api/projects/${id}`, { method: "DELETE" }),
};
