import axiosClient, { extractResponseData } from './axiosClient';
import { ApiResponse, LoginRequestDto, LoginResponseDto, UserDto } from '@/types';

export const authApi = {
  login: (data: LoginRequestDto): Promise<ApiResponse<LoginResponseDto>> =>
    axiosClient.post('/auth/login', data).then(extractResponseData),

  getCurrentUser: (): Promise<ApiResponse<UserDto>> =>
    axiosClient.get('/auth/me').then(extractResponseData),

  refreshToken: (refreshToken: string): Promise<ApiResponse<LoginResponseDto>> =>
    axiosClient.post('/auth/refresh', { refreshToken }).then(extractResponseData),

  logout: (): Promise<ApiResponse> =>
    axiosClient.post('/auth/logout').then(extractResponseData),
	
  changePassword: (data: { 
    currentPassword: string; 
    newPassword: string; 
    confirmPassword: string 
  }): Promise<ApiResponse> =>
    axiosClient.post('/auth/change-password', data),

  validateLicense: (): Promise<ApiResponse<boolean>> =>
    axiosClient.get('/auth/validate-license'),
};