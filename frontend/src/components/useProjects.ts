"use client";

import { useCallback, useEffect, useState } from "react";
import { projectsApi } from "@/lib/api";
import type { Project } from "@/lib/types";

export function useProjects() {
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setError(null);
    try {
      setProjects(await projectsApi.list());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load projects.");
      setProjects([]);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { projects, error, reload };
}
