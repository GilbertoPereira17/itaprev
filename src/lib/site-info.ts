import { INSTITUTION_INFO } from "@/data/institution";

/** Mesmo formato do INSTITUTION_INFO, mas com valores vindos das Configurações do painel */
export type SiteInfo = typeof INSTITUTION_INFO;

export function buildInfo(settings: Record<string, string> = {}): SiteInfo {
  const get = (k: string, fallback: string) => settings[k] || fallback;
  const I = INSTITUTION_INFO;
  return {
    ...I,
    address: {
      ...I.address,
      full: get("contato.endereco", I.address.full),
      googleMapsUrl: get("contato.mapsUrl", I.address.googleMapsUrl),
    },
    contacts: {
      phone: get("contato.telefone", I.contacts.phone),
      whatsapp: get("contato.whatsapp", I.contacts.whatsapp),
      whatsappUrl: get("contato.whatsappUrl", I.contacts.whatsappUrl),
      email: get("contato.email", I.contacts.email),
      ouvidoriaEmail: get("contato.ouvidoriaEmail", I.contacts.ouvidoriaEmail),
      hours: get("contato.horario", I.contacts.hours),
    },
    externalLinks: {
      ...I.externalLinks,
      holeriteSystem: get("link.holerite", I.externalLinks.holeriteSystem),
      protecWeb: get("link.portalSegurado", I.externalLinks.protecWeb),
      censoManual: get("link.censoManual", I.externalLinks.censoManual),
      transparencyPortal: get("link.transparencia", I.externalLinks.transparencyPortal),
      ouvidoriaForm: get("link.ouvidoriaForm", I.externalLinks.ouvidoriaForm),
      tcesp: get("link.tce", I.externalLinks.tcesp),
      prefeitura: get("link.prefeitura", I.externalLinks.prefeitura),
      camara: get("link.camara", I.externalLinks.camara),
    },
  };
}
