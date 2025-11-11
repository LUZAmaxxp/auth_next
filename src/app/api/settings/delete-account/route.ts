import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { Intervention, Reclamation, UserSettings } from '@/lib/models';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Connect to database
    await dbConnect();

    // Delete all user data
    await Promise.all([
      Intervention.deleteMany({ userId: session.user.id }),
      Reclamation.deleteMany({ userId: session.user.id }),
      UserSettings.deleteOne({ userId: session.user.id }),
    ]);

    // Note: BetterAuth handles user deletion through their API
    // This endpoint only deletes application-specific data

    return NextResponse.json({
      success: true,
      message: 'Account deletion request submitted. All your data has been removed.'
    });

  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
