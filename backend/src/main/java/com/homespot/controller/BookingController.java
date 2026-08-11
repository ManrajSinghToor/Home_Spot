package com.homespot.controller;

import com.homespot.dto.ApiResponse;
import com.homespot.dto.BookingRequest;
import com.homespot.dto.BookingUpdateRequest;
import com.homespot.model.Booking;
import com.homespot.model.Message;
import com.homespot.model.Property;
import com.homespot.model.User;
import com.homespot.repository.BookingRepository;
import com.homespot.repository.MessageRepository;
import com.homespot.repository.PropertyRepository;
import com.homespot.repository.UserRepository;
import com.homespot.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private PropertyRepository propertyRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MessageRepository messageRepository;

    private void handlePropertySold(String bookingId, Property property, User landlord) {
        try {
            property.setStatus("rented");
            propertyRepository.save(property);

            List<Booking> otherBookings = bookingRepository.findByPropertyIdAndIdNotAndStatusIn(
                    property.getId(), bookingId, Arrays.asList("pending", "approved")
            );

            for (Booking other : otherBookings) {
                other.setStatus("cancelled");
                bookingRepository.save(other);

                Message systemMsg = new Message();
                systemMsg.setBooking(other);
                systemMsg.setSender(landlord);
                systemMsg.setSenderName("System Notification");
                systemMsg.setText("This property has been sold out to another tenant. Your booking inquiry has been cancelled.");
                messageRepository.save(systemMsg);
            }
        } catch (Exception err) {
            System.err.println("Error handling property sold actions: " + err.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> createBooking(@AuthenticationPrincipal UserPrincipal currentUser,
                                           @RequestBody BookingRequest req) {
        try {
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Not authorized"));
            }

            if (req.getPropertyId() == null || req.getName() == null || req.getEmail() == null ||
                req.getPhone() == null || req.getDuration() == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error("Please provide all required fields"));
            }

            Optional<Property> propertyOpt = propertyRepository.findById(req.getPropertyId());
            if (propertyOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Property not found"));
            }

            Property property = propertyOpt.get();
            if ("rented".equalsIgnoreCase(property.getStatus())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error("This property has already been sold out."));
            }

            Optional<User> tenantOpt = userRepository.findById(currentUser.getId());
            if (tenantOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Tenant account not found"));
            }

            Booking booking = new Booking();
            booking.setProperty(property);
            booking.setTenant(tenantOpt.get());
            booking.setName(req.getName());
            booking.setEmail(req.getEmail());
            booking.setPhone(req.getPhone());
            booking.setMoveInDate(req.getMoveInDate() != null ? req.getMoveInDate() : new Date());
            booking.setDuration(req.getDuration());
            booking.setMessage(req.getMessage());
            booking.setStatus(req.getStatus() != null ? req.getStatus() : "pending");
            booking.setPaymentStatus("unpaid");

            Booking savedBooking = bookingRepository.save(booking);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("booking", savedBooking);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<?> getBookings(@AuthenticationPrincipal UserPrincipal currentUser) {
        try {
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Not authorized"));
            }

            List<Booking> bookings;
            if ("landlord".equalsIgnoreCase(currentUser.getRole())) {
                List<Property> landlordProps = propertyRepository.findByLandlordId(currentUser.getId());
                bookings = bookingRepository.findByPropertyIn(landlordProps);
            } else {
                bookings = bookingRepository.findByTenantId(currentUser.getId());
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("bookings", bookings);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getBookingById(@AuthenticationPrincipal UserPrincipal currentUser,
                                            @PathVariable("id") String id) {
        try {
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Not authorized"));
            }

            Optional<Booking> bookingOpt = bookingRepository.findById(id);
            if (bookingOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Booking not found"));
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("booking", bookingOpt.get());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateBooking(@AuthenticationPrincipal UserPrincipal currentUser,
                                           @PathVariable("id") String id,
                                           @RequestBody BookingUpdateRequest req) {
        try {
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Not authorized"));
            }

            Optional<Booking> bookingOpt = bookingRepository.findById(id);
            if (bookingOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Booking not found"));
            }

            Booking booking = bookingOpt.get();
            boolean soldTriggered = false;

            if (req.getPaymentStatus() != null) {
                if ("paid".equalsIgnoreCase(req.getPaymentStatus()) && !"approved".equalsIgnoreCase(booking.getStatus())) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(ApiResponse.error("Payment is not allowed until the landlord has approved the booking request."));
                }
                booking.setPaymentStatus(req.getPaymentStatus());
                if ("paid".equalsIgnoreCase(req.getPaymentStatus()) && "approved".equalsIgnoreCase(booking.getStatus())) {
                    soldTriggered = true;
                }
            }

            if (req.getStatus() != null) {
                Property property = booking.getProperty();

                if ("cancelled".equalsIgnoreCase(req.getStatus())) {
                    if ("paid".equalsIgnoreCase(booking.getPaymentStatus())) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body(ApiResponse.error("Cannot cancel a booking that is already paid."));
                    }
                    boolean isTenant = (booking.getTenant() != null && booking.getTenant().getId().equals(currentUser.getId())) ||
                            (booking.getEmail() != null && booking.getEmail().equalsIgnoreCase(currentUser.getEmail()));
                    boolean isLandlord = property != null && property.getLandlord() != null && property.getLandlord().getId().equals(currentUser.getId());

                    if (!isTenant && !isLandlord) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .body(ApiResponse.error("Not authorized to cancel this booking"));
                    }
                } else {
                    if (property == null || property.getLandlord() == null || !property.getLandlord().getId().equals(currentUser.getId())) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .body(ApiResponse.error("Only landlords can approve or decline requests"));
                    }
                }

                booking.setStatus(req.getStatus());
                if ("approved".equalsIgnoreCase(req.getStatus()) && "paid".equalsIgnoreCase(booking.getPaymentStatus())) {
                    soldTriggered = true;
                }
            }

            Booking updatedBooking = bookingRepository.save(booking);

            if (soldTriggered && booking.getProperty() != null) {
                User landlord = booking.getProperty().getLandlord();
                handlePropertySold(booking.getId(), booking.getProperty(), landlord);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("booking", updatedBooking);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.error(e.getMessage()));
        }
    }
}
