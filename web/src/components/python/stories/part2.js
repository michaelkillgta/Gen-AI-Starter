/* eslint-disable */
// @ts-nocheck
import { story, game } from "./engine";

export const stories = {};
export const games = {};

export const mountStory = (n, el) => story(el, stories[n]);
export const mountGame = (n, el) => game(el, games[n]);
