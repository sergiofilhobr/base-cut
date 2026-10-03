export type Membro = { userId: string; papel: "admin" | "membro" };
export type SessaoCliente = { userId: string; email: string };

export interface Autenticacao {
  membro(authorization: string | undefined): Promise<Membro | null>;
  cliente(authorization: string | undefined): Promise<SessaoCliente | null>;
}
