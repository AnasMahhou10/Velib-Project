import { PrismaClient } from '../.prisma-generated/client';
import axios from 'axios';

const prisma = new PrismaClient();

type VelibRecord = {
  fields?: {
    stationcode?: string;
    name?: string;
    coordonnees_geo?: [number, number];
  };
};

async function main() {
  const url =
    'https://opendata.paris.fr/api/records/1.0/search/?dataset=velib-disponibilite-en-temps-reel&rows=500';

  const response = await axios.get<{ records: VelibRecord[] }>(url);

  const records = response.data.records ?? [];

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
    .filter((s): s is { id: number; name: string; lat: number; lng: number } => s !== null);

  if (!stationsData.length) {
    console.warn('Aucune station valide trouvée dans les données Velib.');
    return;
  }

  const chunkSize = 100;
  for (let i = 0; i < stationsData.length; i += chunkSize) {
    const chunk = stationsData.slice(i, i + chunkSize);
    await prisma.station.createMany({
      data: chunk,
      skipDuplicates: true,
    });
  }

  console.log(`Import de ${stationsData.length} stations Velib terminé.`);

  // Crée un utilisateur de démo avec id 1 si inexistant
  await prisma.user.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      username: 'demo',
      email: 'demo@example.com',
    },
  });

  console.log('Utilisateur de démo (id=1) prêt.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

