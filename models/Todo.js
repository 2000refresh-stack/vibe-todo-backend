// Mongoose를 불러옵니다.
const mongoose = require('mongoose');

// 할 일(Todo) 스키마 정의
// - title: 할 일 제목(필수)
// - description: 상세 설명(선택)
// - isCompleted: 완료 여부(기본값 false)
// - dueDate: 마감일(선택)
// - createdAt/updatedAt: 자동 타임스탬프
const todoSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: [true, '할 일 제목은 필수입니다.'], // 필수 검증 메시지
			trim: true, // 앞뒤 공백 제거
			maxlength: [200, '제목은 최대 200자까지 가능합니다.'],
		},
		description: {
			type: String,
			trim: true,
			maxlength: [2000, '설명은 최대 2000자까지 가능합니다.'],
		},
		isCompleted: {
			type: Boolean,
			default: false,
			index: true, // 완료 여부로 조회 시 유용
		},
		dueDate: {
			type: Date,
		},
	},
	{
		timestamps: true, // createdAt, updatedAt 자동 관리
		versionKey: false, // __v 필드 비활성화
	}
);

// 필요한 경우 복합 인덱스(예: 마감일 가까운 순) 추가
// todoSchema.index({ isCompleted: 1, dueDate: 1 });

// 모델 생성 및 내보내기
const TodoModel = mongoose.models.Todo || mongoose.model('Todo', todoSchema);
module.exports = { TodoModel };






