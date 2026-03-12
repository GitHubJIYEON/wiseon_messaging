# 와이즈온 메시지 서비스

## 1. 사용 기술

- **프레임워크:** React
- **상태 관리:** Zustand
- **UI 라이브러리:** TainwildCss, ShadcnUi
- **테이블 라이브러리 :** Tanstack table
- **API 통신:** Axios / React Query (TanStack Query)
- **인증 및 권한:** JWT
- **폼 관리:** React Hook Form + Zod

## 2. 실행 명령어

### 설치

프로젝트 의존성 설치

```jsx
pnpm install
```

### 개발 서버 실행

```jsx
pnpm run dev
```

## 3. 패키지 / 디렉토리 설명

### 폴더 구조

feature 기반 폴더 구조

```jsx
├── public/
├── src/
│   ├── assets/           # 이미지, 아이콘, 파일
│   ├── features/         # 기능별 폴더
│   │   ├── board/          # 예시) 게시판
│   │   │   ├── apis/           # api
│   │   │   ├── components/     # 컴포넌트
│   │   │   ├── hooks/          # UseQuery, UseMutation, Store, Custom hook등
│   │   │   │   ├── queries, mutations, stores
│   │   │   ├── schemas/        # Zod 스키마
│   │   │   ├── types/          # 타입
│   ├── shared/           # 공통 요소들
│   │   ├── apis/           # 공통 api
│   │   ├── components/     # 공통 컴포넌트
│   │   ├── hooks/          # 공통 hooks
│   │   ├── schemas/        # 공통 Zod 스키마
│   │   ├── types/          # 공통 타입
│   ├── pages/            # 페이지
│   │   ├── board.tsx       # 예시) 게시판 페이지
│   ├── App.tsx           # 루트 컴포넌트
├── .env                  # 환경 변수
├── tsconfig.json         # TypeScript 설정
├── package.json          # 패키지 설정
```
