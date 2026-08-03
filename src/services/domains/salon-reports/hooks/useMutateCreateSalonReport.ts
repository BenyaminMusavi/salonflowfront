import { useMutation } from "@tanstack/react-query";
import salonReportsService from "../salon-reports.service";
import { ICreateSalonReportRequest } from "../types/salon-reports.type";

export const useMutateCreateSalonReport = () => {
  return useMutation({
    mutationFn: (body: ICreateSalonReportRequest) =>
      salonReportsService.create(body),
  });
};
