import type { Mensageiro } from "../../ports/mensagens.ts";

/** Z-API, sem VPS. Sem instância configurada, não envia e não marca ban. */
export function criarMensageiroZApi(opcoes: {
  instanceId: string | undefined;
  token: string | undefined;
  clientToken: string | undefined;
}): Mensageiro {
  if (!opcoes.instanceId || !opcoes.token) {
    return {
      async enviar() {
        return { ok: false, banido: false };
      },
    };
  }

  return {
    async enviar(pedido) {
      const url = `https://api.z-api.io/instances/${opcoes.instanceId}/token/${opcoes.token}/send-text`;
      try {
        const resposta = await fetch(url, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            ...(opcoes.clientToken ? { "client-token": opcoes.clientToken } : {}),
          },
          body: JSON.stringify({ phone: pedido.para, message: pedido.texto }),
        });
        if (resposta.ok) return { ok: true };
        const corpo = await resposta.text();
        const banido = resposta.status === 403 || /ban/i.test(corpo);
        return { ok: false, banido };
      } catch {
        return { ok: false, banido: false };
      }
    },
  };
}
