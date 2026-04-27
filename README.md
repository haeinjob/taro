# 타로 오늘의 운세 앱

Next.js 16 + Framer Motion + Claude Haiku 기반 타로 운세 웹앱.

---

## 배포 방법 (Vercel)

### 1단계 — Anthropic API 키 발급

1. [console.anthropic.com](https://console.anthropic.com) 접속 → 회원가입 / 로그인
2. **API Keys** 메뉴 → **Create Key**
3. 키 복사해두기 (`sk-ant-...` 형태)

> API 키가 없어도 앱은 작동합니다. 운세 텍스트가 기본값(fallback)으로 표시될 뿐입니다.

---

### 2단계 — Vercel 배포

1. [vercel.com](https://vercel.com) 로그인 후 **Add New → Project**
2. GitHub 레포 `haeinjob/taro` 선택 → **Import**
3. **Environment Variables** 섹션에서 아래 변수 추가:

   | Name | Value |
   |------|-------|
   | `ANTHROPIC_API_KEY` | `sk-ant-여기에붙여넣기` |

4. **Deploy** 클릭

빌드가 완료되면 Vercel이 자동으로 URL을 발급합니다.

---

### 배포 후 확인

- 카테고리 선택 (오늘/연애/직업/금전) → 카드 섞기 → 카드 선택 → 운세 확인
- 운세 텍스트가 나오면 API 연결 성공
- 하단에 `* API 키 없이 기본 운세를 표시하고 있어요` 문구가 보이면 환경변수 재확인

---

## 로컬 실행 (선택)

```bash
git clone https://github.com/haeinjob/taro.git
cd taro

# 의존성 설치
npm install

# 환경변수 설정
cp .env.local.example .env.local
# .env.local 파일 열어서 ANTHROPIC_API_KEY= 뒤에 키 입력

# 개발 서버 실행
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속.

---

## 기술 스택

| 항목 | 버전 |
|------|------|
| Next.js | 16.2.4 (App Router) |
| React | 19 |
| Framer Motion | 12 |
| Tailwind CSS | v4 |
| Claude Haiku | claude-haiku-4-5 |

카드 이미지: 라이더-웨이트 타로 78장 (1909년, 퍼블릭 도메인)
