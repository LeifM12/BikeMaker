export type Discipline = "enduro" | "downhill";

export type CategoryId =
  | "frame"
  | "shock"
  | "fork"
  | "wheelset"
  | "tire_front"
  | "tire_rear"
  | "brakeset"
  | "crank"
  | "cassette"
  | "derailleur"
  | "shifter"
  | "chain"
  | "handlebar"
  | "stem"
  | "headset"
  | "seatpost"
  | "saddle"
  | "grips"
  | "pedals";

export interface Category {
  id: CategoryId;
  label: string;
  display_order: number;
  required: boolean;
  description: string | null;
}

export interface Part {
  id: string;
  category_id: CategoryId;
  brand: string;
  model: string;
  variant: string | null;
  year: number | null;
  disciplines: Discipline[];
  price_usd: number | null;
  weight_g: number | null;
  image_url: string | null;
  product_url: string | null;
  attrs: Record<string, unknown>;
}

export type Selection = Partial<Record<CategoryId, Part>>;

export interface CompatIssue {
  message: string;
  blocks: CategoryId[];
}
