package com.campusconnect.backend.dto;

import com.campusconnect.backend.model.Advisor;

import java.util.List;

/**
 * AdvisorMatchResponse – DTO returned by GET /api/advisors/match.
 *
 * MVC Role: DTO (Data Transfer Object)
 *
 * Wraps the ranked list of matched advisors with metadata about
 * what criteria were used for the match.
 */
public class AdvisorMatchResponse {

    private boolean      success;
    private int          count;
    private String       matchedOn;   // e.g. "department: cse" or "all advisors"
    private List<Advisor> advisors;

    // ── Constructors ──────────────────────────────────────────────
    public AdvisorMatchResponse() {}

    public AdvisorMatchResponse(boolean success, int count,
                                String matchedOn, List<Advisor> advisors) {
        this.success   = success;
        this.count     = count;
        this.matchedOn = matchedOn;
        this.advisors  = advisors;
    }

    // ── Getters & Setters ─────────────────────────────────────────
    public boolean       isSuccess()                        { return success; }
    public void          setSuccess(boolean success)        { this.success = success; }

    public int           getCount()                         { return count; }
    public void          setCount(int count)                { this.count = count; }

    public String        getMatchedOn()                     { return matchedOn; }
    public void          setMatchedOn(String matchedOn)     { this.matchedOn = matchedOn; }

    public List<Advisor> getAdvisors()                      { return advisors; }
    public void          setAdvisors(List<Advisor> advisors){ this.advisors = advisors; }
}
