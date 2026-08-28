/** Numeric enums as returned by SalonFlow.Api (guide §5.4). */

export enum AppointmentStatus {
  Scheduled = 1,
  Completed = 2,
  Cancelled = 3,
  NoShow = 4,
  CheckedIn = 5,
}

export enum AppointmentSource {
  Online = 1,
  WalkIn = 2,
  Phone = 3,
  Quick = 4,
}

export enum PaymentMethod {
  Cash = 1,
  Card = 2,
  Online = 3,
  Transfer = 4,
  Wallet = 5,
}

export enum PaymentType {
  Appointment = 1,
  Deposit = 2,
  Full = 3,
  Refund = 4,
  Penalty = 5,
}

export enum PaymentStatus {
  Pending = 1,
  Paid = 2,
  Failed = 3,
  Refunded = 4,
  Cancelled = 5,
}

export enum InvoiceStatus {
  Draft = 1,
  Issued = 2,
  PartiallyPaid = 3,
  Paid = 4,
  Cancelled = 5,
  Refunded = 6,
}

/** Branch / service audience (guide §5.4). */
export enum GenderType {
  Male = 1,
  Female = 2,
  Mixed = 3,
}

/** User / customer (guide §5.4). */
export enum PersonGender {
  Male = 1,
  Female = 2,
  Other = 3,
}

export enum SalonApprovalStatus {
  Pending = 1,
  Approved = 2,
  Rejected = 3,
  Draft = 4,
}

export enum SubscriptionStatus {
  Trialing = 1,
  Active = 2,
  Grace = 3,
  PastDue = 4,
  Canceled = 5,
  Expired = 6,
  Suspended = 7,
}

export enum PlatformInvoiceStatus {
  Pending = 1,
  Paid = 2,
  Cancelled = 3,
  Expired = 4,
}

export enum PromoCodeScope {
  PlatformSubscription = 1,
  SalonBooking = 2,
}

export enum ReviewModerationStatus {
  Pending = 1,
  Approved = 2,
  Rejected = 3,
}

export enum ReviewTargetType {
  Salon = 1,
  Staff = 2,
}

export enum SalonReportReason {
  Misconduct = 1,
  Scam = 2,
  Inappropriate = 3,
  Other = 4,
}

export enum SalonReportStatus {
  Pending = 1,
  Investigating = 2,
  Resolved = 3,
  Dismissed = 4,
}

export enum TrustStatus {
  Active = 1,
  UnderReview = 2,
  Suspended = 3,
}

/** StaffMember.Status — set by the two-step invitation flow (guide §3.1). */
export enum StaffInvitationStatus {
  Pending = 1,
  Active = 2,
  Rejected = 3,
}

/** Media upload entity owner (guide §3.1). */
export enum MediaEntityType {
  Salon = 1,
}

/** Common media kind for upload form field `mediaType`. */
export enum MediaType {
  Image = 1,
}

/** Media usage on salon (guide §3.1). */
export enum MediaUsageType {
  Cover = 1,
  Banner = 2,
  Profile = 3,
  Gallery = 4,
}
