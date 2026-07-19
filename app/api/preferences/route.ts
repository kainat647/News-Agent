import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!  
);

export async function POST(request: Request) {
  const { topics, userId } = await request.json();

  console.log('POST /api/preferences - Received:', { topics, userId });

  try {
    if (!userId || !topics || topics.length === 0) {
      throw new Error('Missing userId or topics');
    }

    // Clear old preferences for this user
    const { error: deleteError } = await supabase
      .from('user_preferences')
      .delete()
      .eq('user_id', userId);

    if (deleteError) {
      console.error('Delete error:', deleteError);
      throw deleteError;
    }

    const topicsArray = Array.from(topics);
    console.log('Inserting topics:', topicsArray);

    const { error: insertError } = await supabase
      .from('user_preferences')
      .insert(
        topicsArray.map(topic => ({
          user_id: userId,
          topic: topic
        }))
      );

    if (insertError) {
      console.error('Insert error:', insertError);
      throw insertError;
    }

    console.log('Successfully saved preferences');
    return Response.json({ success: true });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : JSON.stringify(error);
    console.error('Error saving preferences:', errorMsg);
    return Response.json({ 
      success: false, 
      error: errorMsg
    });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    console.log('GET /api/preferences - userId:', userId);

    if (!userId) {
      return Response.json({ topics: [] });
    }

    const { data, error } = await supabase
      .from('user_preferences')
      .select('topic')
      .eq('user_id', userId);

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    const topics = data ? data.map(row => row.topic) : [];
    console.log('Loaded topics:', topics);
    return Response.json({ topics });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : JSON.stringify(error);
    console.error('Error loading preferences:', errorMsg);
    return Response.json({ 
      topics: [],
      error: errorMsg
    });
  }
}