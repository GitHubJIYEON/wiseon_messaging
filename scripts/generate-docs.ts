import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { askClaude } from "./claude-client.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const SYSTEM_PROMPT = `당신은 기술 문서 작성 전문가입니다.

규칙:
1. Markdown 형식으로 작성
2. 한국어로 작성
3. 프로젝트 구조, 사용 기술, 주요 기능을 체계적으로 정리
4. 설치 및 실행 방법 포함
5. 디렉토리 구조를 트리 형태로 표시`;

function collectSourceFiles(dir: string, extensions: string[]): string[] {
  const results: string[] = [];

  function walk(currentDir: string) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        if (["node_modules", "dist", ".git", ".cursor"].includes(entry.name))
          continue;
        walk(fullPath);
      } else if (extensions.some((ext) => entry.name.endsWith(ext))) {
        results.push(fullPath);
      }
    }
  }

  walk(dir);
  return results;
}

function buildProjectSnapshot(): string {
  const srcFiles = collectSourceFiles(path.join(ROOT, "src"), [
    ".ts",
    ".tsx",
    ".css",
  ]);

  const configFiles = [
    "package.json",
    "tsconfig.json",
    "vite.config.ts",
  ].filter((f) => fs.existsSync(path.join(ROOT, f)));

  let snapshot = "## 프로젝트 파일 목록\n\n";

  for (const file of configFiles) {
    const content = fs.readFileSync(path.join(ROOT, file), "utf-8");
    const relPath = file;
    snapshot += `### ${relPath}\n\`\`\`\n${content}\n\`\`\`\n\n`;
  }

  for (const file of srcFiles) {
    const content = fs.readFileSync(file, "utf-8");
    const relPath = path.relative(ROOT, file).replace(/\\/g, "/");
    snapshot += `### ${relPath}\n\`\`\`\n${content}\n\`\`\`\n\n`;
  }

  return snapshot;
}

async function main() {
  const target = process.argv[2] || "readme";

  console.log("📄 프로젝트 분석 중...\n");
  const snapshot = buildProjectSnapshot();

  let prompt: string;
  let outputFile: string;

  switch (target) {
    case "readme":
      prompt = `다음 프로젝트의 소스 코드를 분석하고 README.md를 작성해주세요.\n\n${snapshot}`;
      outputFile = "README.md";
      break;
    case "api":
      prompt = `다음 프로젝트의 소스 코드를 분석하고 API 문서를 작성해주세요. 컴포넌트 props, 유틸 함수, 타입 정의 등을 포함하세요.\n\n${snapshot}`;
      outputFile = "docs/API.md";
      break;
    case "structure":
      prompt = `다음 프로젝트의 소스 코드를 분석하고 프로젝트 구조 문서를 작성해주세요. 각 디렉토리와 파일의 역할을 설명하세요.\n\n${snapshot}`;
      outputFile = "docs/STRUCTURE.md";
      break;
    default:
      console.log("사용법: pnpm docs [readme|api|structure]");
      process.exit(1);
  }

  const content = await askClaude(SYSTEM_PROMPT, prompt, { maxTokens: 4096 });
  const outputPath = path.join(ROOT, outputFile);
  const outputDir = path.dirname(outputPath);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, content, "utf-8");
  console.log(`✅ ${outputFile} 생성 완료!`);
}

main().catch(console.error);
