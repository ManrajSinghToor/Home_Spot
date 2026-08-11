package com.homespot.repository;

import com.homespot.model.Booking;
import com.homespot.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface MessageRepository extends JpaRepository<Message, String> {
    List<Message> findByBookingOrderByCreatedAtAsc(Booking booking);

    @Query("SELECT m FROM Message m WHERE m.booking.id = :bookingId ORDER BY m.createdAt ASC")
    List<Message> findByBookingIdOrderByCreatedAtAsc(@Param("bookingId") String bookingId);
}
