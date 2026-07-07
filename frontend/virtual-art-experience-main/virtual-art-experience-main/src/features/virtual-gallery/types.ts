export interface Painting {
  id: string;
  title: string;
  artist: string;
  imageUrl: string;
  category?: string;
  style?: string;
  year?: number | string;
  description?: string;
  price?: number | string;
  dimensions?: string;
  medium?: string;
  surface?: string;
  colors?: string[];
  views?: number;
  likes?: number;
}