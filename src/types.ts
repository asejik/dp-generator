export interface CampaignConfig {
  id: string;
  title: string;
  baseImageUrl: string;

  frame: {
    x: number;
    y: number;
    width: number;
    height: number;
    shape: 'rect' | 'circle';
  };

  // Made Optional with '?'
  text?: {
    x: number;
    y: number;
    color: string;
    fontSize: number;
    fontFamily: string;
    align: 'left' | 'center' | 'right';
  };
}