package com.campusconnect.backend.dto;

/**
 * WatchProgressDto – Payload for updating a student's watch progress.
 *
 * MVC Role: DTO (Model payload)
 */
public class WatchProgressDto {

    private String studentId;
    private Long videoLectureId;
    private Integer lastPositionSeconds;
    private Integer totalDurationSeconds;

    public WatchProgressDto() {}

    public WatchProgressDto(String studentId, Long videoLectureId, Integer lastPositionSeconds, Integer totalDurationSeconds) {
        this.studentId = studentId;
        this.videoLectureId = videoLectureId;
        this.lastPositionSeconds = lastPositionSeconds;
        this.totalDurationSeconds = totalDurationSeconds;
    }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public Long getVideoLectureId() { return videoLectureId; }
    public void setVideoLectureId(Long videoLectureId) { this.videoLectureId = videoLectureId; }

    public Integer getLastPositionSeconds() { return lastPositionSeconds; }
    public void setLastPositionSeconds(Integer lastPositionSeconds) { this.lastPositionSeconds = lastPositionSeconds; }

    public Integer getTotalDurationSeconds() { return totalDurationSeconds; }
    public void setTotalDurationSeconds(Integer totalDurationSeconds) { this.totalDurationSeconds = totalDurationSeconds; }
}
