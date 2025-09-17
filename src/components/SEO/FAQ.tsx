"use client";
export default function FAQJSONLD() {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      { "@type":"Question", name:"Antalya Havalimanı’nda karşılama nasıl?",
        acceptedAnswer:{ "@type":"Answer", text:"Uçuş takibi yapıyoruz; şoför terminal çıkışında isim panosu ile karşılar."}},
      { "@type":"Question", name:"Gece uçuşlarında ek ücret var mı?",
        acceptedAnswer:{ "@type":"Answer", text:"Hayır. 7/24 sabit fiyat; gizli ücret yok."}},
      { "@type":"Question", name:"Çocuk koltuğu veriyor musunuz?",
        acceptedAnswer:{ "@type":"Answer", text:"Evet, talep üzerine ücretsiz sağlıyoruz."}},
    ],
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}