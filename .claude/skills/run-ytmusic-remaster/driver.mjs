#!/usr/bin/env node
// Driver for the run-ytmusic-remaster skill.
//
// Starts the Vite dev server, visits one or more routes with a headless
// Chromium (via the project's own `playwright` devDependency), screenshots
// each one, prints any browser console errors, then shuts the server down.
//
// Usage:
//   node .claude/skills/run-ytmusic-remaster/driver.mjs [path ...]
//   node .claude/skills/run-ytmusic-remaster/driver.mjs /login /signup
//
// Run from the project root (the folder containing package.json).
// Screenshots land in .claude/skills/run-ytmusic-remaster/screenshots/.

import { chromium } from "playwright";
import { spawn, execSync } from "node:child_process";
import { mkdirSync, openSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const PORT = 5173;
const BASE_URL = `http://localhost:${PORT}`;
const SKILL_DIR = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(SKILL_DIR, "..", "..", ".."); // .claude/skills/<name> -> root
const SCREENSHOT_DIR = join(SKILL_DIR, "screenshots");

// 인자는 선행 슬래시 없이 받습니다 (예: `login`, `signup`) — Git Bash(MSYS)가
// "/login" 같은 인자를 유닉스 절대경로로 오인해 "C:/Program Files/Git/login"으로
// 멋대로 바꿔버리는 문제가 있어서, 아예 슬래시 없는 표기를 정식 규약으로 삼았습니다.
const rawArgs = process.argv.slice(2);
const targets =
  rawArgs.length > 0
    ? rawArgs.map((p) => (p.startsWith("/") ? p : "/" + p))
    : ["/login", "/signup"];

function freePort(port) {
  try {
    if (process.platform === "win32") {
      const out = execSync(`netstat -ano`, { encoding: "utf8" });
      const pids = new Set();
      for (const line of out.split("\n")) {
        if (line.includes(`:${port}`) && line.includes("LISTENING")) {
          const parts = line.trim().split(/\s+/);
          const pid = parts[parts.length - 1];
          if (pid && /^\d+$/.test(pid)) pids.add(pid);
        }
      }
      for (const pid of pids) {
        try {
          execSync(`taskkill /PID ${pid} /F`, { stdio: "ignore" });
        } catch {
          /* already gone */
        }
      }
    } else {
      const out = execSync(`lsof -ti:${port} -sTCP:LISTEN`, {
        encoding: "utf8",
      }).trim();
      for (const pid of out.split("\n").filter(Boolean)) {
        try {
          execSync(`kill ${pid}`);
        } catch {
          /* already gone */
        }
      }
    }
  } catch {
    // Nothing was listening on the port — that's fine.
  }
}

async function waitForServer(url, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url);
      if (res.ok || res.status < 500) return true;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
}

function slugify(path) {
  return path.replace(/^\//, "").replace(/[^a-zA-Z0-9]+/g, "-") || "index";
}

async function main() {
  mkdirSync(SCREENSHOT_DIR, { recursive: true });

  // 이미 5173번 포트에 뭔가 떠 있으면(사용자가 직접 켜둔 npm run dev일 수 있음) 그걸
  // 그대로 재사용합니다 — 남의 서버를 함부로 죽이고 우리 걸로 바꿔치기하지 않습니다.
  // 우리가 직접 새로 띄운 경우에만 끝나고 나서 정리(kill)합니다.
  let server = null;
  const alreadyUp = await waitForServer(BASE_URL, 1_000);

  if (alreadyUp) {
    console.log(`포트 ${PORT}에 이미 떠 있는 서버를 재사용합니다 (새로 안 띄움).`);
  } else {
    const logFd = openSync(join(SKILL_DIR, "dev-server.log"), "w");
    // 명령을 문자열 하나로 넘깁니다 — shell:true와 별도 args 배열을 같이 쓰면
    // Node가 인자 이스케이프 관련 DEP0190 경고를 냅니다.
    server = spawn(`npm run dev -- --port ${PORT} --strictPort`, {
      cwd: PROJECT_ROOT,
      shell: true,
      stdio: ["ignore", logFd, logFd],
    });

    const up = await waitForServer(BASE_URL, 30_000);
    if (!up) {
      console.error(
        `Dev server never came up on ${BASE_URL} — check .claude/skills/run-ytmusic-remaster/dev-server.log`
      );
      process.exitCode = 1;
      freePort(PORT);
      if (!server.killed) server.kill();
      return;
    }
  }

  let exitCode = 0;
  try {
    const browser = await chromium.launch();
    // 기본은 모바일 폭(480x800)입니다. 대시보드/로그인 화면처럼 데스크탑 고정폭
    // 시안(예: 1200px, 812px 카드)을 확인할 땐 SCREENSHOT_WIDTH/SCREENSHOT_HEIGHT
    // 환경변수로 뷰포트를 넓혀서 호출하세요(예:
    // `SCREENSHOT_WIDTH=1280 SCREENSHOT_HEIGHT=900 node driver.mjs login`).
    const page = await browser.newPage({
      viewport: {
        width: Number(process.env.SCREENSHOT_WIDTH) || 480,
        height: Number(process.env.SCREENSHOT_HEIGHT) || 800,
      },
    });
    const consoleErrors = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(`[console] ${msg.text()}`);
    });
    page.on("pageerror", (err) => consoleErrors.push(`[pageerror] ${err}`));

    for (const path of targets) {
      const url = BASE_URL + path;
      await page.goto(url, { waitUntil: "networkidle" });
      const file = join(SCREENSHOT_DIR, `${slugify(path)}.png`);
      await page.screenshot({ path: file });
      console.log(`Screenshot: ${path} -> ${file}`);
    }

    await browser.close();

    if (consoleErrors.length > 0) {
      console.error("Console errors detected:");
      for (const e of consoleErrors) console.error("  " + e);
      exitCode = 1;
    } else {
      console.log("No console errors.");
    }
  } finally {
    // 우리가 직접 띄운 서버일 때만 정리합니다. 원래 떠 있던(재사용한) 서버는
    // 그대로 살려둡니다.
    if (server) {
      freePort(PORT);
      if (!server.killed) server.kill();
    }
  }

  process.exitCode = exitCode;
}

main();
