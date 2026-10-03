export function avaliacaoNova(pedido: { nota: number; texto: string }) {
  if (pedido.nota < 1 || pedido.nota > 5 || pedido.texto.trim() === "") {
    return { ok: false as const, erro: "pedido_invalido" as const };
  }
  return {
    ok: true as const,
    avaliacao: { nota: pedido.nota, texto: pedido.texto.trim(), publicada: false },
  };
}

export function caminhoDoGoogle(url: string) {
  return url;
}
