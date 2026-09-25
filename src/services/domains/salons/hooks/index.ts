import { useQueryApprovedSalons } from "./useQueryApprovedSalons";
import { useQuerySalonById } from "./useQuerySalonById";
import { useQuerySalonByUsername } from "./useQuerySalonByUsername";
import { useQueryUsernameAvailability } from "./useQueryUsernameAvailability";
import { useQueryBranchServices } from "./useQueryBranchServices";
import { useQueryAvailableDates } from "./useQueryAvailableDates";
import { useQueryStaffAvailability } from "./useQueryStaffAvailability";
import { useQueryCalculatePrice } from "./useQueryCalculatePrice";
import { useQuerySalonAvailableSlots } from "./useQuerySalonAvailableSlots";
import { useMutateSalonBasicInfo } from "./useMutateSalonBasicInfo";
import { useMutateSalonBranches } from "./useMutateSalonBranches";
import {
  useMutateUploadSalonMedia,
  useMutateDeleteSalonMedia,
} from "./useMutateSalonMedia";
import { useMutateSalonStaff } from "./useMutateSalonStaff";
import { useQueryStaffRoster } from "./useQueryStaffRoster";
import { useMutateStaffInvitation } from "./useMutateStaffInvitation";
import { useMutateSubmitForReview } from "./useMutateSubmitForReview";

export {
  useQueryApprovedSalons,
  useQuerySalonById,
  useQuerySalonByUsername,
  useQueryUsernameAvailability,
  useQueryBranchServices,
  useQueryAvailableDates,
  useQueryStaffAvailability,
  useQueryCalculatePrice,
  useQuerySalonAvailableSlots,
  useMutateSalonBasicInfo,
  useMutateSalonBranches,
  useMutateUploadSalonMedia,
  useMutateDeleteSalonMedia,
  useMutateSalonStaff,
  useQueryStaffRoster,
  useMutateStaffInvitation,
  useMutateSubmitForReview,
};
