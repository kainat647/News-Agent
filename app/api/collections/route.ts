import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const userId = searchParams.get('userId');
    const includeItems = searchParams.get('includeItems') === 'true';

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      );
    }

    const { data: collections, error } = await supabase
      .from('collections')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (includeItems && collections) {
        const enriched = await Promise.all(
          collections.map(async (collection) => {
            const { data: items, error: itemsError } = await supabase
              .from('collection_items')
              .select('*')
              .eq('collection_id', collection.id);
      
            return {
              ...collection,
              items: items || []
            };
          })
        );
      
        return NextResponse.json({
          success: true,
          collections: enriched
        });
      }

    return NextResponse.json({
      success: true,
      collections: collections || []
    });
  } catch (error) {
    console.error('Error fetching collections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch collections', details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, name, description, color, isPublic } = body;

    if (!userId || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('collections')
      .insert({
        user_id: userId,
        name: name,
        description: description || '',
        color: color || '#10b981',
        is_public: isPublic || false,
      })
      .select();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      collection: data?.[0]
    });
  } catch (error) {
    console.error('Error creating collection:', error);
    return NextResponse.json(
      { error: 'Failed to create collection', details: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const collectionId = searchParams.get('id');

    if (!collectionId) {
      return NextResponse.json(
        { error: 'Missing collectionId' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('collections')
      .delete()
      .eq('id', collectionId);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Collection deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting collection:', error);
    return NextResponse.json(
      { error: 'Failed to delete collection', details: String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name } = body;

    if (!id || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('collections')
      .update({ name: name })
      .eq('id', id)
      .select();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      collection: data?.[0]
    });
  } catch (error) {
    console.error('Error updating collection:', error);
    return NextResponse.json(
      { error: 'Failed to update collection', details: String(error) },
      { status: 500 }
    );
  }
}