import { NextRequest, NextResponse } from 'next/server';
import { prismaErrorResponse, validationErrorResponse } from '../../../../../src/lib/apiErrors';
import { joinRideGroupSchema } from '../../../../../src/lib/schemas/rideGroup';
import { joinRideGroup } from '../../../../../src/services/rideGroupService';

type RouteParams = {
  id: string;
};

export async function POST(
  req: NextRequest,
  context: { params: Promise<RouteParams> },
) {
  try {
    const { id } = await context.params;
    const rideGroupId = Number(id);

    if (!rideGroupId || Number.isNaN(rideGroupId)) {
      return NextResponse.json({ error: 'Identifiant de balade invalide.' }, { status: 400 });
    }

    const body = await req.json();
    const parsed = joinRideGroupSchema.safeParse(body);

    if (!parsed.success) {
      return validationErrorResponse(parsed.error);
    }

    const participation = await joinRideGroup(rideGroupId, parsed.data.userId);
    return NextResponse.json(participation, { status: 201 });
  } catch (error) {
    return prismaErrorResponse(error);
  }
}
