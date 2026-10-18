package com.bites.common;

import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;

@Provider
public class ApiErrorMapper implements ExceptionMapper<RuntimeException> {
    @Override
    public Response toResponse(RuntimeException e) {
        if (e instanceof WebApplicationException wae && !(e instanceof NotFoundException)
                && !(e instanceof IllegalArgumentException) && !(e instanceof IllegalStateException)) {
            int status = wae.getResponse() != null ? wae.getResponse().getStatus() : 500;
            if (status == 401 || status == 403 || status == 404) {
                return Response.status(status)
                        .entity(ApiResponse.fail(e.getMessage() != null ? e.getMessage() : "Request failed"))
                        .build();
            }
        }
        if (e instanceof NotFoundException) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(ApiResponse.fail(e.getMessage() != null ? e.getMessage() : "Not found"))
                    .build();
        }
        if (e instanceof IllegalStateException) {
            return Response.status(Response.Status.CONFLICT)
                    .entity(ApiResponse.fail(String.valueOf(e.getMessage())))
                    .build();
        }
        if (e instanceof IllegalArgumentException) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(ApiResponse.fail(String.valueOf(e.getMessage())))
                    .build();
        }
        return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(ApiResponse.fail("Internal server error"))
                .build();
    }
}
