
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, articleUrl, articleTitle, articleCategory, readingTimeSeconds, source } = body;

    if (!userId || !articleUrl || !articleTitle) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Log the read
    const { error: readingError } = await supabase
      .from('reading_history')
      .upsert({
        user_id: userId,
        article_url: articleUrl,
        article_title: articleTitle,
        article_category: articleCategory,
        reading_time_seconds: readingTimeSeconds || 0,
        source: source,
        read_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,article_url'
      });

    if (readingError) throw readingError;

    const { error: trendingError } = await supabase
      .from('trending_articles')
      .upsert({
        article_url: articleUrl,
        article_title: articleTitle,
        article_category: articleCategory || 'General',
        read_count: 1,
        trending_score: 1,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'article_url'
      });

    if (trendingError) throw trendingError;

    const { error } = await supabase.rpc('increment_read_count', { url: articleUrl });
    if (error) {
    console.log('Trending increment error:', error);
    }

    return NextResponse.json({
      success: true,
      message: 'Article read logged successfully'
    });
  } catch (error) {
    console.error('Error logging read:', error);
    return NextResponse.json(
      { error: 'Failed to log article read', details: String(error) },
      { status: 500 }
    );
  }
}