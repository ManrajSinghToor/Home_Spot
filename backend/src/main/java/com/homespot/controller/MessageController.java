package com.homespot.controller;

import com.homespot.dto.ApiResponse;
import com.homespot.dto.MessageRequest;
import com.homespot.model.Booking;
import com.homespot.model.Message;
import com.homespot.model.Property;
import com.homespot.model.User;
import com.homespot.repository.BookingRepository;
import com.homespot.repository.MessageRepository;
import com.homespot.repository.UserRepository;
import com.homespot.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/{bookingId}")
    public ResponseEntity<?> getMessages(@AuthenticationPrincipal UserPrincipal currentUser,
                                         @PathVariable("bookingId") String bookingId) {
        try {
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Not authorized"));
            }

            Optional<Booking> bookingOpt = bookingRepository.findById(bookingId);
            if (bookingOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Booking not found"));
            }

            Booking booking = bookingOpt.get();
            Property property = booking.getProperty();

            boolean isTenant = booking.getTenant() != null && booking.getTenant().getId().equals(currentUser.getId());
            boolean isLandlord = property != null && property.getLandlord() != null && property.getLandlord().getId().equals(currentUser.getId());

            if (!isTenant && !isLandlord) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("Not authorized to view messages for this booking"));
            }

            List<Message> messages = messageRepository.findByBookingIdOrderByCreatedAtAsc(bookingId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("messages", messages);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> sendMessage(@AuthenticationPrincipal UserPrincipal currentUser,
                                         @RequestBody MessageRequest req) {
        try {
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Not authorized"));
            }

            if (req.getBookingId() == null || req.getText() == null || req.getText().trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("Booking ID and message text are required"));
            }

            Optional<Booking> bookingOpt = bookingRepository.findById(req.getBookingId());
            if (bookingOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Booking not found"));
            }

            Booking booking = bookingOpt.get();
            Property property = booking.getProperty();

            boolean isTenant = booking.getTenant() != null && booking.getTenant().getId().equals(currentUser.getId());
            boolean isLandlord = property != null && property.getLandlord() != null && property.getLandlord().getId().equals(currentUser.getId());

            if (!isTenant && !isLandlord) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("Not authorized to send messages in this booking"));
            }

            Optional<User> senderOpt = userRepository.findById(currentUser.getId());
            if (senderOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("User not found"));
            }

            User sender = senderOpt.get();
            Message message = new Message(booking, sender, sender.getUsername(), req.getText().trim());
            Message savedMsg = messageRepository.save(message);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", savedMsg);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.error(e.getMessage()));
        }
    }
}
