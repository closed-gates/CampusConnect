# Video Lecture Streaming & Watch Progress Workflow

## 1. User story

Students open **Video Lectures**, watch uploaded files or embedded videos, and have playback progress saved automatically.

Faculty and admins can **upload** a video file, **embed** a YouTube/Vimeo/HTTPS URL, **watch** lectures, and **delete** them. Students cannot publish or delete.

## 2. Sequential flow

### Watch a lecture
1. **View** `VideoLectureView` mounts and calls `useVideoLectureController()`.
2. **Controller** loads `GET /api/video-lectures` through `videoLectureService` / `apiClient` (JWT attached).
3. **Backend controller** `VideoLectureController.list` reads the user id from the JWT `Authentication`.
4. **Service** loads `video_lectures` and joins `video_watch_progress` for that user.
5. **View** renders cards with a progress bar. Clicking a card calls `openLecture`.
6. **Upload source:** controller fetches `GET /api/video-lectures/{id}/stream` as a blob (so the `<video>` element can play with JWT), then `timeupdate` / pause / ended call `PUT /api/video-lectures/{id}/progress`.
7. **YouTube embed:** controller creates a YouTube IFrame player and periodically saves `getCurrentTime()` / `getDuration()`.
8. **Other embeds:** iframe playback; the student can **Mark as watched**.
9. **Service** upserts `video_watch_progress` (percent, completed at ≥ 95%).

### Publish (faculty / admin only)
1. View opens the publish modal; controller builds `FormData`.
2. `POST /api/video-lectures` (multipart). Controller rejects non-FACULTY/ADMIN with 403.
3. Service stores an embed URL or writes the file under `uploads/video-lectures/` and inserts `video_lectures`.

### Delete (faculty / admin only)
1. View delete button → `DELETE /api/video-lectures/{id}`.
2. Service removes progress rows, the disk file (if any), and the lecture row.

## 3. Files

### Backend
- `backend/src/main/java/com/campusconnect/backend/model/VideoLecture.java`
- `backend/src/main/java/com/campusconnect/backend/model/VideoWatchProgress.java`
- `backend/src/main/java/com/campusconnect/backend/dto/VideoLectureDTO.java`
- `backend/src/main/java/com/campusconnect/backend/dto/VideoProgressDTO.java`
- `backend/src/main/java/com/campusconnect/backend/dto/VideoProgressUpdateRequest.java`
- `backend/src/main/java/com/campusconnect/backend/repository/VideoLectureRepository.java`
- `backend/src/main/java/com/campusconnect/backend/repository/VideoWatchProgressRepository.java`
- `backend/src/main/java/com/campusconnect/backend/service/VideoLectureService.java`
- `backend/src/main/java/com/campusconnect/backend/controller/VideoLectureController.java`
- `backend/src/main/java/com/campusconnect/backend/config/VideoLectureMultipartConfig.java`

### Frontend
- `frontend/src/models/videoLectureModel.js`
- `frontend/src/services/videoLectureService.js`
- `frontend/src/controllers/videoLectureController.js`
- `frontend/src/views/pages/VideoLectureView.jsx`
- `frontend/src/views/pages/VideoLecturePage.css`

### Minimal wiring
- `frontend/src/App.jsx` (route `/video-lectures`)
- `frontend/src/views/components/Sidebar.jsx` (nav item)

### This workflow
- `workflows/video_lecture_streaming_workflow.md`
