# 사주 MBTI

사주(四柱)로 보는 내 기질·성향·적성 분석 엔진.

## 배포 정보

- **엔진**: https://saju-mbti-peach.vercel.app/
- **GitHub**: https://github.com/checker1016-85/saju-mbti
- **GAS 배포 ID**: `AKfycbyoLNtcnJXFEGZKI5YPhu2s1-Dv9vz6hMc2byOo2bsyIgnsvMgI_Jd9v-dQN0gf8wfBdg`
- **Drive**: https://drive.google.com/drive/folders/1U0Qj1XO0K7aUEGOtnOJfBIcQFw6aQDeX

## GAS 스크립트 속성

| 속성 | 용도 | 상태 |
|------|------|------|
| GEMINI_API_KEY | Gemini API (향후 이미지/텍스트 생성) | 저장됨 |
| SAZU_API_KEY | 만세력 API (현재 ssaju CDN 대체) | 저장됨 |

> 현재 엔진은 ssaju CDN으로 클라이언트 완결. GAS/API는 향후 확장용으로 예비.

## 파일 구조

```
saju-mbti/
├── index.html          ← HTML 구조 (107줄)
├── css/
│   └── style.css       ← 전체 CSS (34줄)
├── js/
│   ├── data.js         ← 상수, 텍스트, 직업 카테고리 (32줄)
│   ├── radar.js        ← SVG 레이더 차트 (40줄)
│   └── app.js          ← 메인 로직 (206줄)
├── vercel.json
└── README.md
```

## 시스템 구조

```
[ssaju CDN]  만세력 계산 (클라이언트)
     │
[index.html + JS]
  ① ssaju → 사주4주·십성·격국·강약
  ② 십성 → 스탯 5개 + 방사형 4종
  ③ 십성 비율 → MBTI 추정
  ④ 일간+일지+월지 → 기질/성향 텍스트
  ⑤ 스탯 → 직업 적성 매칭
```

## 기능

- 생년월일시 → ssaju 사주 분석 (양력/음력/윤달, 간지/시분, 야자시)
- 십성 기반 스탯 5개 (재물력/놀기력/리더력/학습력/독립력)
- 방사형 레이더 4종 (체력·멘탈 / 사회성 / 재능·두뇌 / 재물·야망)
- MBTI 추정 (십성 비율 → 4축)
- 유형 코드 (일간 수식어 + TOP2 스탯 = 100+가지)
- 직업 모달 (15카테고리 130+직업, 사주 기반 추천 ★)
- 일주·월주 해석 텍스트

## 수정 가이드

| 수정 대상 | 파일 |
|---|---|
| 레이아웃/구조 | `index.html` |
| 색상/폰트/간격 | `css/style.css` |
| 직업 추가/텍스트 수정 | `js/data.js` |
| 레이더 차트 모양 | `js/radar.js` |
| 계산/렌더/모달 로직 | `js/app.js` |

## 남은 과제

1. 에니어그램 추가 (십성 패턴 → 9유형)
2. GAS 연동 (공유 랭킹, 구글시트 저장)
3. Gemini 활용 (성향 기반 AI 코멘트)
4. 사주 DB 시트 연동 (기존 캐릭터 엔진 62탭)
