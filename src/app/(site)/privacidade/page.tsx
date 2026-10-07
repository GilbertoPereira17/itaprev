import Link from "next/link";
import { PageHero } from "@/components/layout/PageHero";
import { getSettings } from "@/lib/content";
import { buildInfo } from "@/lib/site-info";

export const metadata = {
  title: "Política de Privacidade",
  description: "Como o Itanhaém Prev trata os dados pessoais recebidos pelo site, conforme a LGPD.",
};

const UPDATED = "outubro de 2026";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-bold text-slate-900">{title}</h2>
      <div className="space-y-3 text-[17px] leading-relaxed text-slate-700">{children}</div>
    </section>
  );
}

export default async function PrivacidadePage() {
  const settings = await getSettings();
  const info = buildInfo(settings);
  const dpoName = settings["lgpd.encarregado"]?.trim();
  const dpoEmail = settings["lgpd.email"]?.trim() || info.contacts.ouvidoriaEmail;

  return (
    <div className="bg-white py-10 sm:py-12">
      <div className="mx-auto max-w-4xl space-y-8 px-4 sm:px-6 lg:px-8">
        <PageHero
          breadcrumb="Política de Privacidade"
          eyebrow="Proteção de dados"
          title="Política de Privacidade"
          description="Como tratamos os dados pessoais recebidos por este site, conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018)."
        />
        <p className="text-sm text-slate-500">Última atualização: {UPDATED}.</p>

        <Section title="1. Quem é o responsável">
          <p>
            O controlador dos dados é o <strong>Instituto de Previdência dos Servidores Públicos do Município de
            Itanhaém (Itanhaém Prev)</strong>, {info.address.full}.
          </p>
          <p>
            Encarregado pelo tratamento de dados pessoais{dpoName ? <>: <strong>{dpoName}</strong></> : null}. Contato:{" "}
            <a href={`mailto:${dpoEmail}`} className="font-semibold text-[var(--color-brand-blue)] hover:underline">{dpoEmail}</a>.
          </p>
        </Section>

        <Section title="2. Navegar pelo site">
          <p>
            Você pode consultar todo o conteúdo público (notícias, documentos, transparência) <strong>sem se identificar</strong>.
            O site <strong>não usa cookies de rastreamento, publicidade ou estatística</strong> e não instala cookies
            no seu navegador durante a navegação.
          </p>
          <p>
            Se você ativar a <strong>tradução para Libras</strong> no menu de acessibilidade, o site carrega o VLibras,
            serviço gratuito do Governo Federal, que funciona a partir dos servidores do próprio governo.
          </p>
          <p>
            Como qualquer servidor na internet, o sistema que hospeda o site registra dados técnicos de acesso (como
            endereço IP, data e hora), usados apenas para segurança e funcionamento, conforme o Marco Civil da
            Internet (Lei nº 12.965/2014).
          </p>
        </Section>

        <Section title="3. Dados que você nos envia">
          <p>Coletamos dados pessoais somente quando você os informa, nestas situações:</p>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <strong>Fale conosco e Ouvidoria:</strong> nome, CPF ou matrícula (opcional), telefone, e-mail e o texto da
              mensagem. Na Ouvidoria você pode optar pelo <strong>anonimato</strong>; nesse caso nenhum dado de
              identificação é registrado.
            </li>
            <li>
              <strong>Assistente virtual (Ita):</strong> o texto que você digita na conversa. Ele é processado por um
              serviço de inteligência artificial de terceiro para gerar a resposta e pode ser processado fora do
              Brasil. <strong>Não informe CPF, senhas ou outros dados pessoais no chat.</strong> Para tratar de assuntos
              individuais, use os canais de atendimento. As perguntas e respostas ficam registradas por 180 dias para
              auditoria e melhoria do atendimento, com CPF, e-mail e telefone ocultados.
            </li>
          </ul>
        </Section>

        <Section title="4. Para que usamos e com qual base legal">
          <p>
            Os dados são usados <strong>exclusivamente</strong> para responder à sua mensagem, registrar e acompanhar
            manifestações de Ouvidoria e pedidos de acesso à informação, e para a segurança do site. O tratamento se
            baseia no cumprimento de obrigações legais e na execução de políticas públicas pelo poder público (LGPD,
            arts. 7º e 23), na Lei de Acesso à Informação (Lei nº 12.527/2011) e no seu consentimento, quando informado
            no formulário.
          </p>
          <p>Não vendemos, não alugamos e não usamos seus dados para publicidade.</p>
        </Section>

        <Section title="5. Com quem compartilhamos">
          <p>
            Os dados do Fale conosco e da Ouvidoria ficam no servidor do próprio Instituto e são acessados apenas pela
            equipe responsável pelo atendimento, com senha individual e registro de cada acesso. Podem ser
            compartilhados com órgãos públicos quando a lei exigir. O texto do assistente virtual é enviado ao serviço
            de inteligência artificial descrito no item 3.
          </p>
        </Section>

        <Section title="6. Por quanto tempo guardamos">
          <p>
            Pelo tempo necessário ao atendimento e ao cumprimento dos prazos legais de guarda de documentos da
            administração pública. Manifestações de Ouvidoria são mantidas como registro do atendimento e não são
            apagadas pela equipe.
          </p>
        </Section>

        <Section title="7. Como protegemos">
          <p>
            Conexão criptografada (HTTPS), acesso restrito por perfil, senha forte com verificação em duas etapas para a
            equipe, registro de atividades e cópias de segurança do banco de dados.
          </p>
        </Section>

        <Section title="8. Seus direitos">
          <p>
            Você pode pedir a confirmação de que tratamos seus dados, acesso, correção, anonimização, informação sobre
            compartilhamento e revisão do consentimento, nos termos do art. 18 da LGPD. Para isso, registre um pedido
            na{" "}
            <Link href="/ouvidoria" className="font-semibold text-[var(--color-brand-blue)] hover:underline">Ouvidoria</Link>{" "}
            (tipo “Meus dados pessoais (LGPD)”) ou escreva para{" "}
            <a href={`mailto:${dpoEmail}`} className="font-semibold text-[var(--color-brand-blue)] hover:underline">{dpoEmail}</a>.
          </p>
          <p>
            Se não ficar satisfeito com a resposta, você pode recorrer à Autoridade Nacional de Proteção de Dados (ANPD).
          </p>
        </Section>

        <Section title="9. Atualizações desta política">
          <p>
            Esta política pode ser atualizada, por exemplo, quando novos serviços online forem disponibilizados. A data
            da última atualização aparece no início da página.
          </p>
        </Section>
      </div>
    </div>
  );
}
