export interface Character {
  id: string;
  name: string;
  image: string;
  species: string;
  status: string;
  gender: string;
  origin: { name: string };
}

export interface ColumnData {
  id: string;
  title: string;
  characters: Character[];
}
