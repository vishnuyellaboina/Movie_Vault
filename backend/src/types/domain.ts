export type IndustryKey =
  | "hollywood"
  | "bollywood"
  | "tollywood"
  | "kollywood"
  | "mollywood";

export type Provider = {
  id: number;
  name: string;
  logoUrl?: string;
};

export type PersonSummary = {
  id: number;
  name: string;
  knownForRole: string;
  roleTag?: string;
  profileUrl?: string;
};

export type PersonFilmographyItem = {
  id: number;
  title: string;
  releaseYear?: string;
  character?: string;
  posterUrl?: string;
  revenue?: number;
  revenueLabel?: string;
};

export type PersonDetail = {
  id: number;
  name: string;
  biography: string;
  department: string;
  knownAs: string[];
  birthday?: string;
  placeOfBirth?: string;
  genderLabel?: string;
  profileUrl?: string;
  debutMovie?: PersonFilmographyItem;
  topBoxOfficeMovie?: PersonFilmographyItem;
  filmography: PersonFilmographyItem[];
  totalFilmographyCount: number;
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
