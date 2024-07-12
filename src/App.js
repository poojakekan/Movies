import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import axios from 'axios';

import MoviesList from './components/MoviesList';
import './App.css';

function App() {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const retryTimeout = useRef(null);

  const fetchMoviesHandler = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get('https://api.example.com/movies'); // Replace with your API endpoint
      const fetchedMovies = response.data.map((movie) => ({
        id: movie.id,
        title: movie.title,
        openingText: movie.openingText,
        releaseDate: movie.releaseDate,
      }));
      setMovies(fetchedMovies);
      setIsLoading(false);
    } catch (error) {
      setError('Something went wrong... Retrying');
      setIsLoading(false);
      retryTimeout.current = setTimeout(fetchMoviesHandler, 5000);
    }
  }, []);

  useEffect(() => {
    fetchMoviesHandler();
    return () => {
      if (retryTimeout.current) {
        clearTimeout(retryTimeout.current);
      }
    };
  }, [fetchMoviesHandler]);

  const cancelRetryHandler = useCallback(() => {
    if (retryTimeout.current) {
      clearTimeout(retryTimeout.current);
      setError(null);
    }
  }, []);

  const moviesListMemo = useMemo(() => {
    return <MoviesList movies={movies} />;
  }, [movies]);

  return (
    <React.Fragment>
      <section>
        {error && <button onClick={cancelRetryHandler}>Cancel</button>}
      </section>
      <section>
        {isLoading ? <p className="loading">Loading...</p> : moviesListMemo}
        {error && <p className="error">{error}</p>}
      </section>
    </React.Fragment>
  );
}

export default App;
