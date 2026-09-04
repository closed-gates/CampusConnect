# Course Materials Repository Workflow

## 1. User story

Students open **Course Materials** to **view** or **download** lecture notes, slides, and documents.

Faculty and admins can **upload** a file (PDF, Office, ZIP, text, or image), tag it as notes / slides / document, **delete** it, and download it.

## 2. Sequential flow

### Browse and download
1. **View** `CourseMaterialView` mounts and calls `useCourseMaterialController()`.
2. **Controller** loads `GET /api/course-materials` through `courseMaterialService` / `apiClient` (JWT attached), and loads `GET /api/courses/catalog` for filter and upload course dropdowns.
3. **Backend controller** `CourseMaterialController.list` requires authentication.
4. **Service** reads `course_materials` (restored from `uploads/course-materials/catalog.json` after an H2 restart if needed).
5. **View** filters by course/type and renders cards.
6. **View file:** View clicks `GET /api/course-materials/{id}/view` (inline). Controller opens a preview modal (PDF iframe, image, or text). Office files use the same viewer; Download is available if the browser cannot render them.
7. **Download:** Download clicks `GET /api/course-materials/{id}/download` (attachment). Controller saves the blob to disk.

### Upload (faculty / admin only)
1. View opens the upload modal; controller builds `FormData`.
2. `POST /api/course-materials` (multipart). Non-FACULTY/ADMIN receive 403.
3. Service validates type/size (≤ 25 MB), stores the file under `uploads/course-materials/`, inserts the catalog row, and writes `catalog.json`.

### Delete (faculty / admin only)
1. View delete button → `DELETE /api/course-materials/{id}`.
2. Service removes the disk file, the database row, and updates `catalog.json`.

## 3. Files

### Backend
- `backend/src/main/java/com/campusconnect/backend/model/CourseMaterial.java`
- `backend/src/main/java/com/campusconnect/backend/dto/CourseMaterialDTO.java`
- `backend/src/main/java/com/campusconnect/backend/repository/CourseMaterialRepository.java`
- `backend/src/main/java/com/campusconnect/backend/service/CourseMaterialService.java`
- `backend/src/main/java/com/campusconnect/backend/service/CourseMaterialCatalogStore.java`
- `backend/src/main/java/com/campusconnect/backend/controller/CourseMaterialController.java`

### Frontend
- `frontend/src/models/courseMaterialModel.js`
- `frontend/src/services/courseMaterialService.js`
- `frontend/src/controllers/courseMaterialController.js`
- `frontend/src/views/pages/CourseMaterialView.jsx`
- `frontend/src/views/pages/CourseMaterialPage.css`

### Minimal wiring
- `frontend/src/App.jsx` (route `/course-materials`)
- `frontend/src/views/components/Sidebar.jsx` (nav item)

### This workflow
- `workflows/course_materials_repository_workflow.md`
