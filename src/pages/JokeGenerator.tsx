import { useState, useEffect } from 'react';
import { RefreshCw, Copy, Heart, Share2, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

interface Joke {
  id: number;
  setup?: string;
  delivery?: string;
  joke?: string;
  type: string;
  category: string;
}

export const JokeGenerator = () => {
  const [joke, setJoke] = useState<Joke | null>(null);
  const [loading, setLoading] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likedJokes, setLikedJokes] = useState<Joke[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [category, setCategory] = useState('any');

  const categories = [
    'any',
    'general',
    'programming',
    'knock-knock',
    'dad',
    'spooky',
    'christmas',
  ];

  // Load liked jokes from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('likedJokes');
    if (saved) {
      setLikedJokes(JSON.parse(saved));
    }
  }, []);

  // Save liked jokes to localStorage
  useEffect(() => {
    localStorage.setItem('likedJokes', JSON.stringify(likedJokes));
  }, [likedJokes]);

  const fetchJoke = async () => {
    setLoading(true);
    setLiked(false);

    try {
      const url =
        category === 'any'
          ? 'https://v2.jokeapi.dev/joke/Any'
          : `https://v2.jokeapi.dev/joke/${category}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.error) {
        toast.error('Failed to fetch joke. Please try again.');
        return;
      }

      setJoke(data);

      // Check if joke is already liked
      const isLiked = likedJokes.some((j) => j.id === data.id);
      setLiked(isLiked);
    } catch (error) {
      toast.error('Error fetching joke. Check your connection.');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJoke();
  }, [category]);

  const toggleLike = () => {
    if (!joke) return;

    if (liked) {
      setLikedJokes(likedJokes.filter((j) => j.id !== joke.id));
      setLiked(false);
      toast.success('Removed from favorites');
    } else {
      setLikedJokes([...likedJokes, joke]);
      setLiked(true);
      toast.success('Added to favorites! ❤️');
    }
  };

  const copyToClipboard = () => {
    if (!joke) return;

    const text =
      joke.type === 'twopart'
        ? `${joke.setup}\n${joke.delivery}`
        : joke.joke;

    navigator.clipboard.writeText(text || '');
    toast.success('Copied to clipboard! 📋');
  };

  const shareJoke = () => {
    if (!joke) return;

    const text =
      joke.type === 'twopart'
        ? `${joke.setup}\n${joke.delivery}`
        : joke.joke;

    if (navigator.share) {
      navigator.share({
        title: 'Check out this joke!',
        text: text,
      });
    } else {
      toast.error('Share not supported on this device');
    }
  };

  const deleteFavorite = (id: number) => {
    setLikedJokes(likedJokes.filter((j) => j.id !== id));
    toast.success('Removed from favorites');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 py-12 px-4">
      <div className="container-custom max-w-2xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">😂 Joke Generator</h1>
          <p className="text-lg text-gray-600">
            Get random jokes to brighten your day!
          </p>
        </div>

        {/* Category Filter */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Select Category</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`py-3 px-4 rounded-lg font-semibold transition ${
                  category === cat
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Joke Display */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          {loading ? (
            <div className="flex items-center justify-center min-h-48">
              <div className="flex flex-col items-center gap-4">
                <Loader className="w-12 h-12 text-primary-600 animate-spin" />
                <p className="text-gray-600 font-semibold">Loading joke...</p>
              </div>
            </div>
          ) : joke ? (
            <div className="space-y-6">
              {/* Joke Content */}
              <div className="space-y-4">
                {joke.type === 'twopart' ? (
                  <>
                    <div className="bg-primary-50 p-6 rounded-lg">
                      <p className="text-xl text-gray-900">{joke.setup}</p>
                    </div>
                    <div className="bg-secondary-50 p-6 rounded-lg">
                      <p className="text-xl text-gray-900 font-semibold">
                        {joke.delivery}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="bg-gradient-to-r from-primary-50 to-secondary-50 p-8 rounded-lg">
                    <p className="text-2xl text-gray-900 text-center font-semibold">
                      {joke.joke}
                    </p>
                  </div>
                )}
              </div>

              {/* Category Badge */}
              <div className="flex items-center justify-between">
                <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                  📂 {joke.category}
                </span>
                <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                  🎭 {joke.type === 'twopart' ? 'Two Part' : 'Single'}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t">
                <button
                  onClick={fetchJoke}
                  className="btn-primary flex items-center justify-center gap-2 py-3"
                  disabled={loading}
                >
                  <RefreshCw className="w-5 h-5" />
                  <span className="hidden sm:inline">Next</span>
                </button>
                <button
                  onClick={copyToClipboard}
                  className="btn-outline flex items-center justify-center gap-2 py-3"
                >
                  <Copy className="w-5 h-5" />
                  <span className="hidden sm:inline">Copy</span>
                </button>
                <button
                  onClick={toggleLike}
                  className={`py-3 px-4 rounded-lg font-bold transition flex items-center justify-center gap-2 ${
                    liked
                      ? 'bg-red-100 text-red-600 hover:bg-red-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
                  <span className="hidden sm:inline">
                    {liked ? 'Liked' : 'Like'}
                  </span>
                </button>
                <button
                  onClick={shareJoke}
                  className="btn-secondary flex items-center justify-center gap-2 py-3 text-white"
                >
                  <Share2 className="w-5 h-5" />
                  <span className="hidden sm:inline">Share</span>
                </button>
              </div>
            </div>
          ) : null}
        </div>

        {/* Favorites Section */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              ❤️ Favorite Jokes ({likedJokes.length})
            </h2>
            <button
              onClick={() => setShowFavorites(!showFavorites)}
              className="btn-outline py-2 px-4 text-sm"
            >
              {showFavorites ? 'Hide' : 'Show'}
            </button>
          </div>

          {showFavorites && (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {likedJokes.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No favorite jokes yet. Like some jokes to save them! 💙
                </p>
              ) : (
                likedJokes.map((favJoke, index) => (
                  <div
                    key={favJoke.id}
                    className="bg-gradient-to-r from-primary-50 to-secondary-50 p-4 rounded-lg flex items-start justify-between"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 mb-2">
                        #{index + 1}
                      </p>
                      <p className="text-gray-700 text-sm">
                        {favJoke.type === 'twopart'
                          ? `${favJoke.setup}\n${favJoke.delivery}`
                          : favJoke.joke}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteFavorite(favJoke.id)}
                      className="ml-4 text-red-600 hover:text-red-700 font-bold text-lg"
                      title="Remove from favorites"
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
