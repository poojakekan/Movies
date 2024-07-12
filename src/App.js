import React, { useState } from 'react';
import axios from 'axios';

import MoviesList from './components/MoviesList';
import './App.css';

function App() {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMoviesHandler = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("https://swapi.dev/api/films/"); // Replace with your API endpoint
      const fetchedMovies = response.data.map((movie) => ({
        id: movie.id,
        title: movie.title,
        openingText: movie.openingText,
        releaseDate: movie.releaseDate,
      }));
      setMovies(fetchedMovies);
    } catch (error) {
      console.error('Failed to fetch movies:', error);
    }
    setIsLoading(false);
  };

  return (
    <React.Fragment>
      <section>
        <button onClick={fetchMoviesHandler}>Fetch Movies</button>
      </section>
      <section>
  {isLoading ? <p className="loading">Loading...</p> : <MoviesList movies={movies} />}
</section>

    </React.Fragment>
  );
}

export default App;
