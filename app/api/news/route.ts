export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'general';
    const search = searchParams.get('search');
    const apiKey = process.env.NEXT_PUBLIC_NEWS_API_KEY;
  
    try {
      const url = search
        ? `https://newsapi.org/v2/everything?q=${search}&apiKey=${apiKey}`
        : `https://newsapi.org/v2/top-headlines?category=${category}&apiKey=${apiKey}`;
  
      const response = await fetch(url);
      const data = await response.json();
      return Response.json(data);
    } catch (error) {
      return Response.json({ error: 'Failed to fetch' }, { status: 500 });
    }
  }