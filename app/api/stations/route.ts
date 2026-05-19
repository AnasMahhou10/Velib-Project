import { NextResponse } from 'next/server';
import { prisma } from '../../../src/lib/prisma';

export async function GET() {
  try {
    const stations = await prisma.station.findMany({
      orderBy: { id: 'asc' },
    });

    return NextResponse.json(stations);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des stations.' },
      { status: 500 },
    );
  }
}

