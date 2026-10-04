export const SETTING_KEYS = [
  {
    group: "Atendimento",
    fields: [
      { key: "contato.telefone", label: "Telefone fixo" },
      { key: "contato.whatsapp", label: "WhatsApp (exibição)", hint: "Ex.: (13) 3426-9426" },
      { key: "contato.whatsappUrl", label: "Link do WhatsApp", hint: "Ex.: https://wa.me/551334269426" },
      { key: "contato.email", label: "E-mail de atendimento" },
      { key: "contato.ouvidoriaEmail", label: "E-mail da ouvidoria" },
      { key: "contato.horario", label: "Horário de atendimento" },
      { key: "contato.endereco", label: "Endereço completo" },
      { key: "contato.mapsUrl", label: "Link do Google Maps" },
    ],
  },
  {
    group: "Sistemas e links externos",
    fields: [
      { key: "link.holerite", label: "Holerite (Servidor Online)" },
      { key: "link.portalSegurado", label: "Portal do Segurado / Informe de Rendimentos" },
      { key: "link.censoManual", label: "Manual do recadastramento" },
      { key: "link.transparencia", label: "Portal da Transparência" },
      { key: "link.tce", label: "Tribunal de Contas (TCE-SP)" },
      { key: "link.prefeitura", label: "Prefeitura de Itanhaém" },
      { key: "link.camara", label: "Câmara Municipal" },
    ],
  },
  {
    group: "Proteção de dados (LGPD)",
    fields: [
      { key: "lgpd.encarregado", label: "Nome do encarregado (DPO)", hint: "Pessoa designada pelo Instituto. Aparece na Política de Privacidade." },
      { key: "lgpd.email", label: "E-mail do encarregado", hint: "Se ficar vazio, a política mostra o e-mail da ouvidoria." },
    ],
  },
] as { group: string; fields: { key: string; label: string; hint?: string }[] }[];
