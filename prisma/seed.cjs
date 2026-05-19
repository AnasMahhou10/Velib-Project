// Seed Prisma with Velib stations from OpenData Paris + demo user

const { PrismaClient } = require("../.prisma-generated/client");
const axios = require("axios");

const prisma = new PrismaClient();

async function main() {
  console.log("Lancement du seed Velib...");

  const url =
    "https://opendata.paris.fr/api/records/1.0/search/?dataset=velib-disponibilite-en-temps-reel&rows=500";

  const response = await axios.get(url);
  const records = response.data?.records ?? [];

  console.log(`Données reçues depuis OpenData: ${records.length} enregistrements bruts.`);

  const stationsData = records
    .map((record) => {
      const fields = record.fields;
      if (!fields) return null;

      const id = fields.stationcode ? Number(fields.stationcode) : undefined;
      const name = fields.name;
      const coords = fields.coordonnees_geo;

      if (!id || !name || !coords || coords.length !== 2) return null;

      const [lat, lng] = coords;

      return {
        id,
        name,
        lat,
        lng,
      };
    })
    .filter(Boolean);

  console.log(`Stations Velib valides après filtrage: ${stationsData.length}.`);

  if (!stationsData.length) {
    console.warn("Aucune station valide trouvée dans les données Velib.");
  } else {
    const chunkSize = 100;
    for (let i = 0; i < stationsData.length; i += chunkSize) {
      const chunk = stationsData.slice(i, i + chunkSize);
      await prisma.station.createMany({
        data: chunk,
        skipDuplicates: true,
      });
      console.log(`Chunk de ${chunk.length} stations inséré (index ${i}).`);
    }

    console.log(`Import de ${stationsData.length} stations Velib terminé.`);
  }

  // Crée un utilisateur de démo avec id 1 si inexistant
  await prisma.user.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      username: "demo",
      email: "demo@example.com",
    },
  });

  console.log("Utilisateur de démo (id=1) prêt.");
}

main()
  .catch((e) => {
    console.error("Erreur dans le seed Velib :", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

