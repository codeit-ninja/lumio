import { createMovie, useMovie } from "./context.svelte.js";
import MovieLink from "./movie-link.svelte";
import MoviePoster from "./movie-poster.svelte";
import Movie from "./movie.svelte";

export { createMovie, useMovie, Movie as Root, MoviePoster as Poster, MovieLink as Link };