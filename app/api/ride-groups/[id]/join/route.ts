import { NextRequest, NextResponse } from 'next/server';
import { isAuthPayload, requireAuth } from '@/lib/auth/requireAuth';
import { prismaErrorResponse } from '@/lib/apiErrors';
import { joinRideGroup } from '@/services/rideGroupService';

type RouteParams = {
  id: string;
};

export async function POST(
  req: NextRequest,
  context: { params: Promise<RouteParams> },
) {
  try {
    const authResult = await requireAuth(req);
    if (!isAuthPayload(authResult)) {
      return authResult;
    }

    const { id } = await context.params;
    const rideGroupId = Number(id);

    if (!rideGroupId || Number.isNaN(rideGroupId)) {
      return NextResponse.json(
        { error: 'Identifiant de balade invalide.' },
        { status: 400 },
      );
    }

    const participation = await joinRideGroup(
      rideGroupId,
      authResult.userId,
    );
    return NextResponse.json(participation, { status: 201 });
  } catch (error) {
    return prismaErrorResponse(error);
  }
}
