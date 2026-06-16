# 사주 MBTI v13.8

> 생년월일시 + 출생지 → ssaju 만세력 + 점성 차트 클라이언트 계산 → 명리·점성·에니어그램·MBTI·직업적성 통합 분석

## 배포 정보

- **엔진**: https://saju-mbti-peach.vercel.app/
- **GitHub**: https://github.com/checker1016-85/saju-mbti
- **GAS 배포 ID**: `AKfycbyoLNtcnJXFEGZKI5YPhu2s1-Dv9vz6hMc2byOo2bsyIgnsvMgI_Jd9v-dQN0gf8wfBdg`
- **Drive DB**: https://drive.google.com/drive/folders/1FLYP1ghHdbycorY6wT2V4N9ZqNIHIq5O

## 시스템 구조

```
[ssaju CDN]                       만세력 계산 (무료, KASI 데이터, 클라이언트)
[circular-natal-horoscope-js CDN] 점성 차트 계산 (무료, 클라이언트, 1분 단위)
     │
[index.html + JS]
  (1) ssaju → 사주4주·십성·격국·강약·12운성·신살·공망·대운
  (2) 점성 → 상승궁(ASC)·태양·달·MC·10행성·12하우스·애스펙트
  (3) 십성 → 스탯 5개 + MBTI 4축 + 에니어그램 9유형
  (4) 스탯 → 직업 적성 (15카테고리 130+직업)
  (5) 십성 → 방사형 레이더 6종 (30축)
     │
[GAS 백엔드]  스크립트 속성: GEMINI_API_KEY, SAZU_API_KEY
  · getDB → 구글시트 DB 읽기 (일주/성별나이/외형/직업 + MBTI/에니어그램)
```

> 만세력·점성 모두 API 없이 클라이언트에서 직접 계산. 출생지 좌표만 있으면 1분 단위 정확.

## 파일 구조

### GitHub (프론트엔드) — 핵심 9개 파일만 (쓰레기 없음)

```
saju-mbti/
├── index.html              ← HTML (3단락 세로 레이아웃)
├── css/style.css           ← 전체 CSS (라이트 테마, 크림색 #f5f3ee)
├── js/
│   ├── data.js             ← 상수·텍스트·직업·MBTI·에니어그램·키워드맵·GAS_URL
│   ├── astro-data.js       ← 점성 한글(별자리/행성/하우스)·SIGN_KEYWORD·국가별 도시 좌표
│   ├── radar.js            ← 시각화 SVG 9종 (아래 표 참조)
│   ├── astro.js            ← 점성 계산(CDN) + 렌더
│   └── app.js              ← 메인 로직 (계산·렌더·모달·선택·종합프로필)
├── vercel.json
├── README.md
└── 작업가이드_*.md
```

### radar.js 시각화 함수 (9개)

| 함수 | 용도 |
|------|------|
| `radarSVG` | 레이더 6종 (5축, 라벨 2줄: 이름 + (퍼센트), 위치별 정렬로 잘림방지) |
| `sajuVizSVG` | 명리 오행 도넛 (중앙 "오행 십성 / 격국") |
| `astroChartSVG` | 점성 12별자리 도넛 (ASC/해/달/MC 마커 안쪽 배치 + 점선 연결) |
| `enneaStarSVG` | 에니어그램 9각 별 (센터호 본능/가슴/사고 바깥테두리 + 날개선 + 중앙메인) |
| `mbtiBigSVG` | MBTI 4축(둥근박스 opacity 0.2) + A/T 게이지(박스밖), 양쪽 동시 게이지 |
| `defaultSajuViz`/`defaultAstroViz`/`defaultEnneaViz`/`defaultMbtiViz` | 조회 전 기본형 |

### GAS 에디터 (백엔드, GitHub에 없음)

```
appsscript.json · Code.gs · Config.gs · Driveservice.gs · Geminiservice.gs · Sajuservice.gs
```

Code.gs 라우터 액션: `ping` · `getDB` · `getSheet` · `listTabs` · `generateComment`

### 구글시트 DB (Drive)

| 키 | 내용 |
|----|------|
| 20_일주론 | 일주 기초/캐릭터DNA/직업 |
| 30_성별나이 | 천간×성별 성격/외형 |
| 31_외형유형 | 외형 분류 |
| 32_직업유형 | 직업 코드 (240개) |
| MBTI | MBTI 32종(A/T) |
| 에니어그램 | 9유형 + 날개 18종 (2탭) |

> 10번대(오행/합충/십성/원국)는 ssaju가 계산 → DB 불필요.

## UI 레이아웃 (3단락 세로)

```
[단락1] 생년월일 입력 — 2칼럼 가로
  좌: 생년월일 / 양력·음력·윤달 / 시간(간지·시:분 탭, 1분 단위, 시간모름)
  우: 성별(디폴트 여)·나이(만/한국 드롭다운) / 출생지(국가→시도→도시 or 위경도직접) / 조회

[단락2] 성격 유형 분석 — 4프레임 세로, 각 고정높이
  명리   : [헤더] 키워드(STEM_ADJ+타입) + 오행도넛
           [원국 고정영역 160px] 좌:4주카드(한자위/한글아래) 50% / 우:정보 50%(내부 스크롤)
              우측 = 대운(전체,현재 hl) · 십성분포(그룹+10종 음양오행) · 십이신살 · 십이운성
                    · 천간관계(합충+천간십성) · 지지관계 · 공망(년주/일주, 한자+한글, 옅은붉은 ●)
           [해석 스크롤 480px] 본능일주 · 사회월주 해석
  점성   : 키워드(SIGN_KEYWORD) + 점성도넛(명리와 동일 구조, ASC/해/달/MC 안쪽마커)
           해석 스크롤: 상승궁·태양·달·MC + 행성·하우스 칩
  에니어그램: 9각 별(센터 바깥테두리 + 날개선 + 중앙 메인) [무료검사][직접선택]
  MBTI   : 4축 막대(둥근박스, 양쪽 게이지) + A/T 게이지(박스밖) [무료검사][직접선택]

[단락3] 성향 프로필 · 적성
  · 종합 프로필 (최상단): 한 문장 + 4종 키워드 칩 (사주/점성/에니어/MBTI)
  · 스탯 5개 + 종합전투력
  · 레이더 6종 (3x2)
  · 직업 선택 (모달)
```

