package com.campusconnect.backend.controller;

import com.campusconnect.backend.dto.UserDto;
import com.campusconnect.backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * UserController – REST API controller for directory and user queries.
 *
 * MVC Role: Controller
 *
 * Endpoint: GET /api/users
 */
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * Fetch all registered users for messaging directory.
     *
     * @param excludeUserId Optional userId to omit from the results
     * @return List of UserDto
     */
    @GetMapping
    public ResponseEntity<List<UserDto>> getUsers(
            @RequestParam(value = "excludeUserId", required = false) String excludeUserId) {
        List<UserDto> users = userService.getAllUsers(excludeUserId);
        return ResponseEntity.ok(users);
    }
}
