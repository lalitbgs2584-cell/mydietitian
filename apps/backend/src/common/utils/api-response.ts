import type { Response } from 'express';

interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T | null;
}

class ApiResponse {
  static ok<T>(
    res: Response<ApiSuccessResponse<T>>,
    message: string,
    data: T | null = null,
  ) {
    return res.status(200).json({
      success: true,
      message,
      data,
    });
  }

  static created<T>(
    res: Response<ApiSuccessResponse<T>>,
    message: string,
    data: T | null = null,
  ) {
    return res.status(201).json({
      success: true,
      message,
      data,
    });
  }
}

export default ApiResponse;