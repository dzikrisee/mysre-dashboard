// src/app/api/articles/route.ts - FIXED FOR PRISMA SCHEMA & UPLOADS BUCKET
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET - Fetch all articles
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const search = searchParams.get('search');
    const year = searchParams.get('year');
    const author = searchParams.get('author');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // ✅ FIXED: Sesuaikan dengan skema Prisma database utama
    let query = supabase.from('Article').select(
      `
        id,
        title,
        filePath,
        createdAt,
        updateAt,
        userId,
        sessionId,
        abstract,
        author,
        doi,
        keywords,
        year,
        user:userId(id, name, email, role, group, nim, avatar_url)
      `,
      { count: 'exact' },
    );

    // Apply filters
    if (userId) {
      query = query.eq('userId', userId);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,abstract.ilike.%${search}%,keywords.ilike.%${search}%`);
    }

    if (year) {
      query = query.eq('year', year);
    }

    if (author) {
      query = query.ilike('author', `%${author}%`);
    }

    // ✅ FIXED: Order by createdAt (sesuai Prisma schema)
    query = query.order('createdAt', { ascending: false }).range(offset, offset + limit - 1);

    const { data: articles, error, count } = await query;

    if (error) {
      console.error('Error fetching articles:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      articles: articles || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (error: any) {
    console.error('Error in articles GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new article
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // ✅ UPDATED: Validate required fields sesuai Prisma schema
    const { title, filePath, userId, sessionId, abstract, author, doi, keywords, year } = body;

    if (!title || !filePath) {
      return NextResponse.json({ error: 'Judul dan file path wajib diisi' }, { status: 400 });
    }

    // ✅ UPDATED: Prepare article data sesuai Prisma schema
    const articleData = {
      title,
      filePath,
      userId: userId || null,
      sessionId: sessionId || null,
      abstract: abstract || null,
      author: author || null,
      doi: doi || null,
      keywords: keywords || null,
      year: year || null,
      createdAt: new Date().toISOString(),
      updateAt: new Date().toISOString(), // ✅ FIXED: updateAt sesuai Prisma
    };

    const { data: newArticle, error } = await supabase.from('Article').insert(articleData).select('*').single();

    if (error) {
      console.error('Error creating article:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      {
        message: 'Artikel berhasil dibuat',
        article: newArticle,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error('Error in articles POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update article
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Article ID is required' }, { status: 400 });
    }

    // Check if article exists
    const { data: existingArticle, error: fetchError } = await supabase.from('Article').select('id').eq('id', id).single();

    if (fetchError || !existingArticle) {
      return NextResponse.json({ error: 'Artikel tidak ditemukan' }, { status: 404 });
    }

    // ✅ UPDATED: Prepare update data sesuai Prisma
    const articleData = {
      ...updateData,
      updateAt: new Date().toISOString(), // ✅ FIXED: updateAt
    };

    const { data: updatedArticle, error } = await supabase.from('Article').update(articleData).eq('id', id).select('*').single();

    if (error) {
      console.error('Error updating article:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Artikel berhasil diperbarui',
      article: updatedArticle,
    });
  } catch (error: any) {
    console.error('Error in articles PUT:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete article
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Article ID is required' }, { status: 400 });
    }

    // Check if article exists and get file path for cleanup
    const { data: existingArticle, error: fetchError } = await supabase.from('Article').select('id, filePath').eq('id', id).single();

    if (fetchError || !existingArticle) {
      return NextResponse.json({ error: 'Artikel tidak ditemukan' }, { status: 404 });
    }

    // Delete the article record
    const { error: deleteError } = await supabase.from('Article').delete().eq('id', id);

    if (deleteError) {
      console.error('Error deleting article:', deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    // ✅ FIXED: Try to delete the file from uploads bucket (optional, don't fail if it doesn't exist)
    if (existingArticle.filePath) {
      try {
        await supabase.storage.from('uploads').remove([existingArticle.filePath]);
      } catch (storageError) {
        console.warn('Could not delete file from storage:', storageError);
        // Don't fail the request if storage deletion fails
      }
    }

    return NextResponse.json({
      message: 'Artikel berhasil dihapus',
    });
  } catch (error: any) {
    console.error('Error in articles DELETE:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET specific article by ID
export async function GET_BY_ID(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    const { data: article, error } = await supabase
      .from('Article')
      .select(
        `
        id,
        title,
        filePath,
        createdAt,
        updateAt,
        userId,
        sessionId,
        abstract,
        author,
        doi,
        keywords,
        year,
        user:userId(id, name, email, role, group, nim, avatar_url)
      `,
      )
      .eq('id', id)
      .single();

    if (error || !article) {
      return NextResponse.json({ error: 'Artikel tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ article });
  } catch (error: any) {
    console.error('Error fetching article:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
