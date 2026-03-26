import { createMovie, useMovie } from "./context.svelte.js";
import Movie from "./movie.svelte";
import MovieGenres from "./movie-genres.svelte";
import MovieLink from "./movie-link.svelte";
import MoviePoster from "./movie-poster.svelte";
import MovieRating from "./movie-rating.svelte";
import MovieTitle from "./movie-title.svelte";

export {
    createMovie,
    Movie as Root,
    MovieGenres as Genres,
    MovieLink as Link,
    MoviePoster as Poster,
    MovieRating as Rating,
    MovieTitle as Title,
    useMovie,
};
