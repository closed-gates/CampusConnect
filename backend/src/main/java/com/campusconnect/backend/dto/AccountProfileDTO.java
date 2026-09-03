package com.campusconnect.backend.dto;

/**
 * AccountProfileDTO - Response payload for authenticated GET /api/account/profile.
 * MVC Role: DTO
 */
public class AccountProfileDTO {
    private String  userId;
    private String  fullName;
    private String  email;
    private String  role;
    private String  createdAt;
    private Boolean isAdvisor;
    private String  department;
    private Integer year;
    private Double  cgpa;
    private Integer completedCredits;
    private Boolean onProbation;
    private Integer courseLimit;
    private Integer creditLimit;
    private Integer reminderHours;

    public AccountProfileDTO() {}

    public String  getUserId()              { return userId; }
    public void    setUserId(String v)      { this.userId = v; }
    public String  getFullName()            { return fullName; }
    public void    setFullName(String v)    { this.fullName = v; }
    public String  getEmail()               { return email; }
    public void    setEmail(String v)       { this.email = v; }
    public String  getRole()                { return role; }
    public void    setRole(String v)        { this.role = v; }
    public String  getCreatedAt()           { return createdAt; }
    public void    setCreatedAt(String v)   { this.createdAt = v; }
    public Boolean getIsAdvisor()           { return isAdvisor; }
    public void    setIsAdvisor(Boolean v)  { this.isAdvisor = v; }
    public String  getDepartment()          { return department; }
    public void    setDepartment(String v)  { this.department = v; }
    public Integer getYear()                { return year; }
    public void    setYear(Integer v)       { this.year = v; }
    public Double  getCgpa()                { return cgpa; }
    public void    setCgpa(Double v)        { this.cgpa = v; }
    public Integer getCompletedCredits()    { return completedCredits; }
    public void    setCompletedCredits(Integer v) { this.completedCredits = v; }
    public Boolean getOnProbation()         { return onProbation; }
    public void    setOnProbation(Boolean v){ this.onProbation = v; }
    public Integer getCourseLimit()         { return courseLimit; }
    public void    setCourseLimit(Integer v){ this.courseLimit = v; }
    public Integer getCreditLimit()         { return creditLimit; }
    public void    setCreditLimit(Integer v){ this.creditLimit = v; }
    public Integer getReminderHours()       { return reminderHours; }
    public void    setReminderHours(Integer v) { this.reminderHours = v; }
}
