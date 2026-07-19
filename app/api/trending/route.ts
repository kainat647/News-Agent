// app/api/trending/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '5');

    let query = supabase
      .from('trending_articles')
      .select('*')
      .order('read_count', { ascending: false })
      .limit(limit);

    if (category) {
      query = query.eq('article_category', category);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Get trending by category overview
    const { data: allTrending, error: allError } = await supabase
      .from('trending_articles')
      .select('article_category, read_count');

    if (allError) throw allError;

    const trendingByCategory: any = {};
    allTrending?.forEach(item => {
      const cat = item.article_category;
      if (!trendingByCategory[cat]) {
        trendingByCategory[cat] = {
          totalReads: 0,
          articles: 0
        };
      }
      trendingByCategory[cat].totalReads += item.read_count;
      trendingByCategory[cat].articles += 1;
    });

    return NextResponse.json({
      success: true,
      trending: data || [],
      trendingByCategory: trendingByCategory,
      period: 'last_7_days'
    });
  } catch (error) {
    console.error('Error fetching trending:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trending articles', details: String(error) },
      { status: 500 }
    );
  }
}