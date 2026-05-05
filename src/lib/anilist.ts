const ANILIST_ENDPOINT = "https://graphql.anilist.co";

export interface AniListAnime {
  id: number;
  title: {
    native: string | null;
  };
  coverImage: {
    large: string | null;
  };
  genres: string[];
  episodes: number | null;
  averageScore: number | null;
  seasonYear: number | null;
}

interface SearchResponse {
  Page: {
    media: AniListAnime[];
  };
}

const SEARCH_QUERY = `
  query SearchAnime($search: String) {
    Page(perPage: 10) {
      media(search: $search, type: ANIME, sort: POPULARITY_DESC) {
        id
        title {
          native
        }
        coverImage {
          large
        }
        genres
        episodes
        averageScore
        seasonYear
      }
    }
  }
`;

const YEAR_QUERY = `
  query AnimeByYear($year: Int, $page: Int) {
    Page(page: $page, perPage: 50) {
      media(seasonYear: $year, type: ANIME, format: TV, sort: POPULARITY_DESC) {
        id
        title {
          native
        }
        coverImage {
          large
        }
        genres
        episodes
        averageScore
        seasonYear
      }
    }
  }
`;

export async function getAnimeByYear(
  year: number,
  page: number = 1,
): Promise<AniListAnime[]> {
  const res = await fetch(ANILIST_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: YEAR_QUERY,
      variables: { year, page },
    }),
  });

  if (!res.ok) {
    throw new Error(`AniList API error: ${res.status}`);
  }

  const json = await res.json();
  if (json.errors) {
    throw new Error(`AniList GraphQL error: ${JSON.stringify(json.errors)}`);
  }

  return (json.data as SearchResponse).Page.media;
}

const YEAR_RANGE_QUERY = `
  query AnimeByYearRange($startFrom: FuzzyDateInt, $startTo: FuzzyDateInt, $page: Int) {
    Page(page: $page, perPage: 50) {
      media(
        startDate_greater: $startFrom,
        startDate_lesser: $startTo,
        type: ANIME,
        format: TV,
        sort: POPULARITY_DESC
      ) {
        id
        title {
          native
        }
        coverImage {
          large
        }
        genres
        episodes
        averageScore
        seasonYear
      }
    }
  }
`;

export async function getAnimeByYearRange(
  yearFrom: number,
  yearTo: number,
  page: number = 1,
): Promise<AniListAnime[]> {
  // AniList uses FuzzyDateInt format: YYYYMMDD
  const startFrom = yearFrom * 10000;      // e.g. 20100000
  const startTo = (yearTo + 1) * 10000;    // e.g. 20200000

  const res = await fetch(ANILIST_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: YEAR_RANGE_QUERY,
      variables: { startFrom, startTo, page },
    }),
  });

  if (!res.ok) {
    throw new Error(`AniList API error: ${res.status}`);
  }

  const json = await res.json();
  if (json.errors) {
    throw new Error(`AniList GraphQL error: ${JSON.stringify(json.errors)}`);
  }

  return (json.data as SearchResponse).Page.media;
}

const GENRE_QUERY = `
  query AnimeByGenre($genres: [String], $perPage: Int, $sort: [MediaSort]) {
    Page(perPage: $perPage) {
      media(genre_in: $genres, type: ANIME, format: TV, sort: $sort, isAdult: false) {
        id
        title {
          native
        }
        coverImage {
          large
        }
        genres
        episodes
        averageScore
        seasonYear
      }
    }
  }
`;

export async function searchAnimeByGenres(
  genres: string[],
  perPage: number = 30,
): Promise<AniListAnime[]> {
  const res = await fetch(ANILIST_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: GENRE_QUERY,
      variables: { genres, perPage, sort: ["SCORE_DESC"] },
    }),
  });

  if (!res.ok) {
    throw new Error(`AniList API error: ${res.status}`);
  }

  const json = await res.json();
  if (json.errors) {
    throw new Error(`AniList GraphQL error: ${JSON.stringify(json.errors)}`);
  }

  return (json.data as SearchResponse).Page.media;
}

