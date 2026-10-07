# Roteiro de homologação

Lista de verificação para o Instituto conferir cada entrega no **ambiente de homologação** (ver
[`DEPLOY.md`](DEPLOY.md#ambiente-de-homologação-testes-antes-da-produção)) antes de liberar na produção.
Marque **OK** ou descreva o problema. Itens com problema voltam para correção e são verificados de novo.

**Ambiente:** ____________________ **Versão (commit):** ________ **Data:** ___/___/______
**Responsável pela verificação:** ______________________________

## Portal da Transparência e Portal Institucional

| # | Verificação | Resultado |
|---|---|---|
| 1 | Página inicial abre no computador e no celular, com banner, serviços, notícias e perguntas frequentes | |
| 2 | Menu leva a todas as páginas (Institucional, Segurados, Conselhos, Transparência, Notícias, Contato, Ouvidoria) sem erro | |
| 3 | Seções de documentos listam e abrem os arquivos (balancetes, DRAA, investimentos, atas, legislação) | |
| 4 | Busca encontra documentos, páginas e notícias (com e sem acento) | |
| 5 | Acessibilidade: aumentar fonte, alto contraste, atalhos Alt+1/2/3 e tradução em Libras (VLibras) | |
| 6 | Política de Privacidade publicada, com o encarregado de dados | |

## Painel administrativo

| # | Verificação | Resultado |
|---|---|---|
| 7 | Login com senha; troca obrigatória no primeiro acesso; 5 erros bloqueiam por 10 minutos | |
| 8 | Ativar verificação em duas etapas e entrar com o código do celular | |
| 9 | Publicar, editar e despublicar uma notícia; editar uma página de texto | |
| 10 | Enviar documento, trocar o arquivo, ver e restaurar a versão anterior | |
| 11 | Criar um Editor só com "Mensagens e Ouvidoria": ele não vê nem abre os outros módulos | |
| 12 | Registro de atividades mostra as ações dos itens acima | |

## Atendimento e assistente virtual

| # | Verificação | Resultado |
|---|---|---|
| 13 | Enviar Fale conosco e Ouvidoria (inclusive anônima): recebe protocolo e código de acesso | |
| 14 | No painel: definir responsável, mudar a situação e escrever a resposta ao cidadão | |
| 15 | Em "Acompanhar protocolo", consultar com o código (e com o e-mail) e ver a resposta | |
| 16 | Perguntar à Ita sobre holerite, informe de rendimentos e horário: responde e indica o caminho | |
| 17 | Cadastrar uma informação na base de conhecimento e perguntar à Ita sobre ela | |
| 18 | A conversa aparece em Assistente virtual → Conversas, com CPF ocultado | |

## Área do Beneficiário

| # | Verificação | Resultado |
|---|---|---|
| 19 | Importar a planilha (CSV) de beneficiários; linhas com erro são informadas | |
| 20 | Primeiro acesso com CPF + nascimento + matrícula; dados errados são recusados | |
| 21 | Ver dados do cadastro; atualizar telefone/e-mail | |
| 22 | Enviar documento, reenviar (nova versão); equipe aceita/recusa com motivo e o beneficiário vê | |
| 23 | Abrir solicitação com anexo; equipe responde em Mensagens → Requerimentos; beneficiário vê a resposta | |
| 24 | Pedir cadastro pelo site (CPF fora da planilha); equipe aprova; primeiro acesso liberado | |
| 25 | Ativar 2FA do beneficiário; trocar a senha; histórico de acessos mostra tudo | |
| 26 | Um beneficiário não consegue abrir documento/solicitação de outro | |

## Aplicativo (Android e iOS)

| # | Verificação | Resultado |
|---|---|---|
| 27 | Instalar o app: abre com o ícone e a tela de abertura do Instituto e carrega o site | |
| 28 | Navegar pelo menu, abrir um PDF da Transparência (abre no visualizador) e voltar com o botão voltar | |
| 29 | Entrar na Área do Beneficiário pelo app e abrir um documento enviado | |
| 30 | Com o celular sem internet: aparece a tela "Sem conexão" e "Tentar novamente" volta ao site | |

## Segurança, backup e implantação

| # | Verificação | Resultado |
|---|---|---|
| 31 | Site em HTTPS; `bash scripts/verificar-seguranca.sh <endereço>` sem falhas | |
| 32 | `bash scripts/backup.sh` conclui; arquivo restaurado num banco de teste | |
| 33 | Atualização com `bash scripts/atualizar.sh` mantém o conteúdo publicado | |
| 34 | Equipe treinada com o [`MANUAL-PAINEL.md`](MANUAL-PAINEL.md) | |

## Parecer

☐ Homologado sem ressalvas  ☐ Homologado com ressalvas (itens: ________)  ☐ Não homologado

Observações: ______________________________________________________________

_____________________________________ _____________________________________
Responsável pela verificação (Instituto)            Responsável técnico (Trius Tecnologia)
