package com.homespot.model;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;
import java.util.Map;

@Document(collection = "bookings")
public class Booking {

    @Id
    private String id;

    private Object property;
    private Object tenant;

    private String name;
    private String email;
    private String phone;
    private Date moveInDate;
    private String duration;
    private String message;
    private String status = "pending"; // 'pending', 'approved', 'declined', 'cancelled', 'completed'
    private String paymentStatus = "unpaid"; // 'unpaid', 'paid'

    @CreatedDate
    private Date createdAt;

    @LastModifiedDate
    private Date updatedAt;

    public Booking() {
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Object getProperty() {
        return property;
    }

    public void setProperty(Object property) {
        this.property = property;
    }

    public Object getTenant() {
        return tenant;
    }

    public void setTenant(Object tenant) {
        this.tenant = tenant;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public Date getMoveInDate() {
        return moveInDate;
    }

    public void setMoveInDate(Date moveInDate) {
        this.moveInDate = moveInDate;
    }

    public String getDuration() {
        return duration;
    }

    public void setDuration(String duration) {
        this.duration = duration;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
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

    public String getPropertyId() {
        if (property == null) return null;
        if (property instanceof Property) return ((Property) property).getId();
        if (property instanceof Map) {
            Object idObj = ((Map<?, ?>) property).get("id");
            if (idObj == null) idObj = ((Map<?, ?>) property).get("_id");
            return idObj != null ? idObj.toString() : null;
        }
        return property.toString();
    }

    public String getTenantId() {
        if (tenant == null) return null;
        if (tenant instanceof User) return ((User) tenant).getId();
        if (tenant instanceof Map) {
            Object idObj = ((Map<?, ?>) tenant).get("id");
            if (idObj == null) idObj = ((Map<?, ?>) tenant).get("_id");
            return idObj != null ? idObj.toString() : null;
        }
        return tenant.toString();
    }
}
