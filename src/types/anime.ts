export interface Anime {
  id: number;
  title: string;
  titleEn: string;
  image: string;
  genre: readonly string[];
  genreColor: string;
  episodes: number;
  score: number;
  description: string;
  streaming: readonly string[];
  season: string;
}
