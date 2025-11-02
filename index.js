// 환경변수 파일(.env) 로드 (dotenv는 최상단에 위치해야 함)
require('dotenv').config();

// express 모듈과 mongoose 모듈을 불러옵니다.
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // CORS 모듈 추가
const helmet = require('helmet'); // 보안 헤더를 위한 helmet 추가
const { router: todosRouter } = require('./routers/todos');

// express 애플리케이션을 생성합니다.
const app = express();

// 요청 로깅 미들웨어 (요청 경로/메서드 확인용)
app.use((req, _res, next) => {
	console.log(`[REQ] ${req.method} ${req.originalUrl}`);
	return next();
});

// 보안 헤더 적용 (X-Content-Type-Options: nosniff 등)
app.use(helmet());

// 모든 오리진에서 오는 요청 허용
app.use(cors()); // ⭐ CORS 설정 (필수)

// 사용할 포트 번호를 지정합니다.
const PORT = process.env.PORT || 5000;

// JSON 형식의 요청 body를 파싱할 수 있게 설정합니다.
app.use(express.json());

// 할 일 라우터를 등록합니다.
app.use('/todos', todosRouter);

// 기본 라우트 설정 (서버 동작 확인용)
app.get('/', (req, res) => {
	// 클라이언트에게 메시지를 응답합니다.
	res.send('서버가 정상적으로 작동 중입니다.');
});

// MongoDB 연결 상태 확인 라우트
app.get('/health', (req, res) => {
	const mongoStatus = mongoose.connection.readyState;
	const statusMessages = {
		0: 'disconnected', // 연결 안 됨
		1: 'connected', // 연결 됨
		2: 'connecting', // 연결 중
		3: 'disconnecting', // 연결 해제 중
	};
	res.json({
		server: 'running',
		mongodb: statusMessages[mongoStatus] || 'unknown',
	});
});

// 등록되지 않은 경로로의 접근에 대한 통합 404 처리
app.use((req, res) => {
	return res.status(404).json({ message: 'Not Found', path: req.originalUrl, method: req.method });
});

// 전역 에러 핸들러 (500 에러 처리)
app.use((err, req, res, next) => {
	console.error('서버 에러:', err);
	return res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

// MongoDB 연결 URI (환경변수 MONGODB_URI가 있으면 사용, 없으면 로컬 기본값 사용)
const mongoDbUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/todo';

// MongoDB 연결 및 서버 시작 함수
async function connectDbAndStartServer() {
	try {
		// MongoDB에 연결합니다.
		await mongoose.connect(mongoDbUri);

		// 연결 성공 시 로그 출력
		console.log('연결성공');
	} catch (connectionError) {
		// 연결 실패 시 경고만 출력하고 서버는 계속 시작
		console.error('MongoDB 연결 실패:', connectionError);
		console.warn('⚠️  MongoDB 없이 서버를 시작합니다. 일부 기능이 동작하지 않을 수 있습니다.');
	}

	// MongoDB 연결 여부와 관계없이 서버 실행
	app.listen(PORT, () => {
		console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
	});
}

// 애플리케이션 시작
connectDbAndStartServer();
