import { createMovie, useMovie } from "./context.svelte.js";
import MovieBackdrop from "./movie-backdrop.svelte";
import MovieDuration from "./movie-duration.svelte";
import MovieGenres from "./movie-genres.svelte";
import MovieLanguage from "./movie-language.svelte";
import MovieLink from "./movie-link.svelte";
import MoviePlot from "./movie-plot.svelte";
import MoviePoster from "./movie-poster.svelte";
import MovieRating from "./movie-rating.svelte";
import MovieTitle from "./movie-title.svelte";
import MovieTrailer from "./movie-trailer.svelte";
import MovieWatch from "./movie-watch.svelte";
import Movie from "./movie.svelte";

export {
    createMovie,
    Movie as Root,
    MovieGenres as Genres,
    MovieLink as Link,
    MoviePoster as Poster,
    MovieRating as Rating,
    MovieTitle as Title,
    MovieDuration as Duration,
    MovieBackdrop as Backdrop,
    MovieLanguage as Language,
    MovieWatch as Watch,
    MovieTrailer as Trailer,
    MoviePlot as Plot,
    useMovie,
};
