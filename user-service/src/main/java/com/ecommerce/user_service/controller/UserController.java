package com.ecommerce.user_service.controller;

import com.ecommerce.user_service.entity.User;
import com.ecommerce.user_service.service.UserService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService service;

    public UserController(UserService service) {
        this.service = service;
    }

    // ==========================================
    // CREATE USER
    // ==========================================

    @PostMapping
    public ResponseEntity<User> createUser(
            @RequestBody User user
    ) {

        User createdUser =
                service.createUser(user);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(createdUser);
    }

    // ==========================================
    // GET ALL USERS
    // ==========================================

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {

        return ResponseEntity.ok(
                service.getAllUsers()
        );
    }

    // ==========================================
    // GET USER BY ID
    // ==========================================

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(
            @PathVariable Long id
    ) {

        Optional<User> user =
                service.getUserById(id);

        if (user.isPresent()) {

            return ResponseEntity.ok(
                    user.get()
            );
        }

        return ResponseEntity.notFound().build();
    }

    // ==========================================
    // GET USER BY EMAIL
    // ==========================================

    @GetMapping("/email/{email}")
    public ResponseEntity<User> getUserByEmail(
            @PathVariable String email
    ) {

        Optional<User> user =
                service.getUserByEmail(email);

        if (user.isPresent()) {

            return ResponseEntity.ok(
                    user.get()
            );
        }

        return ResponseEntity.notFound().build();
    }

    // ==========================================
    // UPDATE USER
    // ==========================================

    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(
            @PathVariable Long id,
            @RequestBody User user
    ) {

        User updatedUser =
                service.updateUser(
                        id,
                        user
                );

        return ResponseEntity.ok(
                updatedUser
        );
    }

    // ==========================================
    // DELETE USER
    // ==========================================

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(
            @PathVariable Long id
    ) {

        service.deleteUser(id);

        return ResponseEntity.ok(
                "User deleted successfully"
        );
    }
}
