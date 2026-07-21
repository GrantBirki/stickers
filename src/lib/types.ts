export type CardText = string | number;
export type CardTextList = string | string[];

export interface CardData {
  id: string;
  name: string;
  number?: CardText;
  set?: string;
  types?: CardTextList;
  subtypes?: CardTextList;
  supertype?: string;
  rarity?: string;
  hidden?: boolean;
  variant?: string;
  img?: string;
  back?: string;
  foil?: string;
  mask?: string;
  sticker_img?: string;
  card_front_img?: string;
  card_back_img?: string;
  showcase?: boolean;
  expanded?: boolean;
  flip_on_click?: boolean;
  priority?: boolean;
  drop_date?: string;
  description?: string;
  total_prints?: CardText;
}

export interface SiteConfig {
  display_next_card_as_hidden: boolean;
}
