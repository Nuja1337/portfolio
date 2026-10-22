import type { APIRoute, GetStaticPaths } from 'astro';
import { artworks, type ArtName } from '../../scripts/lib/art';

/** Hero backdrops, rendered once at build time into static files under /art/. */
export const getStaticPaths = (() =>
  Object.keys(artworks).map((name) => ({ params: { name } }))) satisfies GetStaticPaths;

export const GET: APIRoute = ({ params }) =>
  new Response(artworks[params.name as ArtName](), { headers: { 'Content-Type': 'image/svg+xml' } });
