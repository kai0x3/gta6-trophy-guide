# Leonida Legend — GTA VI Trophy Guide & Tracker

[![make.fun](https://img.shields.io/badge/make.fun-gta6--trophy--guide--01-orange)](https://make.fun/c/gta6-trophy-guide-01)
[![Trophies](https://img.shields.io/badge/trophies-55-blue)](https://make.fun/c/gta6-trophy-guide-01)
[![Offline](https://img.shields.io/badge/offline-no%20network-green)](https://make.fun/c/gta6-trophy-guide-01)

The complete offline guide and tracker for all **55 Grand Theft Auto VI trophies** on PlayStation 5 — 1 platinum, 2 gold, 6 silver, 46 bronze, 28 hidden, all single-player, none online.

## What it is

- **Every trophy, with its official name, description and grade** exactly as PlayStation publishes them — plus a guide in our own words for each one, with its sources named beside it.
- **A tracker**: tick trophies off, progress saves in the browser (localStorage), export it to a file and import it back. Filters by kind (story, missable, collectibles, activities, character quests, robberies, exploration, money, secrets), by grade, by search, and an earned-only view.
- **A spoiler setting** that hides story trophies' names, descriptions and guides until they are earned.
- **A roadmap to the platinum** in five stages, in earning order, built from the official descriptions — which story chapters and missions, which collectibles and counts.
- **Missables**: PowerPyx and GTABase agree there is only one possibly missable trophy — *Positive Mental Attitude*, because of a Chapter 1 meditation at Jason's house. It gets its own view, with the save habits that protect the rest.
- **Honest where the game is still new**: five trophies had no confirmed method at launch (PowerPyx lists them as currently unknown). The guide says so plainly instead of inventing a location.

## Sources

Guides draw on PowerPyx's GTA 6 Trophy Guide & Roadmap, GTABase's trophy guide, Exophase's PS5 trophy list (names, descriptions, grades), Planet GTA 6's hidden/visible split, and HowToVideoGame's meditation-spot guide — each cited beside the trophy it supports. Guide text is original; the sources are cited, never copied.

## Run it

```sh
node serve.ts   # then open http://localhost:8080
```

No build step, no network at runtime — the app loads only its own files under `app/`.

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored make.fun library.

## About

- **Built for:** [make.fun — Build the best GTA 6 trophy guide (gta6-trophy-guide-01)](https://make.fun/c/gta6-trophy-guide-01)
- **Entry:** Leonida Legend, by [@kai0x3](https://github.com/kai0x3)
- **License:** MIT
- **Disclaimer:** An unofficial fan guide. Not affiliated with Rockstar Games. No Rockstar logo or artwork is used anywhere.
