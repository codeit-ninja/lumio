import type { MovieContext } from "./context.svelte.js";
import { createMovie, useMovie } from "./context.svelte.js";
import MovieDetailsBackdrop from "./movie-details-backdrop.svelte";
import MovieDetailsCountries from "./movie-details-countries.svelte";
import MovieDetailsDirectors from "./movie-details-directors.svelte";
import MovieDetailsGenres from "./movie-details-genres.svelte";
import MovieDetailsLanguages from "./movie-details-languages.svelte";
import MovieDetailsPlot from "./movie-details-plot.svelte";
import MovieDetailsPoster from "./movie-details-poster.svelte";
import MovieDetailsRating from "./movie-details-rating.svelte";
import MovieDetailsTitle from "./movie-details-title.svelte";
import MovieDetailsTrailer from "./movie-details-trailer.svelte";
import MovieDetailsWriters from "./movie-details-writers.svelte";
import MovieDetails from "./movie-details.svelte";

export {
    type MovieContext,
    createMovie,
    useMovie,
    MovieDetailsTitle as Title,
    MovieDetails as Root,
    MovieDetailsBackdrop as Backdrop,
    MovieDetailsPoster as Poster,
    MovieDetailsGenres as Genres,
    MovieDetailsPlot as Plot,
    MovieDetailsRating as Rating,
    MovieDetailsCountries as Countries,
    MovieDetailsLanguages as Languages,
    MovieDetailsDirectors as Directors,
    MovieDetailsWriters as Writers,
    MovieDetailsTrailer as Trailer,
};
