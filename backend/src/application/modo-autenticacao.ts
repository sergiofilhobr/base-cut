export type AmbienteAuth = {
  nodeEnv: string | undefined;
  authLocal: string | undefined;
  clerkSecret: string | undefined;
};

export type DecisaoAuth = { local: boolean } | { recusar: string };

/** AUTH_LOCAL só existe com NODE_ENV=development. Ausente ou production recusa. */
export function decidirAutenticacao(env: AmbienteAuth): DecisaoAuth {
  if (env.authLocal === "1" && env.nodeEnv !== "development") {
    return { recusar: "AUTH_LOCAL não vale fora de development." };
  }
  const local = env.authLocal === "1" && !env.clerkSecret && env.nodeEnv === "development";
  return { local };
}
