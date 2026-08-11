package com.homespot.model;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;
import java.util.Map;

@Document(collection = "messages")
public class Message {

    @Id
    private String id;

    private Object booking;
    private Object sender;

    private String senderName;
    private String text;

    @CreatedDate
    private Date createdAt;

    @LastModifiedDate
    private Date updatedAt;

    public Message() {
    }

    public Message(Object booking, Object sender, String senderName, String text) {
        this.booking = booking;
        this.sender = sender;
        this.senderName = senderName;
        this.text = text;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Object getBooking() {
        return booking;
    }

    public void setBooking(Object booking) {
        this.booking = booking;
    }

    public Object getSender() {
        return sender;
    }

    public void setSender(Object sender) {
        this.sender = sender;
    }

    public String getSenderName() {
        return senderName;
    }

    public void setSenderName(String senderName) {
        this.senderName = senderName;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }

    public Date getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Date updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getBookingId() {
        if (booking == null) return null;
        if (booking instanceof Booking) return ((Booking) booking).getId();
        if (booking instanceof Map) {
            Object idObj = ((Map<?, ?>) booking).get("id");
            if (idObj == null) idObj = ((Map<?, ?>) booking).get("_id");
            return idObj != null ? idObj.toString() : null;
        }
        return booking.toString();
    }
}