> 종합 프로필은 성향 프로필 최상단에만 표시 (이전의 맨 아래 중복 섹션 삭제됨).

## 핵심 계산 로직

### 만세력 (ssaju 0.2.0)
```js
import { calculateSaju } from 'https://cdn.jsdelivr.net/npm/ssaju@0.2.0/dist/index.mjs';
```
- 필드: `pillarDetails`·`tenGods`·`stages12.bong`·`branchRelations`·`stemRelations`·`sals`·`gongmang.{branches,branchesKo}`·`daeun.list`·`advanced.{geukguk,yongsin,dayStrength}`
- **gender는 '남'/'여'**, calendar는 'solar'/'lunar'
- `stemRelations`는 천간 합/충이 있을 때만 채워짐 (없으면 빈 배열) → UI는 천간 십성도 함께 표시
- `gongmang`은 일주 기준만 제공 → **년주 공망은 60갑자 순중 공식으로 직접 계산**
  - `g1=(b+(10-s))%12, g2=(b+(11-s))%12` (s=천간idx, b=지지idx)

### 점성 (circular-natal-horoscope-js 1.1.0)
```js
import('https://cdn.jsdelivr.net/npm/circular-natal-horoscope-js@1.1.0/+esm')
```
- whole-sign / tropical / major aspects
- **month는 0-index** → 계산 시 month-1 필수
- 필드: `Ascendant`·`CelestialBodies.{sun,moon,...}`·`Houses`·`Midheaven`·`Aspects.all`

### 십성 → 스탯 5개
재물력(편재+정재) · 놀기력(식신+상관) · 리더력(편관+정관) · 학습력(편인+정인) · 독립력(비견+겁재). x14 + 격국/강약 보정.

### 십성 → MBTI 4축
- E/I=(식상+재성)vs(인성+비겁), S/N=(재성+관성)vs(식상+인성), T/F=(관성+비겁)vs(식상+재성), J/P=(정관+정재+정인)vs(편관+편재+편인+상관)
- 양쪽 게이지 동시 표시. 세부 A(확신형)/T(격동형) = 4축 우세강도 평균으로 산출.

### 십성 → 에니어그램
유형별 십성 가중치 행렬 x 십성 카운트 → 최고점 메인, 상위 3개 추천. 날개=인접 ±1. 센터: 본능(8,9,1)/가슴(2,3,4)/사고(5,6,7).

### 십성 분포 (음양오행)
일간 음양 기준 10종 전부 표시(0 포함, chip-zero 옅게). 예) 무토(양토) 일간 → 비견(양토)·겁재(음토)·식신(양금)·상관(음금)·편재(양수)·정재(음수)·편관(양목)·정관(음목)·편인(양화)·정인(음화).

### 레이더 6종 (각 5축)
체력·멘탈 / 사회성 / 재능·두뇌 / 재물·야망 / 관계·연애 / 직업·사회

## DB 적용 (GAS)

1. 구글시트 ID는 Driveservice.gs `SHEET_IDS`에 반영
2. GAS 재배포해야 getDB 반영 → MBTI/에니어그램 상세 설명 표시
3. 미배포 시 data.js 폴백 텍스트 사용

## 작업 규칙 (니노)

1. 사설 없이 명확하게  2. 명리는 자평진전 정설+현대해석  3. 분석 3안 제시 후 선택
4. 파일명 타임스탬프  5. Excel: 세로 가운데 정렬+넉넉한 열너비/행높이
6. GitHub 수정 시 `git fetch && git reset --hard origin/main` 후 재적용
7. 다운로드 가능하게  8. Claude는 코드 생성, 배포는 니노 (이 세션은 Claude가 토큰으로 push)

## 남은 과제

1. MBTI A/T 판정 정교화 (현재 4축 우세강도 평균)
2. 점성 애스펙트 해석 텍스트
3. 구글시트 30/31/32 데이터 UI 본격 연결
4. Gemini 코멘트 연동 (GAS generateComment → 프론트)
5. 유형별 공유 카드 이미지
6. 모바일 반응형 최적화

## 버전 히스토리 (최근)

- **v13.8** 레이더 라벨 잘림수정(2줄 퍼센트) + 맨아래 종합프로필 중복 삭제
- **v13.7** 성향 프로필 점성 칩 누락 수정 (실행 순서 버그)
- **v13.6** 공망 가득찬 원형(옅은 붉은색) + 죽은코드 6함수/고아CSS 4종 정리
- **v13.5** 십성 10종 전체표시(음양오행) + 공망 아이콘
- **v13.4** 천간관계 보강 + 공망 년/일 둘다 + 점성마커 겹침방지
- **v13.0~3** 명리 원국 반반 고정+우측스크롤, 점성 마커 안쪽, 도넛 통일
- **v12.x** 점성 도넛을 명리 오행 도넛과 동일 구조로 재작성
- **v11.x** 3레벨 도시선택, 키워드 타이틀, 레이더/에니어/MBTI 시각화
