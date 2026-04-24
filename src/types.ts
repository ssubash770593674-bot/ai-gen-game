/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
  cover: string;
  color: string;
}

export const TRACKS: Track[] = [
  {
    id: '1',
    title: 'Cyber Drift',
    artist: 'Future Echo',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    cover: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=1000&auto=format&fit=crop',
    color: '#00f2ff',
  },
  {
    id: '2',
    title: 'Neon Pulse',
    artist: 'Syntax Theory',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    cover: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1000&auto=format&fit=crop',
    color: '#ff00ff',
  },
  {
    id: '3',
    title: 'Void Runner',
    artist: 'Digital Ghost',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    cover: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1000&auto=format&fit=crop',
    color: '#00f2ff',
  },
];

export interface GameState {
  score: number;
  highScore: number;
  isGameOver: boolean;
  isPaused: boolean;
}

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface Point {
  x: number;
  y: number;
}
