# Smash-a-Mole Game

A cute whack-a-mole game for kids, built with Phaser 3.

## Development

```bash
npm install
npm run dev
```

## Git Push

The default git remote proxy does not have write access. To push, configure the remote to use the `GH_TOKEN` environment variable:

```bash
git remote set-url origin "https://x-access-token:${GH_TOKEN}@github.com/olivier-martin-sf/game-nina-april-2026.git"
git push -u origin <branch-name>
```

This must be done once per session — the URL resets when the session environment changes.
