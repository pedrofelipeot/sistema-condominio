export class ErroApi extends Error {
  constructor(
    message: string,
    public status: number,
    public detalhes?: Record<string, string[]>,
  ) {
    super(message);
  }
}

export async function api<T>(url: string, opcoes?: RequestInit): Promise<T> {
  const resposta = await fetch(url, {
    ...opcoes,
    headers: { "Content-Type": "application/json", ...opcoes?.headers },
  });

  // 204 = sucesso sem corpo (ex.: DELETE)
  if (resposta.status === 204) return undefined as T;

  const corpo = await resposta.json().catch(() => null);

  if (!resposta.ok) {
    // sem sessão: manda para o login
    if (resposta.status === 401 && window.location.pathname !== "/login") {
      window.location.href = "/login";
    }

    throw new ErroApi(
      corpo?.erro ?? "Erro inesperado.",
      resposta.status,
      corpo?.detalhes,
    );
  }

  return corpo as T;
}
