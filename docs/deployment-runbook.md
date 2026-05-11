# Game Tracker Public Deployment Runbook

This is the canonical deployment flow for `game-tracker-public`.

## Server Access

Read SSH details from:

- `C:\Code\project\game-tracker\ops\server-access.local.md`
- `%USERPROFILE%\.ssh\config`

Current server:

- SSH alias: `aliyun-game-tracker`
- Deploy directory: `/opt/game-tracker-public`
- Public URL: `https://game.xiaoknya.cn`

## Local Workflow

1. Inspect local changes:

   ```bash
   git status --short --branch
   ```

2. Validate the app:

   ```bash
   npm run build
   ```

   `npm run lint` is useful, but the current codebase may contain pre-existing
   React lint rule failures unrelated to a deployment change. Do not block a
   hot deploy on unrelated lint failures if `next build --webpack` passes.

3. Commit and push to `main`:

   ```bash
   git add -A
   git commit -m "<type>: <subject>"
   git push origin main
   ```

## GitHub Actions

The workflow is:

- `.github/workflows/deploy.yml`

It builds the Docker image and pushes:

- `secrets.ACR_WEB_IMAGE`

Watch the workflow:

```bash
gh run list --workflow "CI / Publish" --limit 5
gh run watch <run-id> --exit-status
```

Only proceed to server pull after the workflow succeeds.

## Server Pull Deployment

The server does not keep a full git checkout for this public frontend. It only
has `/opt/game-tracker-public/docker-compose.yml`.

Deploy with:

```bash
ssh aliyun-game-tracker "cd /opt/game-tracker-public && docker compose pull web && docker compose up -d web && docker compose ps"
```

The compose file runs:

- service: `web`
- container: `game-tracker-public-web-1`
- host port: `127.0.0.1:3000`
- shared backend network: `game-tracker_default`

Nginx host config:

- `/www/server/nginx/conf/vhost/game.xiaoknya.cn.conf`
- proxies `https://game.xiaoknya.cn` to `http://127.0.0.1:3000`

## Verification

Run:

```bash
ssh aliyun-game-tracker "docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}' | grep -E 'game-tracker-public|NAMES'"
ssh aliyun-game-tracker "docker logs --tail 80 game-tracker-public-web-1 2>&1"
ssh aliyun-game-tracker "curl -I --max-time 15 http://127.0.0.1:3000"
ssh aliyun-game-tracker "curl -I --max-time 15 https://game.xiaoknya.cn"
```

Successful deployment criteria:

- GitHub Actions `CI / Publish` succeeds.
- `game-tracker-public-web-1` is `Up`.
- `http://127.0.0.1:3000` returns `200`.
- `https://game.xiaoknya.cn` returns `200`.

## Current Notes

- The production container uses Next.js standalone output.
- `docker-compose.yml` sets `GAME_TRACKER_API_BASE=http://backend:8000/api`.
- The public frontend joins `game-tracker_default` so it can reach the backend
  container as `backend`.
- The local Windows environment may print SWC native binding warnings. The
  project scripts use Webpack and the build succeeds with the WASM fallback.

