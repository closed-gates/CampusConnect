package com.campusconnect.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;

@Entity
@Table(name = "user_profile_pictures")
public class UserProfilePicture {
    @Id
    @Column(name = "user_id", length = 50)
    private String userId;

    @Column(name = "content_type", nullable = false, length = 100)
    private String contentType;

    @Lob
    @Column(name = "image_data", nullable = false)
    private byte[] imageData;

    public UserProfilePicture() {}

    public UserProfilePicture(String userId, String contentType, byte[] imageData) {
        this.userId = userId;
        this.contentType = contentType;
        this.imageData = imageData;
    }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }
    public byte[] getImageData() { return imageData; }
    public void setImageData(byte[] imageData) { this.imageData = imageData; }
}
