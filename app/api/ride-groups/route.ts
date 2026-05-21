import { NextRequest, NextResponse } from 'next/server';
import { isAuthPayload, requireAuth } from '@/lib/auth/requireAuth';
import { prismaErrorResponse, validationErrorResponse } from '@/lib/apiErrors';
import { createRideGroupSchema } from '@/lib/schemas/rideGroup';
import { createRideGroup, listRideGroups } from '@/services/rideGroupService';

export async function GET() {
  try {
    const rideGroups = await listRideGroups();
    return NextResponse.json(rideGroups);
  } catch (error) {
    return prismaErrorResponse(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if (!isAuthPayload(authResult)) {
      return authResult;
    }

    const body = await req.json();
    const parsed = createRideGroupSchema.safeParse(body);

    if (!parsed.success) {
      return validationErrorResponse(parsed.error);
    }

    const rideGroup = await createRideGroup(parsed.data, authResult.userId);
    return NextResponse.json(rideGroup, { status: 201 });
  } catch (error) {
    return prismaErrorResponse(error);
  }
}
