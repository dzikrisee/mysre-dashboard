import { NextRequest, NextResponse } from 'next/server';
import { BillingService } from '@/lib/services/billing-service';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

// GET - Get user token usage statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const month = searchParams.get('month');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Verify user exists
    const { data: user, error: userError } = await supabase.from('User').select('id, name, email, tier, token_balance, monthly_token_limit').eq('id', userId).single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get monthly usage
    const monthDate = month ? new Date(month) : new Date();
    const monthlyUsage = await BillingService.getMonthlyUsage(userId, monthDate);

    return NextResponse.json({
      user,
      monthlyUsage: monthlyUsage || {
        total_tokens: 0,
        total_cost: 0,
        usage_by_action: {},
      },
    });
  } catch (error) {
    console.error('Error in token usage GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Record new token usage
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, action, tokensUsed, context, metadata } = body;

    // Validate required fields
    if (!userId || !action || !tokensUsed || tokensUsed <= 0) {
      return NextResponse.json({ error: 'Missing required fields: userId, action, tokensUsed' }, { status: 400 });
    }

    // Record token usage
    const result = await BillingService.recordTokenUsage(userId, action, tokensUsed, context, metadata);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Token usage recorded successfully',
      remaining_balance: result.remaining_balance,
    });
  } catch (error) {
    console.error('Error in token usage POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
