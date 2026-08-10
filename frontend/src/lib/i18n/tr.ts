import type { Dictionary } from "./en";

export const tr: Dictionary = {
  nav: {
    features: "Özellikler",
    templates: "Şablonlar",
    faq: "SSS",
    signIn: "Giriş yap",
    startFree: "Ücretsiz başla",
    goToDashboard: "Panele git",
    openMenu: "Menüyü aç",
    closeMenu: "Menüyü kapat",
  },
  hero: {
    badge: "Potansiyel müşteri toplama, tamamen gömülebilir",
    titleStart: "Herhangi bir siteyi",
    titleHighlight: "potansiyel müşteri makinesine",
    subtitle:
      "Bir widget tasarlayın, tek satır kodu kopyalayın ve kayıt toplamaya başlayın. Doğrulanmış, spam filtreli ve otomatik olarak panele işlenir. Mühendislik ekibi gerekmez.",
    ctaGuest: "Ücretsiz oluşturmaya başla",
    ctaAuthed: "Panele git",
    browseTemplates: "Şablonlara göz at",
    noCard: "Kredi kartı gerekmez. Sonsuza kadar ücretsiz plan.",
  },
  features: {
    eyebrow: "İhtiyacınız olan her şey",
    title: "Eksiksiz bir potansiyel müşteri araç seti",
    items: {
      builder: {
        eyebrow: "Widget oluşturucu",
        title: "Her pikseli özelleştirin, canlı görün",
        description:
          "Yazı tipi, köşe yuvarlaklığı, gölge, marka rengi, giriş animasyonu ve konum: her değişiklik masaüstünde, tablette ve mobilde gerçek, piksel doğru bir önizlemeyi anında günceller.",
      },
      templates: {
        eyebrow: "Şablon pazarı",
        title: "Kanıtlanmış bir düzenle başlayın",
        description:
          "Bülten kayıtları, indirim çağrıları, çıkış niyeti pencereleri, etkinlik katılımları: her şablon kartı bir ekran görüntüsü değil, canlı bir render, yani seçtiğiniz tam olarak elde ettiğinizdir.",
      },
      analytics: {
        eyebrow: "Analitik",
        title: "Gerçekte neyin dönüşüm sağladığını bilin",
        description:
          "Zaman içinde gönderimler, widget başına performans ve gerçek trafikten cihaz dağılımı, ziyaretçi gönderim yaptığı anda güncellenen bir panelde.",
      },
      reliability: {
        eyebrow: "Açık internet için sağlamlaştırıldı",
        title: "Kontrol edemediğiniz trafiğe karşı sağlamlaştırıldı",
        description:
          "Gömülü kodunuz sahibi olmadığınız sitelerde çalışır. Her gönderim doğrulanır, hız sınırlandırılır, spam kontrolünden geçirilir ve zenginleştirilir, her adımda zarif bir şekilde geri düşer.",
      },
    },
    reliabilityList: {
      cors: "CORS ve ön uçuş istekleri doğru şekilde ele alınır",
      rateLimit: "IP başına ve widget başına hız sınırlama",
      honeypot: "Honeypot spam koruması",
      geo: "Hiç başarısız olmayan IP'den konuma yedekli zincir",
    },
  },
  howItWorks: {
    eyebrow: "Sıfırdan yayına",
    title: "Üç adım, mühendislik ekibi gerekmez",
    steps: {
      design: {
        title: "Widget'ınızı tasarlayın",
        description: "Bir şablon seçin ya da boştan başlayın. Metni, alanları, rengi ve yazı tipini ayarlayın. Önizleme anında güncellenir.",
      },
      copy: {
        title: "Tek satır kodu kopyalayın",
        description: "Her widget tek bir script etiketi alır. Derleme adımı yok, kurulacak paket yok, ayarlanacak iframe yok.",
      },
      live: {
        title: "Sitenizde yayında",
        description: "Kodu HTML'inizin herhangi bir yerine yapıştırın. Widget, tam olarak ayarladığınız stille görüntülenir, başka bir şey yapmanız gerekmez.",
      },
    },
    copySnippet: "Kodu kopyala",
    copied: "Kopyalandı",
  },
  testimonials: {
    title: "Hızlı ilerleyen ekiplerin tercihi",
    quotes: {
      rivera: {
        quote:
          "On dakikadan kısa sürede pazarlama sitemizde çalışan bir kayıt widget'ımız oldu. Gömme betiği hemen çalıştı, derleme adımı yok, iframe baş ağrısı yok.",
        name: "A. Rivera",
        role: "Kurucu, bağımsız SaaS",
      },
      novak: {
        quote:
          "Hız sınırlama ve honeypot, ilk günden eski formumuzu çöp potansiyel müşterilerle dolduracak bir bot akınını yakaladı.",
        name: "J. Novak",
        role: "Büyüme mühendisi",
      },
      osei: {
        quote:
          "Widget'ın nasıl göründüğünü yayınlamadan önce tam olarak görebilmek, yazı tipi, köşe yuvarlaklığı, gölge, bizi tasarımla üç tur küçük ayar yapmaktan kurtardı.",
        name: "P. Osei",
        role: "Ürün tasarımcısı",
      },
    },
  },
  faq: {
    title: "Sıkça sorulan sorular",
    items: {
      anySite: {
        q: "Bu herhangi bir web sitesinde çalışır mı?",
        a: "Evet. Gömme kodu, bağımlılığı olmayan tek bir script etiketidir. Ziyaretçinizin tarayıcısı API'mizden tamamen farklı bir kaynak olduğu için, hangi teknolojiyle kurulmuş olursa olsun herhangi bir HTML sayfasında çalışır.",
      },
      spam: {
        q: "Biri formu spamlerse ne olur?",
        a: "Her gönderim, veritabanına dokunmadan önce hız sınırlamadan (IP başına ve widget başına) ve bir honeypot kontrolünden geçer. Botlar ikna edici görünen bir başarı yanıtı alır ama hiçbir şey kaydedilmez.",
      },
      geoDown: {
        q: "Konum sağlayıcısı çalışmazsa ne olur?",
        a: "Önce birincil bir sağlayıcı, sonra bir yedek deneriz; ikisi de başarısız olursa gönderim yine de kaydedilir, sadece konum verisi olmadan. Bir bağımlılığın çökmesi asla bir potansiyel müşteriyi kaybettirmez.",
      },
      customize: {
        q: "Widget'ın görünümünü özelleştirebilir miyim?",
        a: "Yazı tipi, köşe yuvarlaklığı, gölge, marka rengi, giriş animasyonu ve konum, hepsi oluşturucudan, tam olarak yayınlanacak şeyle eşleşen canlı bir önizlemeyle.",
      },
      free: {
        q: "Ücretsiz bir plan var mı?",
        a: "Evet. Başlangıç planı, bir aktif widget ve ayda 500 gönderim için sonsuza kadar ücretsizdir.",
      },
    },
  },
  cta: {
    titleAuthed: "Panelinize geri dönün",
    titleGuest: "İlk widget'ınızı önümüzdeki beş dakikada yayınlayın",
    subtitleAuthed: "Widget'larınız ve analitikleriniz bıraktığınız yerde duruyor.",
    subtitleGuest: "Sonsuza kadar ücretsiz plan. Kredi kartı gerekmez.",
    ctaAuthed: "Panele git",
    ctaGuest: "Ücretsiz oluşturmaya başla",
  },
  footer: {
    tagline: "Açık internet için oluşturulmuş, gömülebilir widget'lar ve potansiyel müşteri toplama.",
    product: "Ürün",
    account: "Hesap",
    createAccount: "Hesap oluştur",
    copyright: (year: number) => `© ${year} Widget Platform. FlyRank Backend Track bitirme projesi olarak geliştirildi.`,
  },
  auth: {
    brand: "Widget Platform",
    login: {
      subtitle: "Widget'larınızı yönetmek için giriş yapın",
      email: "E posta",
      password: "Şifre",
      submit: "Giriş yap",
      submitting: "Giriş yapılıyor...",
      noAccount: "Henüz hesabınız yok mu?",
      createOne: "Hesap oluşturun",
    },
    register: {
      subtitle: "Hesabınızı oluşturun",
      name: "Ad",
      email: "E posta",
      password: "Şifre",
      passwordHint: "En az 8 karakter.",
      submit: "Hesap oluştur",
      submitting: "Hesap oluşturuluyor...",
      haveAccount: "Zaten bir hesabınız var mı?",
      signIn: "Giriş yapın",
    },
  },
};
