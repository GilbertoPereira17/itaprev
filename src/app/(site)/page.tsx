import { HeroSlider } from "@/components/home/HeroSlider";
import { QuickAccess } from "@/components/home/QuickAccess";
import { ServicesGrid } from "@/components/home/ServicesGrid";
import { NewsSection } from "@/components/home/NewsSection";
import { Certification } from "@/components/home/Certification";
import { FAQSection } from "@/components/home/FAQSection";
import { WhereWeAre } from "@/components/home/WhereWeAre";
import { Highlight } from "@/components/home/Highlight";
import { getFaqs, getLatestNews, getSettings, getSlides } from "@/lib/content";
import { buildInfo } from "@/lib/site-info";
import { formatDate, mediaUrl } from "@/lib/format";

export default async function Home() {
  const [slides, news, faqs, settings] = await Promise.all([getSlides(), getLatestNews(4), getFaqs(), getSettings()]);
  const info = buildInfo(settings);

  return (
    <>
      <HeroSlider
        slides={slides.map((s) => ({
          id: s.id,
          bgImage: mediaUrl(s.imagePath) || "/images/hero-cover.jpg",
          tag: s.tag,
          title: s.title,
          description: s.description,
          buttonLabel: s.buttonLabel,
          buttonUrl: s.buttonUrl,
          isExternal: /^https?:\/\//.test(s.buttonUrl),
        }))}
      />
      <QuickAccess info={info} />
      <ServicesGrid info={info} />
      <Highlight info={info} />
      <NewsSection
        items={news.map((n) => ({
          id: n.id,
          slug: n.slug,
          category: n.category,
          date: formatDate(n.publishedAt),
          title: n.title,
          summary: n.summary,
          image: n.coverPath ? mediaUrl(n.coverPath) : undefined,
        }))}
      />
      <FAQSection items={faqs} />
      <Certification />
      <WhereWeAre info={info} />
    </>
  );
}
