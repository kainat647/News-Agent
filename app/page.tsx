'use client';

import { useState, useEffect } from 'react';
import { Moon, Sun, Settings, Sparkles, Search, BookmarkPlus, TrendingUp, 
  BarChart3, FolderPlus, X, Plus } from 'lucide-react';

  interface Article {
    id: string;
    title: string;
    description?: string;
    url?: string;
    urlToImage?: string;
    category?: string;
    date?: string;
    source?: string;
    image?: string;
  }

  interface ReadingStats {
    totalArticlesRead: number;
    articlesReadThisWeek: number;
    articlesReadThisMonth: number;
    totalReadingMinutes: number;
    favoriteCategory: string;
    readingByCategory: Record<string, number>;
    reading_streak: number;
  }

  interface Collection {
    id: string;
    user_id: string;
    name: string;
    description?: string;
    color: string;
    is_public: boolean;
    created_at?: string;
    items?: CollectionItem[];
  }

  interface CollectionItem {
    id: string;
    collection_id: string;
    article_url: string;
    article_title: string;
    article_description?: string;
    article_image?: string;
    added_at?: string;
  }

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set());
  const [showPreferences, setShowPreferences] = useState(false);
  const [explanations, setExplanations] = useState<Record<number, string>>({});
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [savingPreferences, setSavingPreferences] = useState(false);

  const [darkMode, setDarkMode] = useState(false);

      useEffect(() => {
        const savedDarkMode = localStorage.getItem('darkMode');
        if (savedDarkMode !== null) {
          setDarkMode(JSON.parse(savedDarkMode));
        } else {
          setDarkMode(true);
        }
      }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [showAllArticles, setShowAllArticles] = useState(false);

  const [activeTab, setActiveTab] = useState('home'); 
  const [readingStats, setReadingStats] = useState<ReadingStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [trending, setTrending] = useState([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [trendingByCategory, setTrendingByCategory] = useState({});
  const [showCreateCollection, setShowCreateCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionColor, setNewCollectionColor] = useState('#10b981');
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [selectedArticleForCollection, setSelectedArticleForCollection] = useState<Article | null>(null);

  const topics = ['Technology', 'Business', 'Sports', 'Health', 'Politics', 'Entertainment', 'Science'];
  const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

  const keywords: Record<string, string[]> = {
    'Technology': ['tech', 'ai', 'software', 'app', 'digital', 'cyber', 'computer', 'internet', 'innovation', 'startup', 'tesla', 'apple', 'google', 'meta', 'robot', 'algorithm', 'data', 'coding', 'developer', 'programming', 'blockchain', 'cryptocurrency', 'ai model', 'machine learning'],
    'Business': ['business', 'market', 'stock', 'economy', 'sales', 'company', 'corporate', 'trade', 'commerce', 'profit', 'earnings', 'investment', 'finance', 'startup', 'venture', 'deal', 'acquisition', 'quarterly', 'revenue', 'ceo'],
    'Sports': ['sport', 'game', 'team', 'player', 'match', 'league', 'championship', 'football', 'basketball', 'baseball', 'soccer', 'nfl', 'nba', 'nhl', 'mlb', 'coach', 'tournament', 'athlete', 'score', 'win', 'final', 'tennis', 'cricket'],
    'Health': ['health', 'medical', 'disease', 'doctor', 'hospital', 'vaccine', 'virus', 'covid', 'covid-19', 'pandemic', 'wellness', 'fitness', 'mental', 'nutrition', 'medicine', 'treatment', 'patient', 'drug', 'clinical', 'research'],
    'Politics': ['politics', 'government', 'president', 'congress', 'senate', 'election', 'vote', 'campaign', 'policy', 'law', 'bill', 'republican', 'democrat', 'political', 'minister', 'parliament', 'legislation', 'trump', 'biden'],
    'Entertainment': ['entertainment', 'movie', 'film', 'actor', 'music', 'celebrity', 'hollywood', 'show', 'series', 'netflix', 'award', 'grammy', 'oscar', 'song', 'album', 'premiere', 'release', 'director', 'producer', 'drama'],
    'Science': ['science', 'research', 'study', 'scientist', 'nasa', 'space', 'discovery', 'physics', 'biology', 'climate', 'environment', 'nature', 'experiment', 'universe', 'planet', 'astronomy', 'data']
  };

  // Initialize user and load data
  useEffect(() => {
    let id = localStorage.getItem('newsAgentUserId');
    if (!id) {
      id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('newsAgentUserId', id);
    }
    setUserId(id);

    const loadPreferences = async () => {
      try {
        const response = await fetch(`/api/preferences?userId=${id}`);
        const data = await response.json();
        if (data.topics && data.topics.length > 0) {
          setSelectedTopics(new Set(data.topics));
        }
      } catch (error) {
        console.log('Error loading preferences:', error);
      }
    };

    loadPreferences();

    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
      setDarkMode(JSON.parse(savedDarkMode));
    }

    const fetchNewsOnLoad = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/news?category=general`)
        const data = await response.json();
        setArticles(data.articles);
        setFilteredArticles([]);
        setExplanations({});
      } catch (error) {
        console.log('Error:', error);
      }
      setLoading(false);
    };

    fetchNewsOnLoad();
  }, []);

  // Load reading stats and collections
  useEffect(() => {
    if (userId) {
      loadReadingStats();
      loadCollections();
      loadTrending();
    }
  }, [userId]);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    let filtered: Article[] = articles;
  
    if (searchQuery.trim()) {
      filtered = filtered.filter((article) =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (article.description &&
          article.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()))
      );
    }
  
    if (selectedTopics.size > 0 && showAllArticles) {
      filtered = filterArticles(filtered, selectedTopics);
    }
  
    setFilteredArticles(filtered);
  }, [selectedTopics, articles, searchQuery, showAllArticles]);


  const loadReadingStats = async () => {
    setLoadingStats(true);
    try {
      const response = await fetch(`/api/reading-stats?userId=${userId}`);
      const data = await response.json();
      if (data.success) {
        setReadingStats(data.stats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const loadCollections = async () => {
    try {
      const response = await fetch(`/api/collections?userId=${userId}&includeItems=true`);
      const data = await response.json();
      if (data.success) {
        setCollections(data.collections);
      }
    } catch (error) {
      console.error('Error loading collections:', error);
    }
  };

  const loadTrending = async () => {
    try {
      const response = await fetch('/api/trending?limit=10');
      const data = await response.json();
      if (data.success) {
        setTrending(data.trending);
        setTrendingByCategory(data.trendingByCategory);
      }
    } catch (error) {
      console.error('Error loading trending:', error);
    }
  };

  const logArticleRead = async (article: any) => {
    if (!userId) return;

    try {
      const category = detectCategory(article);
      const response = await fetch('/api/reading-history/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          articleUrl: article.url,
          articleTitle: article.title,
          articleCategory: category,
          source: article.source?.name,
          readingTimeSeconds: Math.floor(Math.random() * 300 + 60)
        }),
      });

      const data = await response.json();
      if (data.success) {
        console.log('Article read logged successfully');
        setTimeout(() => {
          loadReadingStats();
          loadTrending();
        }, 1000);
      }
    } catch (error) {
      console.error('Error logging read:', error);
    }
  };

  const detectCategory = (article: any): string => {
    const content = `${article.title} ${article.description || ''}`.toLowerCase();
    
    for (const [category, keywordList] of Object.entries(keywords)) {
      if ((keywordList as string[]).some(keyword => content.includes(keyword))) {
        return category;
      }
    }
    
    return 'General';
  };

  const createCollection = async () => {
    if (!newCollectionName.trim() || !userId) return;

    try {
      const response = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          name: newCollectionName,
          color: newCollectionColor,
          description: ''
        }),
      });

      const data = await response.json();
      if (data.success) {
        setCollections([...collections, data.collection]);
        setNewCollectionName('');
        setShowCreateCollection(false);
      }
    } catch (error) {
      console.error('Error creating collection:', error);
    }
  };

  const addToCollection = async (collectionId: string, article: any) => {
    try {
      const response = await fetch(`/api/collections/${collectionId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleUrl: article.url,
          articleTitle: article.title,
          articleDescription: article.description || '',
          articleImage: article.urlToImage || ''
        }),
      });

      const data = await response.json();
      if (data.success) {
        setShowCollectionModal(false);
        setSelectedArticleForCollection(null);
        // Reload collections to refresh the items
        setTimeout(() => {
          loadCollections();
        }, 500);
        alert('Article saved to collection!');
      } else if (data.code === 'ALREADY_EXISTS') {
        alert('Article already in this collection');
      } else {
        console.error('Error response:', data);
        alert(data.message || 'Failed to save article');
      }
    } catch (error) {
      console.error('Error adding to collection:', error);
      alert('Failed to save article. Check console for details.');
    }
  };

  const deleteCollection = async (collectionId: string) => {
    try {
      await fetch(`/api/collections?id=${collectionId}`, {
        method: 'DELETE',
      });
      setCollections(collections.filter(c => c.id !== collectionId));
    } catch (error) {
      console.error('Error deleting collection:', error);
    }
  };

  const renameCollection = async (collectionId: string, newName: string) => {
    try {
      const response = await fetch(`/api/collections/${collectionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
      });

      const data = await response.json();
      if (data.success) {
        loadCollections();
      }
    } catch (error) {
      console.error('Error renaming collection:', error);
    }
  };

  const viewCollection = async (collectionId: string) => {
    const collection = collections.find((c: any) => c.id === collectionId);
    if (collection) {
      setSelectedCollection(collection);
      setActiveTab('collections');
    }
  };


  const toggleTopic = (topic: string) => {
    const newSelected = new Set(selectedTopics);
    if (newSelected.has(topic)) {
      newSelected.delete(topic);
    } else {
      newSelected.add(topic);
    }
    setSelectedTopics(newSelected);
  };

  const savePreferences = async () => {
    if (!userId) return;
    
    setSavingPreferences(true);
    try {
      const response = await fetch('/api/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          topics: Array.from(selectedTopics),
          userId 
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        setShowPreferences(false);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setSavingPreferences(false);
    }
  };

  const filterArticles = (articles: Article[], topicsToFilter: Set<string>): Article[] => {
    if (topicsToFilter.size === 0) return articles;
    
    return articles.filter(article => {
      const text = (article.title + ' ' + (article.description || '')).toLowerCase();
    const topicArray = Array.from(selectedTopics);
    
    const matches = topicArray.filter(topic => 
      text.includes(topic.toLowerCase())
    ).length;
    
    return matches > 0;
    });
  };
      
  const generateExplanation = async (articleTitle: string, articleIndex: number) => {
    if (explanations[articleIndex]) return;
    
    setLoadingIndex(articleIndex);
    try {
      const response = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: articleTitle }),
      });

      const data = await response.json();
      setExplanations(prev => ({
        ...prev,
        [articleIndex]: data.explanation || 'Could not generate explanation'
      }));
    } catch (error) {
      console.error('Error:', error);
      setExplanations(prev => ({
        ...prev,
        [articleIndex]: 'Could not generate explanation'
      }));
    } finally {
      setLoadingIndex(null);
    }
  };

  const fetchNews = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/news?category=general`)
      const data = await response.json();
      setArticles(data.articles);
      setFilteredArticles(data.articles);
      setExplanations({});
      setShowAllArticles(true);  
    } catch (error) {
      console.log('Error:', error);
    }
    setLoading(false);
  };


  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-slate-900' : 'bg-amber-50'} ${darkMode ? 'text-stone-100' : 'text-stone-900'} font-serif`}>
      
      {/* Header */}
      <header className={`border-b ${darkMode ? 'border-slate-700' : 'border-emerald-200'} sticky top-0 z-50 backdrop-blur-md ${darkMode ? 'bg-amber-90/80' : 'bg-amber-10/80'}`}>
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setActiveTab('home')}>
              <div className={`w-10 h-10 rounded-full ${darkMode ? 'bg-green-700' : 'bg-green-600'} flex items-center justify-center`}>
                <Sparkles size={24} className="text-white" />
              </div>
              <h1 className={`text-2xl font-light ${darkMode ? 'text-stone-100' : 'text-stone-900'}`}>
                News Agent
              </h1>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-full transition-all duration-300 ease-in-out ${darkMode ? 'bg-stone-800 text-amber-600 hover:bg-stone-700 hover:scale-110' : 'bg-amber-200 text-amber-900 hover:bg-amber-100 hover:scale-110'}`}
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              <button
                onClick={() => setShowPreferences(!showPreferences)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-light transition-all duration-300 ease-in-out ${
                  showPreferences 
                    ? darkMode 
                      ? 'bg-stone-700 text-stone-100' 
                      : 'bg-amber-200 text-stone-900'
                    : darkMode 
                    ? 'bg-emerald-700 text-white hover:bg-emerald-600 hover:shadow-lg' 
                    : 'bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-lg'
                }`}
              >
                <Settings size={18} />
                {showPreferences ? 'Close' : 'Preferences'}
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[
              { id: 'home', label: 'Home', icon: Sparkles },
              { id: 'stats', label: 'Reading Stats', icon: BarChart3 },
              { id: 'trending', label: 'Trending', icon: TrendingUp },
              { id: 'collections', label: 'Collections', icon: FolderPlus }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-light transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? darkMode
                        ? 'bg-emerald-700 text-white'
                        : 'bg-emerald-600 text-white'
                      : darkMode
                      ? 'bg-slate-800 text-stone-300 hover:bg-slate-700'
                      : 'bg-emerald-100 text-stone-700 hover:bg-emerald-200'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={`max-w-6xl mx-auto px-6 py-8`}>

        {/* Preferences Panel */}
        {showPreferences && (
          <div className={`mb-8 p-6 rounded-lg border ${darkMode ? 'border-slate-700' : 'border-emerald-200'} ${darkMode ? 'bg-slate-800' : 'bg-white'} transition-all animate-in fade-in`}>
            <h2 className="text-lg font-light mb-6">Select Your Interests</h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6">
              {topics.map((topic) => (
                <button
                  key={topic}
                  onClick={() => toggleTopic(topic)}
                  className={`p-3 rounded-lg font-light transition-all duration-200 ease-in-out transform hover:scale-105 ${
                    selectedTopics.has(topic)
                      ? darkMode
                        ? 'bg-emerald-700 text-white hover:bg-emerald-600 shadow-md'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md'
                      : darkMode
                      ? 'bg-slate-700 text-stone-300 hover:bg-slate-600'
                      : 'bg-emerald-100 text-stone-700 hover:bg-emerald-200'
                  }`}
                >
                  {topic}
                </button>
              ))}
            </div>

            <p className={`text-sm mb-4 ${darkMode ? 'text-stone-400' : 'text-stone-600'}`}>
              Selected: {selectedTopics.size > 0 ? Array.from(selectedTopics).join(', ') : 'None'}
            </p>
            
            <button
              onClick={savePreferences}
              disabled={savingPreferences}
              className={`px-6 py-2 rounded-lg font-light transition-all duration-200 ease-in-out ${
                darkMode
                  ? 'bg-amber-800 hover:bg-amber-700 text-stone-100 hover:shadow-lg'
                  : 'bg-amber-700 hover:bg-amber-800 text-white hover:shadow-lg'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {savingPreferences ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        )}

        {/* HOME TAB */}
        {activeTab === 'home' && (
          <>
            {!showAllArticles && (
              <>
                {/* HERO SECTION */}
                <div className="mb-12">
                <h2 className={`text-5xl md:text-6xl font-bold mb-3 bg-gradient-to-r from-emerald-800 to-amber-500 bg-clip-text text-transparent leading-tight tracking-tight`}>
                  Discover Today's Stories
                </h2>
                <p className={`text-lg font-light mb-8 tracking-wide ${darkMode ? 'text-white-400/80' : 'text-black-800/80'}`}>
                 Stay informed with curated news
                </p>
                  
                  
                  {/* SEARCH BAR */}
                  <div className={`relative mb-8 rounded-xl p-4 border ${darkMode ? 'border-slate-700 bg-slate-800' : 'border-emerald-200 bg-white'}`}>
                    <Search className={`absolute left-6 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-stone-400' : 'text-stone-500'}`} size={20} />
                    <input
                      type="text"
                      placeholder="Search for news..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2 rounded-lg font-light border-0 focus:outline-none focus:ring-2 focus:ring-green-600 ${
                        darkMode 
                          ? 'bg-slate-700 text-stone-100 placeholder-stone-500' 
                          : 'bg-emerald-50 text-stone-900 placeholder-stone-400'
                      }`}
                    />
                  </div>
                </div>

                {/* FEATURED SECTION */}
                {articles.length > 0 && !showAllArticles && (
                  <div className="mb-12">
                    <h3 className={`text-4xl font-bold mb-8 bg-gradient-to-r from-emerald-800
                       to-amber-600 bg-clip-text text-transparent leading-tight tracking-tight`}
                       >Featured News</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      {filteredArticles.slice(0, 3).map((article, index) => (
                        <div
                          key={index}
                          className={`rounded-xl overflow-hidden border ${darkMode ? 
                          'border-slate-700 bg-slate-800' : 'border-emerald-200 bg-white'} 
                          transition-all duration-300 hover:shadow-lg hover:-translate-y-1 
                          cursor-pointer`}
                          onClick={() => {
                            logArticleRead(article);
                            window.open(article.url, '_blank');
                          }}
                        >
                          {article.urlToImage && (
                            <div className="h-40 overflow-hidden bg-gray-300">
                              <img 
                                src={article.urlToImage} 
                                alt={article.title}
                                className="w-full h-full object-cover hover:scale-105 
                                transition-transform duration-300"
                              />
                            </div>
                          )}
                          <div className="p-4">
                            <h4 className={`font-light line-clamp-2 ${darkMode ? 'text-stone-100' 
                              : 'text-stone-900'}`}>
                              {article.title}
                            </h4>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Fetch News Button */}
                <div className="mb-8">
                  <button
                    onClick={fetchNews}
                    disabled={loading}
                    className={`w-full py-4 rounded-lg font-light text-lg transition-all duration-300 ease-in-out transform ${loading ? 'scale-100' : 'hover:scale-105 active:scale-95'} hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed ${
                      darkMode
                        ? 'bg-emerald-700 text-white hover:bg-emerald-600'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700'
                    }`}
                  >
                    {loading ? 'Fetching Latest News...' : 'Get Today\'s News'}
                  </button>
                </div>
              </>
            )}

            {showAllArticles && filteredArticles.length > 0 && (
              <>
                <button
                  onClick={() => setShowAllArticles(false)}
                  className={`mb-6 px-4 py-2 rounded-lg font-light transition-all duration-200 ${
                    darkMode 
                      ? 'bg-slate-700 hover:bg-slate-600 text-stone-100' 
                      : 'bg-stone-200 hover:bg-stone-300 text-stone-900'
                  }`}
                >
                  ← Back to Home
                </button>
                
                <div className="mb-6">
                  <p className={`text-sm font-light ${darkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                    Showing {filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''}
                    {selectedTopics.size > 0 ? ` for ${Array.from(selectedTopics).join(', ')}` : ''}
                  </p>
                </div>

                <div className="grid gap-6">
                  {filteredArticles.map((article, index) => (
                    <article
                      key={index}
                      className={`p-6 rounded-lg border ${darkMode ? 'border-slate-700' : 'border-emerald-200'} ${darkMode ? 'bg-slate-800' : 'bg-white'} transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1`}
                    >
                      <h3 className="text-lg font-light mb-3 leading-tight line-clamp-2">
                        {article.title}
                      </h3>
                      
                      <p className={`mb-6 line-clamp-3 font-light ${darkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                        {article.description}
                      </p>

                      {explanations[index] && (
                        <div className={`p-4 rounded-lg border-l-4 mb-6 font-light transition-all duration-300 ${
                          darkMode
                            ? 'bg-emerald-900/30 border-emerald-700'
                            : 'bg-emerald-50 border-emerald-700'
                        }`}>
                          <p className="font-light mb-2 text-sm">Why This Matters</p>
                          <p className={`text-sm font-light ${darkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                            {explanations[index]}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex gap-2">
                          {!explanations[index] ? (
                            <button
                              onClick={() => {
                                generateExplanation(article.title, index);
                                setExpandedIndex(index);
                              }}
                              disabled={loadingIndex === index}
                              className={`px-4 py-2 rounded-lg font-light transition-all duration-200 ease-in-out text-sm ${
                                loadingIndex === index
                                  ? darkMode
                                    ? 'bg-slate-700 text-stone-400 cursor-not-allowed'
                                    : 'bg-slate-100 text-stone-600 cursor-not-allowed'
                                  : darkMode
                                  ? 'bg-amber-800 hover:bg-amber-700 text-white hover:shadow-lg hover:scale-105 active:scale-95'
                                  : 'bg-amber-700 hover:bg-amber-800 text-white hover:shadow-lg hover:scale-105 active:scale-95'
                              }`}
                            >
                              {loadingIndex === index ? 'Loading...' : 'Explain This News'}
                            </button>
                          ) : null}

                          <button
                            onClick={() => {
                              setSelectedArticleForCollection(article);
                              setShowCollectionModal(true);
                            }}
                            className={`px-4 py-2 rounded-lg font-light transition-all duration-200 ease-in-out text-sm flex items-center gap-2 ${
                              darkMode
                                ? 'bg-amber-900 hover:bg-amber-900 text-white hover:shadow-lg hover:scale-105 active:scale-95'
                                : 'bg-amber-900 hover:bg-amber-900 text-white hover:shadow-lg hover:scale-105 active:scale-95'
                            }`}
                          >
                            <BookmarkPlus size={16} />
                            Save
                          </button>
                        </div>
                        
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => logArticleRead(article)}
                          className={`font-light text-sm transition-all duration-200 ease-in-out hover:underline ${
                            darkMode
                              ? 'text-emerald-500 hover:text-emerald-400'
                              : 'text-emerald-700 hover:text-emerald-800'
                          }`}
                        >
                          Read Full Article
                        </a>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}

            {showAllArticles && articles.length > 0 && filteredArticles.length === 0 && (
              <div className={`text-center py-12 font-light ${darkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                <p className="text-lg font-light">No articles found for your preferences</p>
                <p className="text-sm mt-2 font-light">Try selecting different topics to see more articles</p>
              </div>
            )}

            {!showAllArticles && articles.length === 0 && (
              <div className={`text-center py-12 font-light ${darkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                <p className="text-lg font-light">Ready to explore today's news?</p>
                <p className="text-sm mt-2 font-light">Click "Get Today's News" to start</p>
              </div>
            )}
          </>
        )}

        {/* READING STATS TAB */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            <h2 className={`text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-500 to-amber-600 bg-clip-text text-transparent tracking-tight`}>
              Your Reading Journey
            </h2>
           

            {loadingStats ? (
              <div className={`text-center py-12 ${darkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                <p>Loading your stats...</p>
              </div>
            ) : readingStats ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Stats Cards */}
                <div className={`p-6 rounded-lg border ${darkMode ? 'border-slate-700 bg-slate-800' : 'border-emerald-200 bg-white'}`}>
                  <div className="text-3xl font-light text-emerald-600 mb-2">
                    {readingStats.totalArticlesRead}
                  </div>
                  <p className={`text-sm font-light ${darkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                    Total Articles Read
                  </p>
                </div>

                <div className={`p-6 rounded-lg border ${darkMode ? 'border-slate-700 bg-slate-800' : 'border-emerald-200 bg-white'}`}>
                  <div className="text-3xl font-light text-blue-600 mb-2">
                    {readingStats.articlesReadThisWeek}
                  </div>
                  <p className={`text-sm font-light ${darkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                    This Week
                  </p>
                </div>

                <div className={`p-6 rounded-lg border ${darkMode ? 'border-slate-700 bg-slate-800' : 'border-emerald-200 bg-white'}`}>
                  <div className="text-3xl font-light text-amber-600 mb-2">
                    {readingStats.totalReadingMinutes}
                  </div>
                  <p className={`text-sm font-light ${darkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                    Minutes Read
                  </p>
                </div>

                <div className={`p-6 rounded-lg border ${darkMode ? 'border-slate-700 bg-slate-800' : 'border-emerald-200 bg-white'}`}>
                  <div className="text-3xl font-light text-red-600 mb-2">
                    {readingStats.reading_streak}
                  </div>
                  <p className={`text-sm font-light ${darkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                    Day Streak 
                  </p>
                </div>
              </div>
            ) : null}

            {/* Favorite Category */}
            {readingStats && (
              <div className={`p-6 rounded-lg border ${darkMode ? 'border-slate-700 bg-slate-800' : 'border-emerald-200 bg-white'}`}>
                <h3 className={`text-lg font-light mb-4 ${darkMode ? 'text-stone-100' : 'text-stone-900'}`}>
                  Your Top Categories
                </h3>
                <div className="space-y-3">
                  {Object.entries(readingStats.readingByCategory)
                    .sort((a: any, b: any) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([category, count]: any) => (
                      <div key={category} className="flex items-center justify-between">
                        <span className={`font-light ${darkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                          {category}
                        </span>
                        <div className="w-32 h-2 bg-emerald-600/20 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-600"
                            style={{ width: `${(count / Math.max(...Object.values(readingStats.readingByCategory) as number[])) * 100}%` }}
                          />
                        </div>
                        <span className={`text-sm font-light ${darkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                          {count}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {!readingStats || readingStats.totalArticlesRead === 0 ? (
              <div className={`text-center py-12 ${darkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                <p className="text-lg font-light">Start reading articles to build your reading stats!</p>
              </div>
            ) : null}
          </div>
        )}

        {/* TRENDING TAB */}
        {activeTab === 'trending' && (
          <div className="space-y-6">
            <h2 className={`text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-500 to-amber-600 bg-clip-text text-transparent tracking-tight`}>
              What's Trending
            </h2>

            {/* Trending by Category Overview */}
            <div>
              <h3 className={`text-lg font-light mb-4 ${darkMode ? 'text-stone-100' : 'text-stone-900'}`}>
                Trending by Category
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(trendingByCategory)
                  .sort((a: any, b: any) => b[1].totalReads - a[1].totalReads)
                  .slice(0, 8)
                  .map(([category, data]: any) => (
                    <div
                      key={category}
                      className={`p-4 rounded-lg border ${darkMode ? 'border-slate-700 bg-slate-800' : 'border-emerald-200 bg-white'} text-center hover:shadow-lg transition-all`}
                    >
                      <div className="text-2xl font-light text-emerald-600 mb-1">
                        {data.totalReads}
                      </div>
                      <p className={`text-sm font-light ${darkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                        {category}
                      </p>
                    </div>
                  ))}
              </div>
            </div>

            {/* Top Trending Articles */}
            <div>
              <h3 className={`text-lg font-light mb-4 ${darkMode ? 'text-stone-100' : 'text-stone-900'}`}>
                Most Read Articles
              </h3>
              <div className="space-y-4">
                {trending.slice(0, 10).map((article: any, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${darkMode ? 'border-slate-700 bg-slate-800' : 'border-emerald-200 bg-white'} hover:shadow-lg transition-all`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className={`font-light line-clamp-2 mb-2 ${darkMode ? 'text-stone-100' : 'text-stone-900'}`}>
                          {article.article_title}
                        </h4>
                        <div className="flex items-center gap-4">
                          <span className={`text-sm font-light px-2 py-1 rounded ${darkMode ? 'bg-emerald-900/30 text-emerald-300' : 'bg-emerald-100 text-emerald-700'}`}>
                            {article.article_category}
                          </span>
                          <span className={`text-sm font-light ${darkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                            👁️ {article.read_count} reads
                          </span>
                        </div>
                      </div>
                      <div className={`text-xl font-light ${darkMode ? 'text-amber-500' : 'text-amber-600'}`}>
                        #{index + 1}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {trending.length === 0 && (
              <div className={`text-center py-12 ${darkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                <p className="text-lg font-light">No trending data yet. Start reading articles!</p>
              </div>
            )}
          </div>
        )}

        {/* COLLECTIONS TAB */}
        {activeTab === 'collections' && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className={`text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent tracking-tight`}>
                My Collections
              </h2>
              <button
                onClick={() => setShowCreateCollection(true)}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg font-light transition-all ${
                  darkMode
                    ? 'bg-emerald-700 hover:bg-emerald-600 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                + New Collection
              </button>
            </div>

            {selectedCollection ? (
              <div className={`p-6 rounded-lg border ${darkMode ? 'border-slate-700 bg-slate-800' : 'border-emerald-200 bg-white'}`}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full" style={{backgroundColor: selectedCollection.color}} />
                    <h3 className={`text-3xl font-bold ${darkMode ? 'text-stone-100' : 'text-stone-900'}`}>
                      {selectedCollection.name}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedCollection(null)}
                    className={`px-4 py-2 rounded-lg transition-all ${darkMode ? 'bg-slate-700 hover:bg-slate-600 text-stone-100' : 'bg-stone-200 hover:bg-stone-300 text-stone-900'}`}
                  >
                    Back
                  </button>
                </div>

                {selectedCollection.items && selectedCollection.items.length > 0 ? (
                  <div className="grid gap-4">
                    {selectedCollection.items.map((item, idx) => {
                      const itemTitle = item.article_title || 'Untitled';
                      const itemDescription = item.article_description || '';
                      const itemUrl = item.article_url || '#';
                      const itemImage = item.article_image || null;

                      return (
                        <div key={idx} className={`p-4 rounded-lg border ${darkMode ? 'border-slate-700 bg-slate-700' : 'border-emerald-200 bg-emerald-50'}`}>
                          {itemImage && (
                            <div className="h-32 overflow-hidden rounded mb-3 bg-gray-300">
                              <img 
                                src={itemImage} 
                                alt={itemTitle}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <h4 className={`font-semibold mb-2 ${darkMode ? 'text-stone-100' : 'text-stone-900'}`}>
                            {itemTitle}
                          </h4>
                          <p className={`text-sm mb-3 ${darkMode ? 'text-stone-300' : 'text-stone-600'}`}>
                            {itemDescription}
                          </p>
                          <a href={itemUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:text-emerald-700 text-sm font-light">
                            Read Full Article →
                          </a>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className={`text-center py-8 ${darkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                    No articles in this collection yet
                  </p>
                )}
              </div>
            ) : (
              <>
                {/* COLLECTIONS LIST */}
                {collections.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {collections.map((collection) => (
                      <div key={collection.id} className={`p-6 rounded-lg border ${darkMode ? 'border-slate-700 bg-slate-800' : 'border-emerald-200 bg-white'}`}>
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded-full" style={{backgroundColor: collection.color}} />
                            <h3 className={`text-lg font-light ${darkMode ? 'text-stone-100' : 'text-stone-900'}`}>
                              {collection.name}
                            </h3>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                const newName = prompt('Rename collection:', collection.name);
                                if (newName && newName.trim()) renameCollection(collection.id, newName);
                              }}
                              className={`text-sm px-2 py-1 rounded transition-all ${darkMode ? 'text-emerald-400 hover:bg-slate-700' : 'text-emerald-600 hover:bg-stone-100'}`}
                            >
                              Rename
                            </button>
                            <button
                              onClick={() => deleteCollection(collection.id)}
                              className={`p-1 rounded transition-all ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-stone-100'}`}
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                        <p className={`text-sm mb-4 ${darkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                          {collection.items?.length || 0} articles
                        </p>
                        <button
                          onClick={() => setSelectedCollection(collection)}
                          className={`w-full px-4 py-2 rounded-lg font-light transition-all text-sm ${
                            darkMode
                              ? 'bg-emerald-700 hover:bg-emerald-600 text-white'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          }`}
                        >
                          View Collection
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={`text-center py-12 ${darkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                    <p className="text-lg font-light">No collections yet</p>
                    <p className="text-sm mt-2 font-light">Create one to start saving articles</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* CREATE COLLECTION MODAL */}
        {showCreateCollection && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`rounded-lg p-6 max-w-sm w-full ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-xl font-light ${darkMode ? 'text-stone-100' : 'text-stone-900'}`}>
                  New Collection
                </h3>
                <button
                  onClick={() => setShowCreateCollection(false)}
                  className={`p-1 rounded ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-stone-100'}`}
                >
                  <X size={20} />
                </button>
              </div>

              <input
                type="text"
                placeholder="Collection name"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg mb-4 border focus:outline-none focus:ring-2 focus:ring-emerald-600 ${
                  darkMode
                    ? 'bg-slate-700 border-slate-600 text-stone-100'
                    : 'bg-white border-stone-300 text-stone-900'
                }`}
              />

              <div className="flex gap-2 mb-4">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewCollectionColor(color)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      newCollectionColor === color ? 'border-white scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={createCollection}
                  className={`flex-1 px-4 py-2 rounded-lg font-light transition-all ${
                    darkMode
                      ? 'bg-emerald-700 hover:bg-emerald-600 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  Create
                </button>
                <button
                  onClick={() => setShowCreateCollection(false)}
                  className={`flex-1 px-4 py-2 rounded-lg font-light transition-all ${
                    darkMode
                      ? 'bg-slate-700 hover:bg-slate-600 text-stone-100'
                      : 'bg-stone-200 hover:bg-stone-300 text-stone-900'
                  }`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* COLLECTION MODAL */}
        {showCollectionModal && selectedArticleForCollection && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`rounded-lg p-6 max-w-sm w-full ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-xl font-light ${darkMode ? 'text-stone-100' : 'text-stone-900'}`}>
                  Save to Collection
                </h3>
                <button
                  onClick={() => {
                    setShowCollectionModal(false);
                    setSelectedArticleForCollection(null);
                  }}
                  className={`p-1 rounded ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-stone-100'}`}
                >
                  <X size={20} />
                </button>
              </div>

              {collections.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {collections.map((collection) => (
                    <button
                      key={collection.id}
                      onClick={() => addToCollection(collection.id, selectedArticleForCollection)}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-all font-light ${
                        darkMode
                          ? 'bg-slate-700 hover:bg-slate-600 text-stone-100'
                          : 'bg-stone-100 hover:bg-stone-200 text-stone-900'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: collection.color }}
                        />
                        {collection.name}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className={`text-center py-4 font-light ${darkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                  No collections yet. Create one first!
                </p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}