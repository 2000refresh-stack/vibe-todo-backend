# TODO Backend

간단한 Node.js 기반 TODO 백엔드 템플릿입니다. `src` 폴더 없이 루트에 `index.js`로 서버를 실행합니다.

## 요구 사항
- Node.js 18+ (권장)

## 설치
```bash
npm install
```

## 실행
```bash
npm start
```
- 기본 포트: `http://localhost:3000`

## 엔드포인트
- `GET /` : 서버 동작 확인용 헬스 체크

## 환경 변수
- 환경 변수가 필요하다면 루트에 `.env` 파일을 추가하세요. (예: `PORT=3000`)
- `.env`는 `.gitignore`에 포함되어 커밋되지 않습니다. 공유가 필요하면 `./.env.example`를 만들어 키만 예시로 남겨주세요.

### Heroku 배포 시 필수 환경 변수
- `MONGODB_URI`: MongoDB Atlas 연결 문자열 (예: `mongodb+srv://user:pass@cluster.xxx.mongodb.net/todo`)

### MongoDB Atlas Network Access 설정
Heroku에서 MongoDB 연결을 위해 **MongoDB Atlas Network Access**를 설정해야 합니다:
1. MongoDB Atlas Dashboard → Network Access
2. **Add IP Address** 클릭
3. **Allow Access from Anywhere** 선택 (`0.0.0.0/0`)
4. **Confirm** 클릭

⚠️ **주의**: 프로덕션 환경에서는 보안을 위해 필요한 IP만 허용하는 것을 권장합니다.

## 스크립트
- `npm start` : 프로덕션 실행 (`node index.js`)

## 프로젝트 구조
```
.
├─ index.js        # 서버 엔트리 포인트
├─ package.json
├─ .gitignore
└─ README.md
```

## 참고
- 기본 서버는 Express로 구성되어 있으며, JSON 요청 본문 파싱이 설정되어 있습니다.
- 필요 시 라우트, 미들웨어, 에러 처리기를 `index.js`에 추가하거나 파일을 분리해 확장하세요.