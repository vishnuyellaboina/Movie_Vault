import { getBackdropUrl, getPosterUrl, getProfileUrl } from "@/services/imageService";
import { Genre, MovieDetail, MovieSummary, Provider } from "@/types/movie";
import { PersonDetail, PersonFilmographyItem, PersonSummary } from "@/types/person";

function formatUsdAmount(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function normalizeBoxOffice(movie: any, omdb?: any) {
  if (omdb?.BoxOffice && omdb.BoxOffice !== "N/A") {
    return omdb.BoxOffice;
  }

  const tmdbRevenue = typeof movie.revenue === "number" ? movie.revenue : 0;
  if (tmdbRevenue > 0) {
    return formatUsdAmount(tmdbRevenue);
  }

  return undefined;
}

export function normalizeGenres(payload: { genres: Array<{ id: number; name: string }> }): Genre[] {
  return payload.genres.map((genre) => ({
    id: genre.id,
    name: genre.name,
  }));
}

export function normalizeMovieSummary(movie: any): MovieSummary {
  const genres = movie.genre_ids ?? movie.genres?.map((genre: { id: number }) => genre.id) ?? [];
  const primaryGenre = movie.genres?.[0]?.name;
  const runtimeMinutes = typeof movie.runtime === "number" ? movie.runtime : undefined;
  const runtimeLabel = runtimeMinutes
    ? `${Math.floor(runtimeMinutes / 60)}h ${String(runtimeMinutes % 60).padStart(2, "0")}m`
    : undefined;

  return {
    id: movie.id,
    title: movie.title || movie.original_title || "Untitled",
    originalTitle: movie.original_title || movie.title || "",
    posterUrl: getPosterUrl(movie.poster_path),
    backdropUrl: getBackdropUrl(movie.backdrop_path),
    overview: movie.overview || "",
    releaseYear: movie.release_date?.slice(0, 4) || "",
    ratingLabel: movie.vote_average ? `${movie.vote_average.toFixed(1)}/10` : "NR",
    genreIds: genres,
    primaryGenre,
    runtimeLabel,
    detailsLabel: [movie.release_date?.slice(0, 4), runtimeLabel || primaryGenre]
      .filter(Boolean)
      .join(" · "),
  };
}

export function normalizeCast(credits: any): PersonSummary[] {
  const leadCast = (credits.cast ?? [])
    .filter((person: any) => person.profile_path)
    .slice(0, 2)
    .map((person: any) => ({
      id: person.id,
      name: person.name,
      knownForRole: person.character || "Lead",
      roleTag: person.gender === 1 ? "Heroine" : "Hero",
      profileUrl: getProfileUrl(person.profile_path),
    }));

  const crewPriority = [
    { job: "Director", label: "Director" },
    { job: "Producer", label: "Producer" },
    { job: "Original Music Composer", label: "Music Director" },
    { job: "Music", label: "Music Director" },
    { job: "Music Director", label: "Music Director" },
  ];

  const crewPeople = crewPriority
    .map(({ job, label }) => {
      const person = (credits.crew ?? []).find(
        (crewMember: any) => crewMember.job === job && crewMember.profile_path,
      );

      if (!person) {
        return null;
      }

      return {
        id: person.id,
        name: person.name,
        knownForRole: label,
        roleTag: label,
        profileUrl: getProfileUrl(person.profile_path),
      };
    })
    .filter(Boolean) as PersonSummary[];

  const deduped = new Map<number, PersonSummary>();
  [...leadCast, ...crewPeople].forEach((person) => {
    if (!deduped.has(person.id)) {
      deduped.set(person.id, person);
    }
  });

  return Array.from(deduped.values());
}

export function normalizeProviders(providerPayload: any, region = "IN"): Provider[] {
  const regionResult = providerPayload?.results?.[region];
  const flat = regionResult?.flatrate ?? regionResult?.rent ?? regionResult?.buy ?? [];

  return flat.map((provider: any) => ({
    id: provider.provider_id,
    name: provider.provider_name,
    logoUrl: getProfileUrl(provider.logo_path),
  }));
}

export function normalizeMovieDetail(
  movie: any,
  credits: any,
  providers: any,
  omdb?: any,
): MovieDetail {
  return {
    ...normalizeMovieSummary(movie),
    runtimeLabel: movie.runtime ? `${movie.runtime} min` : "Runtime unavailable",
    imdbRating: omdb?.imdbRating && omdb.imdbRating !== "N/A" ? omdb.imdbRating : undefined,
    boxOffice: normalizeBoxOffice(movie, omdb),
    overview: movie.overview || omdb?.Plot || "",
    productionCompanies: (movie.production_companies ?? [])
      .map((company: any) => company?.name)
      .filter(Boolean)
      .slice(0, 6),
    cast: normalizeCast(credits),
    providers: normalizeProviders(providers),
  };
}

export function normalizeActorDetail(person: any): PersonDetail {
  const genderLabel =
    person.gender === 1 ? "Female" : person.gender === 2 ? "Male" : undefined;

  return {
    id: person.id,
    name: person.name,
    biography: person.biography || "",
    department: person.known_for_department || "Performer",
    knownAs: (person.also_known_as ?? []).filter(Boolean).slice(0, 6),
    birthday: person.birthday || undefined,
    placeOfBirth: person.place_of_birth || undefined,
    genderLabel,
    profileUrl: getProfileUrl(person.profile_path, "h632"),
    debutMovie: undefined,
    topBoxOfficeMovie: undefined,
    filmography: [],
    totalFilmographyCount: 0,
  };
}

export function normalizeActorFilmographyItem(movie: any): PersonFilmographyItem {
  return {
    id: movie.id,
    title: movie.title || movie.original_title || "Untitled",
    releaseYear: movie.release_date?.slice(0, 4) || undefined,
    character: movie.character || movie.job || undefined,
    posterUrl: getPosterUrl(movie.poster_path),
    revenue: typeof movie.revenue === "number" && movie.revenue > 0 ? movie.revenue : undefined,
    revenueLabel:
      typeof movie.revenue === "number" && movie.revenue > 0
        ? formatUsdAmount(movie.revenue)
        : undefined,
  };
}
