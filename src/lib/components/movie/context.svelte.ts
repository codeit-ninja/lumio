import type { Movie } from "tmdb-ts";
import { createContext } from "svelte";

const [get, set] = createContext<Movie>();
export const createMovie = (movie: () => Movie) => set(movie());
export const useMovie = () => get();
