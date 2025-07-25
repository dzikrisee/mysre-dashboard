// src/app/api/users/route.ts - SESUAI PRISMA SCHEMA (TIDAK UBAH FUNGSI)
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET - Fetch all users
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const group = searchParams.get('group');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Query sesuai Prisma schema
    let query = supabase.from('User').select('*', { count: 'exact' });

    // Apply filters
    if (role && (role === 'ADMIN' || role === 'USER')) {
      query = query.eq('role', role);
    }

    if (group && ['A', 'B'].includes(group)) {
      query = query.eq('group', group);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,nim.ilike.%${search}%`);
    }

    // Order by createdAt (sesuai Prisma)
    query = query.order('createdAt', { ascending: false }).range(offset, offset + limit - 1);

    const { data: users, error, count } = await query;

    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      users: users || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (error: any) {
    console.error('Error in users GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields sesuai Prisma
    const { name, email, password, role = 'USER', group, nim, ...otherFields } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Nama, email, dan password wajib diisi' }, { status: 400 });
    }

    // Check if email already exists
    const { data: existingUser } = await supabase.from('User').select('id').eq('email', email).single();

    if (existingUser) {
      return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 400 });
    }

    // Prepare user data sesuai Prisma schema
    const userData = {
      name,
      email,
      password, // Note: In production, hash the password
      role: role as 'ADMIN' | 'USER',
      group: group || null,
      nim: nim || null,
      createdAt: new Date().toISOString(),
      updateAt: new Date().toISOString(), // Sesuai Prisma: updateAt
      isEmailVerified: false,
      isPhoneVerified: false,
      token_balance: 0,
      ...otherFields,
    };

    const { data: newUser, error } = await supabase.from('User').insert(userData).select().single();

    if (error) {
      console.error('Error creating user:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Remove password from response
    const { password: _, ...userResponse } = newUser;

    return NextResponse.json(
      {
        message: 'User berhasil dibuat',
        user: userResponse,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error('Error in users POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update user
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, password, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Check if user exists
    const { data: existingUser, error: fetchError } = await supabase.from('User').select('id').eq('id', id).single();

    if (fetchError || !existingUser) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
    }

    // Prepare update data sesuai Prisma
    const userData: any = {
      ...updateData,
      updateAt: new Date().toISOString(), // Sesuai Prisma: updateAt
    };

    // Only include password if provided
    if (password) {
      userData.password = password; // Note: Hash in production
    }

    const { data: updatedUser, error } = await supabase.from('User').update(userData).eq('id', id).select().single();

    if (error) {
      console.error('Error updating user:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Remove password from response
    const { password: _, ...userResponse } = updatedUser;

    return NextResponse.json({
      message: 'User berhasil diperbarui',
      user: userResponse,
    });
  } catch (error: any) {
    console.error('Error in users PUT:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete user
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Check if user exists
    const { data: existingUser, error: fetchError } = await supabase.from('User').select('id, role').eq('id', id).single();

    if (fetchError || !existingUser) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
    }

    // Prevent deleting the last admin
    if (existingUser.role === 'ADMIN') {
      const { count } = await supabase.from('User').select('id', { count: 'exact' }).eq('role', 'ADMIN');

      if (count && count <= 1) {
        return NextResponse.json({ error: 'Tidak dapat menghapus admin terakhir' }, { status: 400 });
      }
    }

    const { error } = await supabase.from('User').delete().eq('id', id);

    if (error) {
      console.error('Error deleting user:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      message: 'User berhasil dihapus',
    });
  } catch (error: any) {
    console.error('Error in users DELETE:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
