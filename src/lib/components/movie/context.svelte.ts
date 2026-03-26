import { createContext } from "svelte";
import type { Movie } from "tmdb-ts";

const [get, set] = createContext<Movie>();
export const createMovie = (movie: () => Movie) => set(movie());
export const useMovie = () => get();
