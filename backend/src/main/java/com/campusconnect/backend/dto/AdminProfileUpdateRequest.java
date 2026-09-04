package com.campusconnect.backend.dto;

public class AdminProfileUpdateRequest {
    private String fullName;
    private String email;
    private String role;
    private Boolean isAdvisor;
    private String department;
    private Integer year;
    private Double cgpa;
    private Integer completedCredits;

    public String getFullName() { return fullName; }
    public void setFullName(String value) { fullName = value; }
    public String getEmail() { return email; }
    public void setEmail(String value) { email = value; }
    public String getRole() { return role; }
    public void setRole(String value) { role = value; }
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