const GENRE_SCORE_QUERY = `
  query AnimeByGenreAndScore(
    $genres: [String],
    $scoreMin: Int,
    $scoreMax: Int,
    $year: Int,
    $perPage: Int,
    $page: Int,
    $sort: [MediaSort]
  ) {
    Page(perPage: $perPage, page: $page) {
      media(
        genre_in: $genres,
        type: ANIME,
        format: TV,
        averageScore_greater: $scoreMin,
        averageScore_lesser: $scoreMax,
        seasonYear: $year,
        sort: $sort,
        isAdult: false
      ) {
        id
        title {
          native
        }
        coverImage {
          large
        }
        genres
        episodes
        averageScore
        seasonYear
      }
    }
  }
`;

export async function searchAnimeByGenresAndScore(
  genres: string[],
  scoreMin: number,
  scoreMax: number,
  options?: {
    year?: number;
    page?: number;
    perPage?: number;
    sort?: string;
  },
): Promise<AniListAnime[]> {
  const { year, page = 1, perPage = 10, sort = "SCORE_DESC" } = options ?? {};
  const variables: Record<string, unknown> = {
    genres,
    scoreMin,
    scoreMax,
    perPage,
    page,
    sort: [sort],
  };
  if (year) variables.year = year;

  const res = await fetch(ANILIST_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: GENRE_SCORE_QUERY, variables }),
  });

  if (!res.ok) {
    throw new Error(`AniList API error: ${res.status}`);
  }

  const json = await res.json();
  if (json.errors) {
    throw new Error(`AniList GraphQL error: ${JSON.stringify(json.errors)}`);
  }

  return (json.data as SearchResponse).Page.media;
}

const SEASON_QUERY = `
  query AnimeBySeason($year: Int, $season: MediaSeason, $page: Int) {
    Page(page: $page, perPage: 50) {
      media(seasonYear: $year, season: $season, type: ANIME, format: TV, sort: POPULARITY_DESC) {
        id
        title {
          native
        }
        coverImage {
          large
        }
        genres
        episodes
        averageScore
        seasonYear
      }
    }
  }
`;

export async function getAnimeBySeason(
  year: number,
  season: "WINTER" | "SPRING" | "SUMMER" | "FALL",
  page: number = 1,
): Promise<AniListAnime[]> {
  const res = await fetch(ANILIST_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: SEASON_QUERY,
      variables: { year, season, page },
    }),
  });

  if (!res.ok) {
    throw new Error(`AniList API error: ${res.status}`);
  }

  const json = await res.json();
  if (json.errors) {
    throw new Error(`AniList GraphQL error: ${JSON.stringify(json.errors)}`);
  }

  return (json.data as SearchResponse).Page.media;
}

// --- 詳細ページ用 ---

export interface AniListAnimeDetail {
  id: number;
  title: {
    native: string | null;
    romaji: string | null;
    english: string | null;
  };
  coverImage: {
    large: string | null;
  };
  bannerImage: string | null;
  genres: string[];
  episodes: number | null;
  averageScore: number | null;
  description: string | null;
  seasonYear: number | null;
  season: string | null;
  siteUrl: string | null;
  studios: {
    nodes: { name: string }[];
  };
  characters: {
    edges: {
      role: string;
      node: {
        id: number;
        name: { full: string; native: string | null };
        image: { medium: string | null };
      };
      voiceActors: {
        id: number;
        name: { full: string; native: string | null };
        image: { medium: string | null };
        language: string;
      }[];
    }[];
  };
}

