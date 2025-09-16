import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createReport } from "../services/reportService";
import { CreateReportFormData } from "../types/report.types";

export const useCreateReport = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (formData: CreateReportFormData) => createReport(formData),
    onSuccess: (data) => {
      // Navigate to the created report or success page
      navigate(`/reports/${data.id}`, {
        replace: true,
        state: { message: "Laporan berhasil dibuat!" },
      });
    },
    onError: (error) => {
      console.error("Failed to create report:", error);
      // Error handling will be done in the component
    },
  });
};
