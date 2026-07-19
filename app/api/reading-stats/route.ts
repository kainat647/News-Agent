import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function calculateStreak(readingHistory: any[]) {
  if (readingHistory.length === 0) return 0;

  const dates = readingHistory
    .map(r => new Date(r.read_at).toDateString())
    .filter((v, i, a) => a.indexOf(v) === i)
    .sort()
    .reverse();

  let streak = 1;
  for (let i = 0; i < dates.length - 1; i++) {
    const current = new Date(dates[i]);
    const next = new Date(dates[i + 1]);
    const diff = (current.getTime() - next.getTime()) / (1000 * 60 * 60 * 24);

    if (diff === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      );
    }

    // Get all reading history for the user
    const { data: readingHistory, error: historyError } = await supabase
      .from('reading_history')
      .select('*')
      .eq('user_id', userId);

    if (historyError) throw historyError;

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Calculate stats
    const totalArticles = readingHistory?.length || 0;
    const thisWeek = readingHistory?.filter(r => new Date(r.read_at) > weekAgo).length || 0;
    const thisMonth = readingHistory?.filter(r => new Date(r.read_at) > monthAgo).length || 0;

    // Calculate favorite category
    const categoryMap: any = {};
    readingHistory?.forEach(r => {
      if (r.article_category) {
        categoryMap[r.article_category] = (categoryMap[r.article_category] || 0) + 1;
      }
    });

    const favoriteCategory = Object.entries(categoryMap)
      .sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || 'General';

    // Calculate total reading time
    const totalReadingMinutes = Math.round(
      (readingHistory?.reduce((sum, r) => sum + (r.reading_time_seconds || 0), 0) || 0) / 60
    );

    // Get reading by category
    const readingByCategory: any = {};
    readingHistory?.forEach(r => {
      const category = r.article_category || 'Other';
      readingByCategory[category] = (readingByCategory[category] || 0) + 1;
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalArticlesRead: totalArticles,
        articlesReadThisWeek: thisWeek,
        articlesReadThisMonth: thisMonth,
        totalReadingMinutes: totalReadingMinutes,
        favoriteCategory: favoriteCategory,
        readingByCategory: readingByCategory,
        reading_streak: calculateStreak(readingHistory || []),
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reading stats', details: String(error) },
      { status: 500 }
    );
  }
}