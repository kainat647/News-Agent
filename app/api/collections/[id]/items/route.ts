import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: collectionId } = await params;

    const { data, error } = await supabase
      .from('collection_items')
      .select('*')
      .eq('collection_id', collectionId)
      .order('added_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      items: data || []
    });
  } catch (error) {
    console.error('Error fetching collection items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch collection items', details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: collectionId } = await params;
    const body = await request.json();
    const { articleUrl, articleTitle, articleDescription, articleImage } = body;

    if (!articleUrl || !articleTitle) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('collection_items')
      .insert({
        collection_id: collectionId,
        article_url: articleUrl,
        article_title: articleTitle,
        article_description: articleDescription || '',
        article_image: articleImage || '',
      })
      .select();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          {
            success: false,
            error: 'Article already in this collection',
            code: 'ALREADY_EXISTS'
          },
          { status: 409 }
        );
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      item: data?.[0],
      message: 'Article added to collection'
    });
  } catch (error) {
    console.error('Error adding to collection:', error);
    return NextResponse.json(
      { error: 'Failed to add article to collection', details: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: collectionId } = await params;
    const { searchParams } = request.nextUrl;
    const articleUrl = searchParams.get('articleUrl');

    if (!articleUrl) {
      return NextResponse.json(
        { error: 'Missing articleUrl' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('collection_items')
      .delete()
      .eq('collection_id', collectionId)
      .eq('article_url', articleUrl);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Article removed from collection'
    });
  } catch (error) {
    console.error('Error removing from collection:', error);
    return NextResponse.json(
      { error: 'Failed to remove article from collection', details: String(error) },
      { status: 500 }
    );
  }
}