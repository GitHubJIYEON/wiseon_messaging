import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { askClaude } from "./claude-client.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const SYSTEM_PROMPT = `당신은 릴리즈 노트 작성 전문가입니다.

규칙:
1. Markdown 형식으로 작성
2. 한국어로 작성
3. 섹션 분류: ✨ 새로운 기능, 🐛 버그 수정, ♻️ 리팩토링, 📝 문서, 🔧 기타
4. 각 항목은 간결하게 한 줄로 요약
5. 사용자 관점에서 이해하기 쉽게 작성
6. 날짜와 버전 번호 포함`;

function getGitLog(since?: string): string {
  const sinceArg = since ? `--since="${since}"` : "--max-count=50";
  try {
    return execSync(`git log ${sinceArg} --pretty=format:"%h %s" --no-merges`, {
      encoding: "utf-8",
      cwd: ROOT,
    });
  } catch {
    return "";
  }
}

function getLatestTag(): string | null {
  try {
    return execSync("git describe --tags --abbrev=0", {
      encoding: "utf-8",
      cwd: ROOT,
    }).trim();
  } catch {
    return null;
  }
}

function getLogSinceTag(tag: string): string {
  try {
    return execSync(
      `git log ${tag}..HEAD --pretty=format:"%h %s" --no-merges`,
      { encoding: "utf-8", cwd: ROOT },
    );
  } catch {
    return "";
  }
}

async function main() {
  const version = process.argv[2] || "next";

  console.log("📋 커밋 히스토리 분석 중...\n");

  const latestTag = getLatestTag();
  const commits = latestTag ? getLogSinceTag(latestTag) : getGitLog();

  if (!commits.trim()) {
    console.log("릴리즈 노트를 생성할 커밋이 없습니다.");
    process.exit(1);
  }

  const pkgJson = JSON.parse(
    fs.readFileSync(path.join(ROOT, "package.json"), "utf-8"),
  );

  const userMessage = `다음 Git 커밋 히스토리를 분석하고 릴리즈 노트를 작성해주세요.

프로젝트: ${pkgJson.name}
버전: ${version === "next" ? `${pkgJson.version} (다음 릴리즈)` : version}
이전 태그: ${latestTag || "없음"}
날짜: ${new Date().toISOString().split("T")[0]}

커밋 히스토리:
${commits}`;

  const releaseNotes = await askClaude(SYSTEM_PROMPT, userMessage, {
    maxTokens: 4096,
  });

  const outputPath = path.join(ROOT, "RELEASE_NOTES.md");
  let existing = "";
  if (fs.existsSync(outputPath)) {
    existing = fs.readFileSync(outputPath, "utf-8");
  }

  const newContent = existing
    ? `${releaseNotes}\n\n---\n\n${existing}`
    : releaseNotes;

  fs.writeFileSync(outputPath, newContent, "utf-8");
  console.log("✅ RELEASE_NOTES.md 생성 완료!\n");
  console.log(releaseNotes);
}

main().catch(console.error);
