package com.campusconnect.backend.dto;

public class AdminManagedProfileDTO {
    private String userId;
    private String fullName;
    private String email;
    private String role;
    private String createdAt;
    private Boolean isAdvisor;
    private String department;
    private Integer year;
    private Double cgpa;
    private Integer completedCredits;

    public String getUserId() { return userId; }
    public void setUserId(String value) { userId = value; }
    public String getFullName() { return fullName; }
    public void setFullName(String value) { fullName = value; }
    public String getEmail() { return email; }
    public void setEmail(String value) { email = value; }
    public String getRole() { return role; }
    public void setRole(String value) { role = value; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String value) { createdAt = value; }
    public Boolean getIsAdvisor() { return isAdvisor; }
    public void setIsAdvisor(Boolean value) { isAdvisor = value; }
    public String getDepartment() { return department; }
    public void setDepartment(String value) { department = value; }
    public Integer getYear() { return year; }
    public void setYear(Integer value) { year = value; }
    public Double getCgpa() { return cgpa; }
    public void setCgpa(Double value) { cgpa = value; }
    public Integer getCompletedCredits() { return completedCredits; }
    public void setCompletedCredits(Integer value) { completedCredits = value; }
}
