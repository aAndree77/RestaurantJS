const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Ștergem datele existente (în ordinea corectă pentru relații)
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.cartItem.deleteMany()
  await prisma.cart.deleteMany()
  await prisma.menuItem.deleteMany()
  await prisma.category.deleteMany()
  await prisma.testimonial.deleteMany()

  console.log('📦 Creating categories...')

  // Creăm categoriile
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Pizza',
        icon: '🍕',
        color: 'bg-red-500',
        order: 1
      }
    }),
    prisma.category.create({
      data: {
        name: 'Paste',
        icon: '🍝',
        color: 'bg-amber-500',
        order: 2
      }
    }),
    prisma.category.create({
      data: {
        name: 'Risotto',
        icon: '🍚',
        color: 'bg-yellow-500',
        order: 3
      }
    }),
    prisma.category.create({
      data: {
        name: 'Antipasti',
        icon: '🥗',
        color: 'bg-green-500',
        order: 4
      }
    }),
    prisma.category.create({
      data: {
        name: 'Carne & Pește',
        icon: '🥩',
        color: 'bg-rose-600',
        order: 5
      }
    }),
    prisma.category.create({
      data: {
        name: 'Supe & Ciorbe',
        icon: '🍲',
        color: 'bg-orange-500',
        order: 6
      }
    }),
    prisma.category.create({
      data: {
        name: 'Salate',
        icon: '🥬',
        color: 'bg-emerald-500',
        order: 7
      }
    }),
    prisma.category.create({
      data: {
        name: 'Deserturi',
        icon: '🍰',
        color: 'bg-pink-500',
        order: 8
      }
    }),
    prisma.category.create({
      data: {
        name: 'Băuturi',
        icon: '🍷',
        color: 'bg-purple-500',
        order: 9
      }
    }),
    prisma.category.create({
      data: {
        name: 'Specialități',
        icon: '⭐',
        color: 'bg-blue-500',
        order: 10
      }
    })
  ])

  const categoryMap = {}
  categories.forEach(cat => {
    categoryMap[cat.name] = cat.id
  })

  console.log('🍕 Creating menu items...')

  // Creăm produsele din meniu
  const menuItems = [
    // ===== PIZZA =====
    {
      name: "Pizza Margherita",
      description: "Sos de roșii San Marzano, mozzarella di bufala, busuioc proaspăt",
      price: 32,
      image: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=400&h=400&fit=crop",
      categoryId: categoryMap["Pizza"]
    },
    {
      name: "Pizza Quattro Formaggi",
      description: "Mozzarella, gorgonzola, parmezan, fontina, sos de smântână",
      price: 38,
      image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=400&fit=crop",
      categoryId: categoryMap["Pizza"]
    },
    {
      name: "Pizza Diavola",
      description: "Sos de roșii, mozzarella, salam picant, ardei iuți, ulei de chili",
      price: 35,
      image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=400&fit=crop",
      categoryId: categoryMap["Pizza"]
    },
    {
      name: "Pizza Prosciutto e Funghi",
      description: "Sos de roșii, mozzarella, șuncă de Parma, ciuperci champignon",
      price: 36,
      image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=400&fit=crop",
      categoryId: categoryMap["Pizza"]
    },
    {
      name: "Pizza Capricciosa",
      description: "Sos de roșii, mozzarella, șuncă, ciuperci, anghinare, măsline",
      price: 40,
      image: "https://images.unsplash.com/photo-1595708684082-a173bb3a06c5?w=400&h=400&fit=crop",
      categoryId: categoryMap["Pizza"]
    },
    {
      name: "Pizza Frutti di Mare",
      description: "Sos de roșii, mozzarella, creveți, scoici, calamari, usturoi",
      price: 48,
      image: "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400&h=400&fit=crop",
      categoryId: categoryMap["Pizza"]
    },
    {
      name: "Pizza Vegetariana",
      description: "Sos de roșii, mozzarella, ardei gras, ciuperci, măsline, porumb",
      price: 34,
      image: "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=400&h=400&fit=crop",
      categoryId: categoryMap["Pizza"]
    },
    {
      name: "Pizza Tonno",
      description: "Sos de roșii, mozzarella, ton, ceapă roșie, capere",
      price: 37,
      image: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=400&h=400&fit=crop",
      categoryId: categoryMap["Pizza"]
    },
    {
      name: "Pizza Calzone",
      description: "Pizza pliată cu ricotta, mozzarella, șuncă, ciuperci",
      price: 42,
      image: "https://images.unsplash.com/photo-1536964549204-cce9eab227bd?w=400&h=400&fit=crop",
      categoryId: categoryMap["Pizza"]
    },
    {
      name: "Pizza Quattro Stagioni",
      description: "Patru secțiuni: șuncă, ciuperci, anghinare, măsline",
      price: 44,
      image: "https://images.unsplash.com/photo-1600628421055-4d30de868b8f?w=400&h=400&fit=crop",
      categoryId: categoryMap["Pizza"]
    },

    // ===== PASTE =====
    {
      name: "Spaghetti Carbonara",
      description: "Guanciale crispy, ou organic, pecorino romano DOP, piper negru",
      price: 38,
      image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400&h=400&fit=crop",
      categoryId: categoryMap["Paste"]
    },
    {
      name: "Lasagna della Nonna",
      description: "Foi proaspete de paste, ragù de vită maturată 12h, béchamel",
      price: 45,
      image: "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=400&h=400&fit=crop",
      categoryId: categoryMap["Paste"]
    },
    {
      name: "Penne all'Arrabbiata",
      description: "Penne rigate, sos de roșii picant, ardei iuți, usturoi, pătrunjel",
      price: 32,
      image: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400&h=400&fit=crop",
      categoryId: categoryMap["Paste"]
    },
    {
      name: "Tagliatelle al Ragù",
      description: "Paste proaspete cu ragù bolognese gătit 6 ore, parmezan",
      price: 42,
      image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=400&fit=crop",
      categoryId: categoryMap["Paste"]
    },
    {
      name: "Fettuccine Alfredo",
      description: "Fettuccine proaspete, sos cremos de parmezan, unt, piper",
      price: 36,
      image: "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=400&h=400&fit=crop",
      categoryId: categoryMap["Paste"]
    },
    {
      name: "Spaghetti Aglio e Olio",
      description: "Spaghetti, usturoi prăjit, ulei de măsline, ardei iute, pătrunjel",
      price: 28,
      image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&h=400&fit=crop",
      categoryId: categoryMap["Paste"]
    },
    {
      name: "Gnocchi al Pesto",
      description: "Gnocchi de cartofi, pesto genovese, pin, parmezan",
      price: 38,
      image: "https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?w=400&h=400&fit=crop",
      categoryId: categoryMap["Paste"]
    },
    {
      name: "Ravioli di Ricotta e Spinaci",
      description: "Ravioli umplute cu ricotta și spanac, sos de unt și salvie",
      price: 44,
      image: "https://images.unsplash.com/photo-1587740908075-9e245070dfaa?w=400&h=400&fit=crop",
      categoryId: categoryMap["Paste"]
    },
    {
      name: "Pappardelle ai Funghi Porcini",
      description: "Paste late cu ciuperci porcini, smântână, trufe negre",
      price: 52,
      image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=400&h=400&fit=crop",
      categoryId: categoryMap["Paste"]
    },
    {
      name: "Linguine alle Vongole",
      description: "Linguine cu scoici, vin alb, usturoi, pătrunjel proaspăt",
      price: 48,
      image: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400&h=400&fit=crop",
      categoryId: categoryMap["Paste"]
    },
    {
      name: "Spaghetti alla Puttanesca",
      description: "Spaghetti, roșii, măsline, capere, ansoa, usturoi",
      price: 35,
      image: "https://images.unsplash.com/photo-1608219992759-8d74ed8d76eb?w=400&h=400&fit=crop",
      categoryId: categoryMap["Paste"]
    },
    {
      name: "Tortellini în Brodo",
      description: "Tortellini umplute cu carne în supă de pui aromată",
      price: 40,
      image: "https://images.unsplash.com/photo-1597289124948-688c1a35cb48?w=400&h=400&fit=crop",
      categoryId: categoryMap["Paste"]
    },

    // ===== RISOTTO =====
    {
      name: "Risotto ai Funghi",
      description: "Orez Carnaroli, ciuperci porcini din Toscana, parmezan 24 luni",
      price: 42,
      image: "https://images.unsplash.com/photo-1637806930600-37fa8892069d?w=400&h=400&fit=crop",
      categoryId: categoryMap["Risotto"]
    },
    {
      name: "Risotto alla Milanese",
      description: "Risotto cu șofran, vin alb, unt, parmezan, măduva de vită",
      price: 45,
      image: "https://images.unsplash.com/photo-1633964913295-ceb43826e7c1?w=400&h=400&fit=crop",
      categoryId: categoryMap["Risotto"]
    },
    {
      name: "Risotto ai Frutti di Mare",
      description: "Risotto cu creveți, scoici, calamari, midii, vin alb",
      price: 55,
      image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400&h=400&fit=crop",
      categoryId: categoryMap["Risotto"]
    },
    {
      name: "Risotto al Tartufo",
      description: "Risotto cremos cu trufe negre și parmezan",
      price: 62,
      image: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400&h=400&fit=crop",
      categoryId: categoryMap["Risotto"]
    },
    {
      name: "Risotto agli Asparagi",
      description: "Risotto cu sparanghel verde, unt, parmezan, lămâie",
      price: 40,
      image: "https://images.unsplash.com/photo-1516714435131-44d6b64dc6a2?w=400&h=400&fit=crop",
      categoryId: categoryMap["Risotto"]
    },
    {
      name: "Risotto al Nero di Seppia",
      description: "Risotto negru cu cerneală de sepie, calamari, usturoi",
      price: 52,
      image: "https://images.unsplash.com/photo-1559847844-5315695dadae?w=400&h=400&fit=crop",
      categoryId: categoryMap["Risotto"]
    },

    // ===== ANTIPASTI =====
    {
      name: "Bruschette Trio",
      description: "Pâine artizanală cu roșii cherry, burrata și prosciutto",
      price: 24,
      image: "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=400&h=400&fit=crop",
      categoryId: categoryMap["Antipasti"]
    },
    {
      name: "Carpaccio di Manzo",
      description: "Vită maturată, rucola proaspătă, parmezan, ulei de trufe",
      price: 35,
      image: "https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=400&h=400&fit=crop",
      categoryId: categoryMap["Antipasti"]
    },
    {
      name: "Burrata con Prosciutto",
      description: "Burrata cremosă, prosciutto di Parma 24 luni, rucola",
      price: 42,
      image: "https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=400&h=400&fit=crop",
      categoryId: categoryMap["Antipasti"]
    },
    {
      name: "Antipasto Misto",
      description: "Selecție de mezeluri italiene, brânzeturi, măsline, grissini",
      price: 55,
      image: "https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=400&h=400&fit=crop",
      categoryId: categoryMap["Antipasti"]
    },
    {
      name: "Calamari Fritti",
      description: "Inele de calamari în crustă crocantă, sos aioli",
      price: 38,
      image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&h=400&fit=crop",
      categoryId: categoryMap["Antipasti"]
    },
    {
      name: "Vitello Tonnato",
      description: "Vițel fiert feliat subțire, sos de ton cremos, capere",
      price: 40,
      image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=400&fit=crop",
      categoryId: categoryMap["Antipasti"]
    },
    {
      name: "Arancini Siciliani",
      description: "Bilute de risotto prăjite cu mozzarella și ragù",
      price: 28,
      image: "https://images.unsplash.com/photo-1595295333158-4742f28fbd85?w=400&h=400&fit=crop",
      categoryId: categoryMap["Antipasti"]
    },
    {
      name: "Melanzane alla Parmigiana",
      description: "Vinete gratinate cu mozzarella, parmezan, sos de roșii",
      price: 32,
      image: "https://images.unsplash.com/photo-1625944525533-473f1a3d54e7?w=400&h=400&fit=crop",
      categoryId: categoryMap["Antipasti"]
    },

    // ===== CARNE & PEȘTE =====
    {
      name: "Ossobuco alla Milanese",
      description: "Rasol de vițel gătit lent, gremolata, risotto alla milanese",
      price: 68,
      image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=400&fit=crop",
      categoryId: categoryMap["Carne & Pește"]
    },
    {
      name: "Saltimbocca alla Romana",
      description: "Escalop de vițel cu prosciutto și salvie, sos de vin alb",
      price: 58,
      image: "https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=400&h=400&fit=crop",
      categoryId: categoryMap["Carne & Pește"]
    },
    {
      name: "Tagliata di Manzo",
      description: "Antricot de vită la grătar, rucola, roșii cherry, parmezan",
      price: 72,
      image: "https://images.unsplash.com/photo-1558030006-450675393462?w=400&h=400&fit=crop",
      categoryId: categoryMap["Carne & Pește"]
    },
    {
      name: "Pollo alla Cacciatora",
      description: "Pui gătit în stil vânătoresc cu roșii, ardei, măsline",
      price: 48,
      image: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=400&h=400&fit=crop",
      categoryId: categoryMap["Carne & Pește"]
    },
    {
      name: "Cotoletta alla Milanese",
      description: "Cotlet de vițel pane, cartofi prăjiți, lămâie",
      price: 55,
      image: "https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=400&h=400&fit=crop",
      categoryId: categoryMap["Carne & Pește"]
    },
    {
      name: "Branzino al Forno",
      description: "Biban de mare la cuptor cu legume mediteraneene",
      price: 65,
      image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&h=400&fit=crop",
      categoryId: categoryMap["Carne & Pește"]
    },
    {
      name: "Salmone alla Griglia",
      description: "File de somon la grătar cu sos de lămâie și capere",
      price: 58,
      image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=400&fit=crop",
      categoryId: categoryMap["Carne & Pește"]
    },
    {
      name: "Gamberoni alla Griglia",
      description: "Creveți tigru la grătar cu usturoi, pătrunjel, ulei de măsline",
      price: 62,
      image: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=400&h=400&fit=crop",
      categoryId: categoryMap["Carne & Pește"]
    },
    {
      name: "Filetto di Maiale",
      description: "Mușchiuleț de porc cu sos de mere și rozmarin",
      price: 52,
      image: "https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=400&h=400&fit=crop",
      categoryId: categoryMap["Carne & Pește"]
    },
    {
      name: "Agnello al Rosmarino",
      description: "Cotlete de miel cu rozmarin, usturoi și cartofi la cuptor",
      price: 75,
      image: "https://images.unsplash.com/photo-1514516345957-556ca7d90a29?w=400&h=400&fit=crop",
      categoryId: categoryMap["Carne & Pește"]
    },

    // ===== SUPE & CIORBE =====
    {
      name: "Minestrone",
      description: "Supă italiană de legume cu fasole, paste și parmezan",
      price: 24,
      image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=400&fit=crop",
      categoryId: categoryMap["Supe & Ciorbe"]
    },
    {
      name: "Zuppa di Pesce",
      description: "Supă de pește și fructe de mare în stil mediteranean",
      price: 42,
      image: "https://images.unsplash.com/photo-1594756202469-9ff9799b2e4e?w=400&h=400&fit=crop",
      categoryId: categoryMap["Supe & Ciorbe"]
    },
    {
      name: "Ribollita Toscana",
      description: "Supă tradițională toscană cu pâine, fasole și varză neagră",
      price: 26,
      image: "https://images.unsplash.com/photo-1603105037880-880cd4edfb0d?w=400&h=400&fit=crop",
      categoryId: categoryMap["Supe & Ciorbe"]
    },
    {
      name: "Crema di Pomodoro",
      description: "Supă cremă de roșii cu busuioc și crutoane",
      price: 22,
      image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=400&fit=crop",
      categoryId: categoryMap["Supe & Ciorbe"]
    },
    {
      name: "Stracciatella alla Romana",
      description: "Supă de pui cu ou bătut și parmezan",
      price: 20,
      image: "https://images.unsplash.com/photo-1604152135912-04a022e23696?w=400&h=400&fit=crop",
      categoryId: categoryMap["Supe & Ciorbe"]
    },

    // ===== SALATE =====
    {
      name: "Insalata Caprese",
      description: "Mozzarella di bufala, roșii proaspete, busuioc, ulei de măsline",
      price: 28,
      image: "https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?w=400&h=400&fit=crop",
      categoryId: categoryMap["Salate"]
    },
    {
      name: "Insalata Caesar",
      description: "Salată verde, piept de pui la grătar, parmezan, crutoane",
      price: 35,
      image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=400&fit=crop",
      categoryId: categoryMap["Salate"]
    },
    {
      name: "Insalata di Rucola",
      description: "Rucola, roșii cherry, parmezan, nuci, dressing balsamic",
      price: 26,
      image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=400&fit=crop",
      categoryId: categoryMap["Salate"]
    },
    {
      name: "Panzanella",
      description: "Salată toscană cu pâine, roșii, castraveți, ceapă roșie",
      price: 28,
      image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=400&fit=crop",
      categoryId: categoryMap["Salate"]
    },
    {
      name: "Insalata Mediterranea",
      description: "Mix de salate, măsline, roșii, brânză feta, dressing de lămâie",
      price: 30,
      image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=400&fit=crop",
      categoryId: categoryMap["Salate"]
    },
    {
      name: "Insalata di Mare",
      description: "Salată cu fructe de mare, legume proaspete, dressing citric",
      price: 42,
      image: "https://images.unsplash.com/photo-1551248429-40975aa4de74?w=400&h=400&fit=crop",
      categoryId: categoryMap["Salate"]
    },

    // ===== DESERTURI =====
    {
      name: "Tiramisu",
      description: "Mascarpone cremos, pișcoturi Savoiardi, espresso italian, cacao",
      price: 28,
      image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=400&fit=crop",
      categoryId: categoryMap["Deserturi"]
    },
    {
      name: "Panna Cotta",
      description: "Cremă de vanilie Madagascar, sos de fructe de pădure",
      price: 22,
      image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=400&fit=crop",
      categoryId: categoryMap["Deserturi"]
    },
    {
      name: "Cannoli Siciliani",
      description: "Tuburi crocante umplute cu ricotta dulce, fistic, ciocolată",
      price: 24,
      image: "https://images.unsplash.com/photo-1631206753348-db44968fd440?w=400&h=400&fit=crop",
      categoryId: categoryMap["Deserturi"]
    },
    {
      name: "Gelato Artigianale",
      description: "Înghețată artizanală - 3 gusturi la alegere",
      price: 18,
      image: "https://images.unsplash.com/photo-1567206563064-6f60f40a2b57?w=400&h=400&fit=crop",
      categoryId: categoryMap["Deserturi"]
    },
    {
      name: "Affogato",
      description: "Înghețată de vanilie 'înecată' în espresso fierbinte",
      price: 20,
      image: "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=400&h=400&fit=crop",
      categoryId: categoryMap["Deserturi"]
    },
    {
      name: "Torta della Nonna",
      description: "Tartă tradițională cu cremă de vanilie și pin",
      price: 26,
      image: "https://images.unsplash.com/photo-1519915028121-7d3463d5a49f?w=400&h=400&fit=crop",
      categoryId: categoryMap["Deserturi"]
    },
    {
      name: "Semifreddo al Cioccolato",
      description: "Desert înghețat de ciocolată neagră cu nuci",
      price: 28,
      image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop",
      categoryId: categoryMap["Deserturi"]
    },
    {
      name: "Zabaglione",
      description: "Cremă caldă de gălbenușuri cu vin Marsala și fructe",
      price: 24,
      image: "https://images.unsplash.com/photo-1587314168485-3236d6710814?w=400&h=400&fit=crop",
      categoryId: categoryMap["Deserturi"]
    },
    {
      name: "Crostata di Frutta",
      description: "Tartă cu cremă de patiserie și fructe proaspete de sezon",
      price: 26,
      image: "https://images.unsplash.com/photo-1464305795204-6f5bbfc7fb81?w=400&h=400&fit=crop",
      categoryId: categoryMap["Deserturi"]
    },

    // ===== BĂUTURI =====
    {
      name: "Espresso",
      description: "Cafea espresso italiană autentică",
      price: 8,
      image: "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400&h=400&fit=crop",
      categoryId: categoryMap["Băuturi"]
    },
    {
      name: "Cappuccino",
      description: "Espresso cu lapte spumat și cacao",
      price: 12,
      image: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=400&fit=crop",
      categoryId: categoryMap["Băuturi"]
    },
    {
      name: "Limonata Fresca",
      description: "Limonadă proaspătă cu mentă și gheață",
      price: 14,
      image: "https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400&h=400&fit=crop",
      categoryId: categoryMap["Băuturi"]
    },
    {
      name: "Aperol Spritz",
      description: "Aperol, prosecco, apă tonică, felie de portocală",
      price: 28,
      image: "https://images.unsplash.com/photo-1560512823-829485b8bf24?w=400&h=400&fit=crop",
      categoryId: categoryMap["Băuturi"]
    },
    {
      name: "Vino della Casa (Roșu)",
      description: "Vin roșu italian de casă - pahar",
      price: 22,
      image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=400&fit=crop",
      categoryId: categoryMap["Băuturi"]
    },
    {
      name: "Vino della Casa (Alb)",
      description: "Vin alb italian de casă - pahar",
      price: 22,
      image: "https://images.unsplash.com/photo-1566995541428-f2246c17cda1?w=400&h=400&fit=crop",
      categoryId: categoryMap["Băuturi"]
    },
    {
      name: "Prosecco",
      description: "Prosecco italian DOC - pahar",
      price: 26,
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop",
      categoryId: categoryMap["Băuturi"]
    },
    {
      name: "Negroni",
      description: "Gin, Campari, vermut roșu - clasic italian",
      price: 32,
      image: "https://images.unsplash.com/photo-1551751299-1b51cab2694c?w=400&h=400&fit=crop",
      categoryId: categoryMap["Băuturi"]
    },
    {
      name: "San Pellegrino",
      description: "Apă minerală carbogazoasă italiană",
      price: 10,
      image: "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=400&h=400&fit=crop",
      categoryId: categoryMap["Băuturi"]
    },
    {
      name: "Acqua Panna",
      description: "Apă minerală plată italiană",
      price: 10,
      image: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&h=400&fit=crop",
      categoryId: categoryMap["Băuturi"]
    },

    // ===== SPECIALITĂȚI =====
    {
      name: "Menu Degustare (5 feluri)",
      description: "Experiență culinară completă: antipasto, primo, secondo, contorno, dolce",
      price: 180,
      image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=400&fit=crop",
      categoryId: categoryMap["Specialități"]
    },
    {
      name: "Fiorentina 1kg",
      description: "Cotlet de vită Chianina maturată 30 zile, la grătar pe cărbuni",
      price: 220,
      image: "https://images.unsplash.com/photo-1558030006-450675393462?w=400&h=400&fit=crop",
      categoryId: categoryMap["Specialități"]
    },
    {
      name: "Plateau Fructe de Mare",
      description: "Selecție de fructe de mare proaspete pentru 2 persoane",
      price: 195,
      image: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=400&h=400&fit=crop",
      categoryId: categoryMap["Specialități"]
    },
    {
      name: "Trufe Negre Proaspete",
      description: "Trufe negre proaspete de sezon (10g) pentru a completa orice fel",
      price: 85,
      image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=400&fit=crop",
      categoryId: categoryMap["Specialități"]
    },
    {
      name: "Aragosta alla Griglia",
      description: "Homar întreg la grătar cu unt de usturoi și lămâie",
      price: 280,
      image: "https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=400&h=400&fit=crop",
      categoryId: categoryMap["Specialități"]
    }
  ]

  for (const item of menuItems) {
    await prisma.menuItem.create({
      data: item
    })
  }

  console.log('💬 Creating testimonials...')

  // Creăm testimonialele cu imagini reale
  const testimonials = [
    {
      name: "Maria Ionescu",
      role: "Food Blogger",
      content: "Cea mai bună pizza din București! Atmosfera este minunată, iar personalul foarte amabil. O experiență culinară pe care o recomand cu căldură tuturor!",
      rating: 5,
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face",
      active: true,
      order: 1
    },
    {
      name: "Alexandru Popa",
      role: "Client Fidel",
      content: "Paste carbonara perfecte! Exact ca în Italia. Am revenit de nenumărate ori și nu am fost niciodată dezamăgit. Locul meu preferat din București.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
      active: true,
      order: 2
    },
    {
      name: "Elena Dumitrescu",
      role: "Event Planner",
      content: "Locul perfect pentru o seară romantică. Tiramisu-ul este absolut divin! Am organizat aici mai multe evenimente și totul a fost impecabil.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face",
      active: true,
      order: 3
    },
    {
      name: "Andrei Munteanu",
      role: "Chef",
      content: "Ca profesionist în domeniu, apreciez calitatea ingredientelor și tehnica de preparare. Risotto-ul lor rivalizeaza cu cele din Milano. Bravo!",
      rating: 5,
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
      active: true,
      order: 4
    },
    {
      name: "Cristina Vasilescu",
      role: "Influencer Lifestyle",
      content: "Fiecare vizită aici este o experiență de neuitat. De la prezentare la gust, totul este perfect. Recomand cu încredere pentru orice ocazie specială!",
      rating: 5,
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face",
      active: true,
      order: 5
    }
  ]

  for (const testimonial of testimonials) {
    await prisma.testimonial.create({
      data: testimonial
    })
  }

  console.log('✅ Seed completed successfully!')
  console.log(`Created ${categories.length} categories, ${menuItems.length} menu items and ${testimonials.length} testimonials`)
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
