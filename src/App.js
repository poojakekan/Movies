import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import axios from 'axios';

import MoviesList from './components/MoviesList';
import './App.css';

function App() {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const retryTimeout = useRef(null);

  const [newMovie, setNewMovie] = useState({ title: '', openingText: '', releaseDate: '' });

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

  const addMovieHandler = useCallback((event) => {
    event.preventDefault();
    console.log('NewMovieObj', newMovie);
  }, [newMovie]);

  const inputChangeHandler = useCallback((event) => {
    const { name, value } = event.target;
    setNewMovie((prevMovie) => ({ ...prevMovie, [name]: value }));
  }, []);

  const moviesListMemo = useMemo(() => {
    return <MoviesList movies={movies} />;
  }, [movies]);

  return (
    <React.Fragment>
      <section>
        <form onSubmit={addMovieHandler} className="form">
          <div className="form-control">
            <label htmlFor="title">Title</label>
            <input type="text" id="title" name="title" value={newMovie.title} onChange={inputChangeHandler} />
          </div>
          <div className="form-control">
            <label htmlFor="openingText">Opening Text</label>
            <textarea id="openingText" name="openingText" value={newMovie.openingText} onChange={inputChangeHandler}></textarea>
          </div>
          <div className="form-control">
            <label htmlFor="releaseDate">Release Date</label>
            <input type="date" id="releaseDate" name="releaseDate" value={newMovie.releaseDate} onChange={inputChangeHandler} />
          </div>
          <button type="submit">Add Movie</button>
        </form>
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
