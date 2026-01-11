// src/types.ts

export interface CampaignConfig {
  id: string;
  title: string;
  baseImageUrl: string; // The URL of the church flyer

  // The zone where the user's photo should appear
  frame: {
    x: number;
    y: number;
    width: number;
    height: number;
    rotation?: number;
    shape?: 'rect' | 'circle';
  };

  // Where the user's name should appear
  text: {
    x: number;
    y: number;
    color: string;
    fontSize: number;
    fontFamily: string;
    align: 'left' | 'center' | 'right';
  };
}