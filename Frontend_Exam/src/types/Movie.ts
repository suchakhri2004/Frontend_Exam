export type Movie = {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  vote_average: number;
  release_date?: string;
};

export type TmdbListResponse = {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
};

