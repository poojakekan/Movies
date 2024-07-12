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
      const response = await axios.get('https://api.example.com/movies'); // Replace with your GET API endpoint
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

  const addMovieHandler = useCallback(async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post("https://swapi.dev/api/films/", newMovie); // Replace with your POST API endpoint
      const addedMovie = {
        id: response.data.id,
        title: newMovie.title,
        openingText: newMovie.openingText,
        releaseDate: newMovie.releaseDate,
      };
      setMovies((prevMovies) => [...prevMovies, addedMovie]);
      setNewMovie({ title: '', openingText: '', releaseDate: '' });
      console.log('NewMovieObj', addedMovie);
    } catch (error) {
      setError('Failed to add movie.');
    }
  }, [newMovie]);

  const inputChangeHandler = useCallback((event) => {
    const { name, value } = event.target;
    setNewMovie((prevMovie) => ({ ...prevMovie, [name]: value }));
  }, []);

  const deleteMovieHandler = useCallback(async (movieId) => {
    try {
      await axios.delete(`https://swapi.dev/api/films/${movieId}`); // Replace with your DELETE API endpoint
      setMovies((prevMovies) => prevMovies.filter((movie) => movie.id !== movieId));
    } catch (error) {
      setError('Failed to delete movie.');
    }
  }, []);

  const moviesListMemo = useMemo(() => {
    return (
      <MoviesList movies={movies} onDeleteMovie={deleteMovieHandler} />
    );
  }, [movies, deleteMovieHandler]);

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
