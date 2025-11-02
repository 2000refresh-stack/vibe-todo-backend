// Express 라우터와 Todo 모델을 불러옵니다.
const express = require('express');
const mongoose = require('mongoose');
const { TodoModel } = require('../models/Todo');

// 라우터 인스턴스를 생성합니다.
const router = express.Router();

// 할 일 목록 조회 라우트
// GET /todos
router.get('/', async (req, res) => {
	try {
		// 옵션: 완료 여부 필터링 쿼리 (?isCompleted=true|false)
		const { isCompleted } = req.query || {};
		const filter = {};
		if (typeof isCompleted === 'string') {
			if (isCompleted === 'true') filter.isCompleted = true;
			else if (isCompleted === 'false') filter.isCompleted = false;
		}

		// 최신 생성순으로 정렬하여 반환
		const todos = await TodoModel.find(filter).sort({ createdAt: -1 });
		return res.status(200).json(todos);
	} catch (error) {
		console.error('할 일 목록 조회 중 오류:', error);
		return res.status(500).json({ message: '할 일 목록 조회 중 서버 오류가 발생했습니다.' });
	}
});

// 할 일 단건 조회 라우트
// GET /todos/:id
router.get('/:id', async (req, res) => {
	try {
		const { id: todoId } = req.params;
		if (!mongoose.isValidObjectId(todoId)) {
			return res.status(400).json({ message: '유효한 할 일 ID가 아닙니다.' });
		}

		const todo = await TodoModel.findById(todoId);
		if (!todo) {
			return res.status(404).json({ message: '해당 ID의 할 일을 찾을 수 없습니다.' });
		}

		return res.status(200).json(todo);
	} catch (error) {
		console.error('할 일 단건 조회 중 오류:', error);
		return res.status(500).json({ message: '할 일 단건 조회 중 서버 오류가 발생했습니다.' });
	}
});

// 할 일 생성 라우트
// POST /todos
router.post('/', async (req, res) => {
	try {
		// 요청 본문에서 필드를 추출합니다.
		const { title, description, dueDate, isCompleted } = req.body || {};

		// 필수 값 검증: title은 반드시 필요합니다.
		if (!title || typeof title !== 'string' || title.trim().length === 0) {
			return res.status(400).json({ message: 'title은 필수이며 문자열이어야 합니다.' });
		}

		// dueDate가 전달되었다면 유효한 날짜인지 검증합니다.
		let parsedDueDate;
		if (dueDate !== undefined) {
			const due = new Date(dueDate);
			if (Number.isNaN(due.getTime())) {
				return res.status(400).json({ message: 'dueDate는 유효한 날짜여야 합니다.' });
			}
			parsedDueDate = due;
		}

		// 생성할 문서를 구성합니다.
		const todoToCreate = {
			title: title.trim(),
			description: description?.toString().trim(),
			isCompleted: Boolean(isCompleted) === true,
			// 날짜는 검증된 경우에만 설정
			...(parsedDueDate ? { dueDate: parsedDueDate } : {}),
		};

		// 문서를 생성합니다.
		const created = await TodoModel.create(todoToCreate);

		// 생성 성공: 201 코드와 함께 응답합니다.
		return res.status(201).json(created);
	} catch (error) {
		// Mongoose 검증 오류 메시지를 사용자에게 전달합니다.
		if (error?.name === 'ValidationError') {
			return res.status(400).json({ message: error.message });
		}
		// 알 수 없는 오류는 500으로 응답합니다.
		console.error('할 일 생성 중 오류:', error);
		return res.status(500).json({ message: '할 일 생성 중 서버 오류가 발생했습니다.' });
	}
});

// 할 일 수정 라우트 (부분 수정)
// PATCH /todos/:id
router.patch('/:id', async (req, res) => {
	try {
		// URL 파라미터에서 id를 추출하고 ObjectId 유효성을 검증합니다.
		const { id: todoId } = req.params;
		if (!mongoose.isValidObjectId(todoId)) {
			return res.status(400).json({ message: '유효한 할 일 ID가 아닙니다.' });
		}

		// 요청 본문에서 수정 가능한 필드만 선별합니다.
		const { title, description, isCompleted, dueDate } = req.body || {};

		// 업데이트 데이터 구성 (전달된 값만 반영)
		const updateData = {};
		if (typeof title === 'string') updateData.title = title.trim();
		if (typeof description === 'string') updateData.description = description.trim();
		if (typeof isCompleted === 'boolean') updateData.isCompleted = isCompleted;
		if (dueDate !== undefined) {
			const parsed = new Date(dueDate);
			if (Number.isNaN(parsed.getTime())) {
				return res.status(400).json({ message: 'dueDate는 유효한 날짜여야 합니다.' });
			}
			updateData.dueDate = parsed;
		}

		// 변경할 값이 하나도 없는 경우 방어
		if (Object.keys(updateData).length === 0) {
			return res.status(400).json({ message: '수정할 필드를 최소 1개 이상 제공하세요.' });
		}

		// findByIdAndUpdate로 부분 수정, 검증 실행 및 수정된 문서 반환
		const updated = await TodoModel.findByIdAndUpdate(todoId, updateData, {
			new: true,
			runValidators: true,
		});

		// 존재하지 않는 경우
		if (!updated) {
			return res.status(404).json({ message: '해당 ID의 할 일을 찾을 수 없습니다.' });
		}

		return res.status(200).json(updated);
	} catch (error) {
		if (error?.name === 'ValidationError') {
			return res.status(400).json({ message: error.message });
		}
		console.error('할 일 수정 중 오류:', error);
		return res.status(500).json({ message: '할 일 수정 중 서버 오류가 발생했습니다.' });
	}
});

// 할 일 삭제 라우트
// DELETE /todos/:id
router.delete('/:id', async (req, res) => {
	try {
		// URL 파라미터에서 id를 추출하고 ObjectId 유효성을 검증합니다.
		const { id: todoId } = req.params;
		if (!mongoose.isValidObjectId(todoId)) {
			return res.status(400).json({ message: '유효한 할 일 ID가 아닙니다.' });
		}

		// 문서를 삭제합니다.
		const deleted = await TodoModel.findByIdAndDelete(todoId);

		// 존재하지 않는 경우
		if (!deleted) {
			return res.status(404).json({ message: '해당 ID의 할 일을 찾을 수 없습니다.' });
		}

		// 성공적으로 삭제: 내용 없는 204로 응답
		return res.status(204).send();
	} catch (error) {
		console.error('할 일 삭제 중 오류:', error);
		return res.status(500).json({ message: '할 일 삭제 중 서버 오류가 발생했습니다.' });
	}
});

module.exports = { router };


