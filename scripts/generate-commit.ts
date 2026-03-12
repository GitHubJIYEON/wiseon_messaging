import { execSync } from "child_process";
import { askClaude } from "./claude-client.ts";

const SYSTEM_PROMPT = `당신은 Git 커밋 메시지를 작성하는 전문가입니다.

규칙:
1. Conventional Commits 형식을 따르세요: type(scope): description
2. type: feat, fix, refactor, style, docs, test, chore, perf, ci, build
3. scope는 선택사항이며, 변경된 주요 모듈명을 사용
4. description은 한국어로, 50자 이내로 간결하게
5. 필요시 본문에 상세 설명 추가 (빈 줄로 구분)
6. 커밋 메시지만 출력하세요. 다른 설명은 불필요합니다.`;

async function main() {
  const diff = execSync("git diff --staged", { encoding: "utf-8" });

  if (!diff.trim()) {
    console.log("스테이징된 변경사항이 없습니다. `git add` 후 다시 시도하세요.");
    process.exit(1);
  }

  const status = execSync("git diff --staged --stat", { encoding: "utf-8" });

  const userMessage = `다음 git diff를 분석하고 적절한 커밋 메시지를 작성해주세요.

변경 요약:
${status}

상세 diff:
${diff.slice(0, 8000)}`;

  console.log("🔍 변경사항 분석 중...\n");
  const commitMessage = await askClaude(SYSTEM_PROMPT, userMessage);
  console.log("📝 추천 커밋 메시지:\n");
  console.log("─".repeat(50));
  console.log(commitMessage);
  console.log("─".repeat(50));
  console.log("\n아래 명령어로 커밋할 수 있습니다:");
  console.log(`git commit -m "${commitMessage.split("\n")[0]}"`);
}

main().catch(console.error);
