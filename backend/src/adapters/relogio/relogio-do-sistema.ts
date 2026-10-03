import type { Relogio } from "../../ports/relogio.ts";

export const relogioDoSistema: Relogio = {
  agora: () => new Date(),
};
