import { PersonSummary } from "@/types/person";

export type IndustryKey =
  | "hollywood"
  | "bollywood"
  | "tollywood"
  | "kollywood"
  | "mollywood";

export type Genre = {
  id: number;
  name: string;
};

export type Provider = {
  id: number;
  name: string;
  logoUrl?: string;
};

export type MovieSummary = {
  id: number;
  title: string;
  originalTitle: string;
  posterUrl?: string;
  backdropUrl?: string;
  overview: string;
  releaseYear: string;
  ratingLabel: string;
  genreIds: number[];
  primaryGenre?: string;
  runtimeLabel?: string;
  detailsLabel?: string;
};

export type MovieDetail = MovieSummary & {
  runtimeLabel: string;
  imdbRating?: string;
  boxOffice?: string;
  productionCompanies: string[];
  cast: PersonSummary[];
  providers: Provider[];
};

export type MoviePage = {
  page: number;
  totalPages: number;
  results: MovieSummary[];
};

export type HomeFeed = {
  trending: MovieSummary[];
  bollywood: MovieSummary[];
  tollywood: MovieSummary[];
  hollywood: MovieSummary[];
  kollywood: MovieSummary[];
  mollywood: MovieSummary[];
};
