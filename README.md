# KLink — Korean Fashion for Canada 🇰🇷 → 🇨🇦

> 무재고 역직구 쇼핑몰 | Zero-inventory K-Fashion Platform for Canadian Customers

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Firebase](https://img.shields.io/badge/Firebase-11-orange?style=flat-square&logo=firebase)
![Stripe](https://img.shields.io/badge/Stripe-Payment-635BFF?style=flat-square&logo=stripe)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css)

---

## 프로젝트 개요

KLink는 한국 패션 플랫폼(무신사)의 상품을 캐나다 고객에게 직접 판매하는 **무재고 역직구 쇼핑몰**입니다.

### 비즈니스 플로우

```
고객 주문
  → 관리자가 무신사에서 해당 상품 구매
  → 배송대행지로 발송
  → 배송대행지 검수 완료
  → 캐나다 고객에게 발송
```

---

## 기술 스택

| 분류      | 기술                                              |
| --------- | ------------------------------------------------- |
| Frontend  | Next.js 16 (App Router), TypeScript, Tailwind CSS |
| 상태관리  | Zustand                                           |
| Backend   | Firebase (Firestore, Auth, Storage)               |
| 결제      | Stripe                                            |
| 폼 검증   | React Hook Form + Zod                             |
| 주소 검색 | Google Maps Places API                            |
| 배포      | Vercel                                            |

---

## 주요 기능

### 고객 페이지

- 이메일/Google 소셜 로그인
- 상품 목록 — 카테고리/서브카테고리 필터, 정렬
- 상품 상세 — 이미지 갤러리, 북미 사이즈 선택, 수량 조절
- 위시리스트 — 체크박스 선택, 전체 선택/삭제
- 장바구니 — 수량 변경, 선택 결제
- 체크아웃 — Google Maps 주소 자동완성, Stripe 결제
- 마이페이지 — 주문 내역, 주소 관리

### 관리자 페이지

- 대시보드 — 상품/주문/회원 통계
- 상품 관리 — CRUD, 이미지 업로드, 노출/숨김
- 무신사 크롤링 — URL 입력 시 상품명/브랜드/가격 자동 파싱
- 주문 관리 — 상태 변경 (paid → processing → shipped → delivered)
- 회원 관리 — 주문 내역, 배송지 확인

---

## Cloud Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        Client                           │
│              Next.js (Vercel Edge Network)              │
└───────────────────────┬─────────────────────────────────┘
                        │
          ┌─────────────┼─────────────┐
          │             │             │
          ▼             ▼             ▼
┌─────────────┐  ┌─────────────┐  ┌──────────────────┐
│  Firebase   │  │   Stripe    │  │  Google Cloud    │
│             │  │             │  │                  │
│ • Auth      │  │ • Payment   │  │ • Maps API       │
│ • Firestore │  │   Intent    │  │ • Places API     │
│ • Storage   │  │ • Webhook   │  │   (주소 자동완성) │
└─────────────┘  └─────────────┘  └──────────────────┘
```

### 데이터 흐름

```
[결제 플로우]
고객 → Checkout 페이지
  → Next.js API Route (/api/stripe/create-payment-intent)
    → Firebase Admin으로 카트 데이터 검증
    → Stripe PaymentIntent 생성
  → Stripe 결제 완료
  → Stripe Webhook → /api/stripe/webhook
    → Firestore에 Order 생성
    → 카트 아이템 삭제

[이미지 업로드 플로우]
관리자 → 상품 이미지 선택
  → Firebase Storage 업로드
  → 이미지 URL → Firestore 상품 문서에 저장
  → 고객 페이지에서 이미지 렌더링

[인증 플로우]
사용자 → Firebase Auth (이메일 or Google)
  → Firestore users 컬렉션에 유저 정보 저장
  → Zustand authStore에 유저 상태 관리
  → ProtectedRoute로 페이지 접근 제어
```

### Firestore 데이터 구조

```
Firestore
├── users/{userId}
│   ├── email, name, role (customer | admin)
│   └── addresses: Address[]
├── products/{productId}
│   ├── name, brand, price (CAD), category, subcategory
│   ├── images: string[], sizes: Size[]
│   └── status (active | sold_out | hidden)
├── orders/{orderId}
│   ├── userId, items, shippingAddress
│   ├── status (pending → paid → processing → shipped → delivered)
│   └── subtotal, shipping, tax, total
├── wishlist/{userId}/items/{productId}
└── cart/{userId}/items/{itemId}
```

### 배포 인프라

```
GitHub (main 브랜치)
  → Vercel CI/CD 자동 배포
  → Edge Network (전 세계 CDN)
  → Serverless API Routes
  → 환경변수: Firebase, Stripe, Google Maps 키 관리
```

---

## 프로젝트 구조

```
src/
├── app/
│   ├── (customer)/     # 고객 페이지
│   ├── (admin)/        # 관리자 페이지
│   ├── api/            # API Routes (Stripe, 크롤링)
│   └── auth/           # 로그인/회원가입
├── components/
│   ├── shared/         # 공용 컴포넌트
│   ├── customer/       # 고객용 컴포넌트
│   └── admin/          # 관리자용 컴포넌트
├── hooks/              # 커스텀 훅
├── lib/                # Firebase, Stripe 설정
├── store/              # Zustand 상태관리
└── types/              # TypeScript 타입 정의
```

---

## 로컬 실행

```bash
# 패키지 설치
npm install

# 환경변수 설정
cp .env.example .env.local
# .env.local 파일에 Firebase, Stripe, Google Maps API 키 입력

# 개발 서버 실행
npm run dev
```

### 필요한 환경변수

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
```

---

## Stripe 테스트 결제

```
카드번호: 4242 4242 4242 4242
만료일:   12/28
CVC:      123
```

---

## 개발자

|------|------|
| 개발자 | 홍수지 |
| 개발 기간 | 2026.6 ~ |
| 배포 URL | https://k--link.vercel.app |

---

## 라이선스

This project is for portfolio purposes only.

---

## Built with Claude

이 프로젝트는 **Claude**와 함께 개발되었습니다.

| 항목          | 내용                                                          |
| ------------- | ------------------------------------------------------------- |
| AI 어시스턴트 | Claude (Anthropic)                                            |
| 활용 방식     | 전체 개발 과정에서 코드 작성, 에러 디버깅, 아키텍처 설계 협업 |

### Claude와 함께한 개발 과정

- **프로젝트 설계** — 전체 폴더 구조, Firestore 데이터 모델, 기술 스택 선정
- **코드 작성** — 고객/관리자 페이지, API Routes, 커스텀 훅 등 전체 코드베이스
- **에러 디버깅** — TypeScript 타입 에러, ESLint 규칙, CORS, Firebase 설정 등
- **배포** — Vercel 배포, Firebase 보안 규칙, Stripe Webhook 연동

> 개발자가 방향을 설정하고 Claude가 구현을 도와주는 방식으로 협업하여 완성한 프로젝트입니다.
