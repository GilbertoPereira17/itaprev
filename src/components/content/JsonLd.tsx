/** Dados estruturados (schema.org) para o Google entender o conteúdo */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  // "<" escapado: impede fechar a tag <script> a partir de texto vindo do banco
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
