# Aplicativo Itanhaém Prev (Android e iOS)

O app é gerado a partir do próprio site com o [Capacitor](https://capacitorjs.com): abre o portal oficial
dentro de um aplicativo nativo, com o mesmo conteúdo, a mesma Área do Beneficiário e o mesmo login.
Tudo o que for publicado ou desenvolvido no site aparece no app **sem nova publicação nas lojas**.

| Item | Valor |
|---|---|
| Identificador | `br.gov.sp.itanhaemprev.app` |
| Nome | Itanhaém Prev |
| Site aberto | `APP_URL` (padrão `https://www.itanhaemprev.sp.gov.br`) |
| Android | 7.0 ou superior (minSdk 24) |
| iOS | conforme o Xcode usado na compilação |

## O que o app faz além do site

- Tela de abertura e ícone do Instituto.
- Tela própria quando o celular está **sem internet** (com botão "Tentar novamente" e telefone).
- PDFs, planilhas e sites de outros órgãos abrem no **visualizador do celular** (o site detecta o app — `src/components/AppBridge.tsx`).
- Documentos da Área do Beneficiário abrem por **link temporário de 2 minutos**, sem expor o arquivo.
- Botão **voltar** do Android volta a página (na primeira tela, fecha o app).
- Só o domínio do Instituto abre dentro do app; outros endereços abrem no navegador.

## Gerar

Pré-requisitos: Node 22+. **Android:** Android Studio (ou JDK 21 + Android SDK 36). **iOS:** um Mac com Xcode.

```bash
cd mobile
npm ci
npm run sync                       # aplica a configuração nos projetos android/ e ios/
# apontar para outro endereço (ex.: homologação):
APP_URL=https://homolog.itanhaemprev.sp.gov.br npm run sync
```

- **Android (teste):** `npm run apk` → `android/app/build/outputs/apk/debug/app-debug.apk`
- **Android (loja):** `npm run android` abre o Android Studio → *Build → Generate Signed App Bundle* (`.aab`).
  Guarde a **chave de assinatura** (keystore) num local seguro do Instituto: sem ela não é possível atualizar o app.
- **iOS:** `npm run ios` abre o Xcode (no Mac) → selecione a equipe da conta Apple do Instituto → *Product → Archive*.
- **Ícones e abertura:** arquivos em `assets/`; para regenerar: `npm run icones`.

## Publicar nas lojas (contas do Instituto)

| Loja | Conta | Custo da loja |
|---|---|---|
| Google Play | Google Play Console (organização, com CNPJ) | taxa única de US$ 25 |
| App Store | Apple Developer Program (organização, exige número D-U-N-S) | US$ 99 por ano |

Na ficha das lojas:
- **Política de privacidade:** `https://www.itanhaemprev.sp.gov.br/privacidade`
- **Exclusão de conta:** Área do Beneficiário → Segurança → *Pedir exclusão da conta* (exigência da Apple e do Google)
- **Segurança dos dados (Google) / Privacidade (Apple):** usar o inventário de `LGPD.md`
- Capturas de tela: celular (6,7" e 5,5" no iOS) mostrando início, serviços e Área do Beneficiário

> **Revisão da Apple (diretriz 4.2):** apps que só exibem um site podem ser recusados. O app já tem tela
> offline, abertura de documentos no visualizador nativo e Área do Beneficiário com login próprio. Se a Apple
> pedir mais, o próximo recurso nativo previsto é **notificação** (ex.: "sua solicitação foi respondida").
