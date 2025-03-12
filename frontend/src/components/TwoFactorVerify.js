import { useState } from "react";
import { useForm } from "react-hook-form";

export default function TwoFactorVerify({
  onSubmit,
  isSubmitting = false,
  buttonText,
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="form-group">
        <label
          htmlFor="token"
          className="block text-sm font-medium text-gray-700"
        >
          Verification Code
        </label>
        <input
          id="token"
          type="text"
          autoFocus
          autoComplete="one-time-code"
          placeholder="Enter 6-digit code"
          {...register("token", {
            required: "Verification code is required",
            pattern: {
              value: /^\d{6}$/,
              message: "Must be a 6-digit code",
            },
          })}
          className={`form-control ${errors.token ? "is-invalid" : ""}`}
        />
        {errors.token && (
          <span className="error-message">{errors.token.message}</span>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn btn-primary mt-4"
      >
        {isSubmitting ? "Verifying..." : buttonText || "Verify"}
      </button>
    </form>
  );
}
