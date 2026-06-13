# 사주 MBTI v11.4

> 생년월일시 + 출생지 → ssaju 만세력 + 점성 차트 클라이언트 계산 → 명리·점성·에니어그램·MBTI·직업적성 통합 분석

## 배포 정보

- **엔진**: https://saju-mbti-peach.vercel.app/
- **GitHub**: https://github.com/checker1016-85/saju-mbti
- **GAS 배포 ID**: `AKfycbyoLNtcnJXFEGZKI5YPhu2s1-Dv9vz6hMc2byOo2bsyIgnsvMgI_Jd9v-dQN0gf8wfBdg`
- **Drive DB**: https://drive.google.com/drive/folders/1FLYP1ghHdbycorY6wT2V4N9ZqNIHIq5O

## 시스템 구조

```
[ssaju CDN]                      만세력 계산 (무료, KASI 데이터, 클라이언트)
[circular-natal-horoscope-js CDN] 점성 차트 계산 (무료, 클라이언트, 1분 단위)
     │
[index.html + JS]
  ① ssaju → 사주4주·십성·격국·강약·12운성·신살·공망·대운
  ② 점성 → 상승궁(ASC)·태양·달·MC·10행성·12하우스·애스펙트
  ③ 십성 → 스탯 5개 + MBTI 4축 + 에니어그램 9유형
  ④ 스탯 → 직업 적성 (15카테고리 130+직업)
  ⑤ 십성 → 방사형 레이더 6종 (30축)
     │
[GAS 백엔드]  스크립트 속성: GEMINI_API_KEY, SAZU_API_KEY
  · getDB → 구글시트 DB 읽기 (일주/성별나이/외형/직업 + MBTI/에니어그램)
```

> 점성술도 API 없이 클라이언트에서 직접 계산. 출생지 좌표만 있으면 1분 단위 정확.

## 파일 구조

### GitHub (프론트엔드)

```
saju-mbti/
├── index.html              ← HTML (3단락 세로 레이아웃)
├── css/style.css           ← 전체 CSS (라이트 테마)
├── js/
│   ├── data.js             ← 상수·텍스트·직업·MBTI·에니어그램·센터·무료링크
│   ├── astro-data.js       ← 점성 한글(별자리/행성/하우스) + 국가별 도시 좌표
│   ├── radar.js            ← 시각화 SVG (레이더/사주도넛/점성차트/에니어별/MBTI막대 + 기본형)
│   ├── astro.js            ← 점성 계산(CDN) + 렌더
│   └── app.js              ← 메인 로직 (계산·렌더·모달·선택)
├── vercel.json
├── README.md
└── 작업가이드_*.md
```

### GAS 에디터 (백엔드, GitHub에 없음)

```
appsscript.json · Code.gs · Config.gs · Driveservice.gs · Geminiservice.gs · Sajuservice.gs
```

### 구글시트 DB (Drive)

| 키 | 시트 ID | 내용 |
|----|---------|------|
| 20_일주론 | 17WWPi... | 일주 기초/캐릭터DNA/직업 |
| 30_성별나이 | 1D-I2o... | 천간×성별 성격/외형 |
| 31_외형유형 | 1wNL-S... | 외형 분류 |
| 32_직업유형 | 1Q_hog... | 직업 코드 |
| MBTI | 1YP6og... | MBTI 32종(A/T) |
| 에니어그램 | 1xvEqs... | 에니어그램 9유형 + 날개 18종 (2탭) |

> 10번대(오행/합충/십성/원국)는 ssaju가 계산 → DB 불필요.

## UI 레이아웃 (3단락 세로)

