export type ItemDeConta = {
  tipo: "servico" | "produto";
  nome: string;
  quantidade: number;
  precoCentavos: number;
  referenciaId?: string | null;
};

export function totalDoAtendimento(
  itens: ItemDeConta[],
  descontoCentavos: number,
  gorjetaCentavos: number,
): { ok: true; total: number } | { ok: false; erro: "valor_invalido" } {
  if (descontoCentavos < 0 || gorjetaCentavos < 0) return { ok: false, erro: "valor_invalido" };
  if (itens.length === 0 || itens.some((item) => item.quantidade <= 0 || item.precoCentavos < 0)) {
    return { ok: false, erro: "valor_invalido" };
  }
  const bruto = itens.reduce((soma, item) => soma + item.precoCentavos * item.quantidade, 0);
  if (descontoCentavos > bruto) return { ok: false, erro: "valor_invalido" };
  return { ok: true, total: bruto - descontoCentavos + gorjetaCentavos };
}
