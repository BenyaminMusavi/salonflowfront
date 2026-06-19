import {useMutation} from "@tanstack/react-query";
import authService from "@/services/domains/auth/auth.service";
import {ISendOtpRequest} from "@/services/domains/auth/types/auth.type";


export const useMutateSendOtp = () => {
    return useMutation({
        mutationFn: (formData: ISendOtpRequest) => authService.sendOtp(formData),
    })
}