import { NextRequest, NextResponse } from 'next/server';
import { db, profiles } from '@/lib/db/index';
import { eq } from 'drizzle-orm';

// GET method to retrieve a user profile
export async function GET(request: NextRequest) {
  try {
    // Get identity_id from URL searchParams
    const identityId = request.nextUrl.searchParams.get('identity_id');
    
    if (!identityId) {
      return NextResponse.json(
        { error: 'Identity ID is required as a query parameter' },
        { status: 400 }
      );
    }
    
    // Query the database for the profile
    const profile = await db
      .select()
      .from(profiles)
      .where(eq(profiles.identity_id, identityId))
      .limit(1);
    
    // Return the profile (or empty array if not found)
    return NextResponse.json({
      profile: profile.length > 0 ? profile[0] : null,
      message: profile.length > 0 ? 'Profile found' : 'Profile not found'
    });
    
  } catch (error) {
    console.error('Error retrieving profile:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve profile', details: (error as Error).message },
      { status: 500 }
    );
  }
}

// POST method to create or update a user profile
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { identity_id, name, email, institution } = body;
    
    if (!identity_id) {
      return NextResponse.json(
        { error: 'Identity ID is required' },
        { status: 400 }
      );
    }
    
    // Check if profile already exists
    const existingProfile = await db
      .select()
      .from(profiles)
      .where(eq(profiles.identity_id, identity_id))
      .limit(1);
    
    // Upsert the profile (insert if doesn't exist, update if exists)
    await db
      .insert(profiles)
      .values({
        identity_id,
        name,
        email,
        institution
      })
      .onConflictDoUpdate({
        target: profiles.identity_id,
        set: {
          name,
          email,
          institution
        }
      });
    
    return NextResponse.json({ 
      message: 'Profile updated successfully',
      profile: {
        identity_id,
        name,
        email,
        institution
      }
    });
    
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile', details: (error as Error).message },
      { status: 500 }
    );
  }
} 