```
[단락1] 생년월일 입력 — 2칼럼 가로
  좌: 생년월일 / 양력음력 / 시간(간지·시:분 탭, 1분 단위)
  우: 성별·나이 / 출생지(국가→도시 or 위경도 직접) / 조회 버튼
[단락2] 성격 유형 분석 — 4프레임 세로, 각 고정높이 480px
  ☯️ 명리   : 키워드 + 오행도넛(중앙 "수 비겁/건록격"), 좌하단 스크롤(대운·공망·신살·12운성)
  🌌 점성   : 키워드 + 점성차트(ASC/MC축·☉☽마커·애스펙트선), 좌하단 스크롤(행성·12하우스 칩)
  🔷 에니어그램: 9각 별(센터호 본능/가슴/사고 + 날개 방향선 + 중앙 메인) [무료검사][직접선택]
  🧠 MBTI   : 4축 막대(퍼센트) + 세부 A/T + 최고지표 [무료검사][직접선택]
  📋 종합 프로필
[단락3] 성향 프로필 · 적성
  스탯 5개 + 종합전투력 / 레이더 6종(3×2) / 직업 선택
```

## 핵심 계산 로직

### 만세력 (ssaju)
```js
import { calculateSaju } from 'https://cdn.jsdelivr.net/npm/ssaju@0.2.0/dist/index.mjs';
```
- 필드: `pillarDetails`·`tenGods`·`stages12.bong`·`branchRelations`·`sals`·`gongmang.branchesKo`·`daeun.list`·`advanced.{geukguk,yongsin,dayStrength}`

### 점성 (circular-natal-horoscope-js)
```js
import('https://cdn.jsdelivr.net/npm/circular-natal-horoscope-js@1.1.0/+esm')
```
- whole-sign / tropical / major aspects
- **month는 0-index** → 계산 시 `month-1` 필수
- 필드: `Ascendant`·`CelestialBodies.{sun,moon,...}`·`Houses`·`Midheaven`·`Aspects.all`

### 십성 → 스탯 5개
재물력(편재+정재) · 놀기력(식신+상관) · 리더력(편관+정관) · 학습력(편인+정인) · 독립력(비견+겁재). ×14 + 격국/강약 보정.

### 십성 → MBTI 4축
- E/I=(식상+재성)vs(인성+비겁), S/N=(재성+관성)vs(식상+인성), T/F=(관성+비겁)vs(식상+재성), J/P=(정관+정재+정인)vs(편관+편재+편인+상관)
- 차이 15% 이내 → 양쪽 추천. 세부 A(확신형, 우세 다수)/T(격동형).

### 십성 → 에니어그램
유형별 십성 가중치 행렬 × 십성 카운트 → 최고점 = 메인, 상위 3개 추천. 날개=인접 ±1. 센터: 본능(8,9,1)/가슴(2,3,4)/사고(5,6,7).

> **추천 우선순위 = 사주 십성과 가장 가까운 유형.** 사용자가 모달로 직접 변경 가능.

### 레이더 6종 (각 5축)
체력·멘탈 / 사회성 / 재능·두뇌 / 재물·야망 / 관계·연애 / 직업·사회

## DB 적용 (GAS)

1. 구글시트 ID는 Driveservice.gs `SHEET_IDS`에 반영됨
2. GAS 재배포해야 getDB 반영 → MBTI/에니어그램 상세 설명 표시
3. 미배포 시 data.js 폴백 텍스트 사용

## 작업 규칙 (니노)

1. 사설 없이 명확하게  2. 명리는 자평진전 정설+현대해석  3. 분석 3안 제시 후 선택
4. 파일명 타임스탬프  5. Excel: 세로 가운데 정렬+넉넉한 열너비/행높이
6. GitHub 수정 시 `git fetch && git reset --hard origin/main` 후 재적용
7. 다운로드 가능하게  8. Claude는 코드 생성, 배포는 니노 (이 세션은 Claude가 토큰으로 push)

## 남은 과제

1. MBTI A/T 판정 정교화 (현재 단순 우세 카운트)
2. 점성 애스펙트 해석 텍스트
3. 구글시트 30/31/32 데이터 UI 본격 연결
4. Gemini 코멘트 연동
5. 유형별 공유 카드 이미지
6. 모바일 최적화 점검
