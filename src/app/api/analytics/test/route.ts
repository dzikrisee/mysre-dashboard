// =====================================
// FILE: src/app/api/analytics/test/route.ts
// ACTION: CREATE new file (create folders: src/app/api/analytics/test/)
// =====================================

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId, document, metadata } = body;

    // Validate required fields
    if (!action || !userId) {
      return NextResponse.json({ error: 'Action and userId are required' }, { status: 400 });
    }

    // Insert analytics data
    const { data, error } = await supabase
      .from('analytics')
      .insert({
        action: action,
        userId: userId,
        document: document || `test-${action}`,
        metadata: {
          ...metadata,
          source: 'test-page',
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      })
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to insert analytics data', details: error.message }, { status: 500 });
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Analytics data recorded successfully',
      data: data?.[0],
    });
  } catch (error) {
    console.error('API error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: 'Internal server error', details: errorMessage }, { status: 500 });
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json({ message: 'Analytics test API endpoint' });
}
