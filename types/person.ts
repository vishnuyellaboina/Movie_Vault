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