const DETAIL_QUERY = `
  query AnimeDetail($id: Int) {
    Media(id: $id, type: ANIME) {
      id
      title {
        native
        romaji
        english
      }
      coverImage {
        large
      }
      bannerImage
      genres
      episodes
      averageScore
      description(asHtml: false)
      seasonYear
      season
      siteUrl
      studios(isMain: true) {
        nodes {
          name
        }
      }
      characters(sort: ROLE, perPage: 6) {
        edges {
          role
          node {
            id
            name { full, native }
            image { medium }
          }
          voiceActors(language: JAPANESE) {
            id
            name { full, native }
            image { medium }
            language
          }
        }
      }
    }
  }
`;

export async function getAnimeById(
  id: number,
): Promise<AniListAnimeDetail | null> {
  const res = await fetch(ANILIST_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: DETAIL_QUERY,
      variables: { id },
    }),
  });

  if (!res.ok) {
    return null;
  }

  const json = await res.json();
  if (json.errors || !json.data?.Media) {
    return null;
  }

  return json.data.Media as AniListAnimeDetail;
}

// --- 声優出演作品取得 ---

export interface VoiceActorWork {
  mediaId: number;
  titleNative: string | null;
  titleRomaji: string | null;
  coverImage: string | null;
  genres: string[];
  seasonYear: number | null;
  episodes: number | null;
  averageScore: number | null;
  characterName: string | null;
  characterRole: string;
}

export interface VoiceActorStaffInfo {
  id: number;
  nameNative: string | null;
  image: string | null;
  works: VoiceActorWork[];
}

const STAFF_QUERY = `
  query SearchStaff($search: String) {
    Staff(search: $search) {
      id
      name { native full }
      image { large }
      characterMedia(page: 1, perPage: 30, sort: POPULARITY_DESC) {
        edges {
          characterRole
          characters { name { native full } }
          node {
            id
            title { native romaji }
            coverImage { large }
            genres
            seasonYear
            episodes
            averageScore
          }
        }
      }
    }
  }
`;

export async function getVoiceActorWorks(
  staffName: string
): Promise<VoiceActorStaffInfo | null> {
  const res = await fetch(ANILIST_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: STAFF_QUERY, variables: { search: staffName } }),
    cache: "no-store",
  });

  if (!res.ok) return null;
  const json = await res.json();
  if (json.errors || !json.data?.Staff) return null;

  const staff = json.data.Staff;
  const works: VoiceActorWork[] = (staff.characterMedia?.edges ?? []).map(
    (edge: Record<string, unknown>) => {
      const node = edge.node as Record<string, unknown>;
      const chars = edge.characters as Array<{ name: { native: string | null; full: string } }>;
      const charName = chars?.[0]?.name.native ?? chars?.[0]?.name.full ?? null;
      const title = node.title as { native: string | null; romaji: string | null };
      const cover = node.coverImage as { large: string | null };
      return {
        mediaId: node.id as number,
        titleNative: title?.native ?? null,
        titleRomaji: title?.romaji ?? null,
        coverImage: cover?.large ?? null,
        genres: (node.genres as string[]) ?? [],
        seasonYear: (node.seasonYear as number | null) ?? null,
        episodes: (node.episodes as number | null) ?? null,
        averageScore: (node.averageScore as number | null) ?? null,
        characterName: charName,
        characterRole: edge.characterRole as string,
      };
    }
  );

  return {
    id: staff.id as number,
    nameNative: (staff.name as { native: string | null }).native,
    image: (staff.image as { large: string | null }).large,
    works,
  };
}

export async function searchAnimeByTitle(
  title: string,
): Promise<AniListAnime[]> {
  const res = await fetch(ANILIST_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: SEARCH_QUERY, variables: { search: title } }),
  });

  if (!res.ok) {
    throw new Error(`AniList API error: ${res.status}`);
  }

  const json = await res.json();
  if (json.errors) {
    throw new Error(`AniList GraphQL error: ${JSON.stringify(json.errors)}`);
  }

  return (json.data as SearchResponse).Page.media;
}
