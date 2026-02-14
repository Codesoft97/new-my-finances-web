'use client';

import { toast } from 'sonner';

const ERROR_TOAST_MARK = '__errorToastShown';

interface ApiErrorLike {
  response?: {
    data?: {
      message?: unknown;
    };
  };
  message?: unknown;
  [ERROR_TOAST_MARK]?: boolean;
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

export const getApiErrorMessage = (error: unknown, fallback: string) => {
  const maybeError = error as ApiErrorLike;
  const responseMessage = maybeError?.response?.data?.message;

  if (typeof responseMessage === 'string' && responseMessage.trim()) {
    return responseMessage;
  }

  if (typeof maybeError?.message === 'string' && maybeError.message.trim()) {
    return maybeError.message;
  }

  return fallback;
};

export const wasApiErrorToastShown = (error: unknown) => {
  if (!isObject(error)) return false;
  return Boolean((error as ApiErrorLike)[ERROR_TOAST_MARK]);
};

export const markApiErrorToastShown = (error: unknown) => {
  if (!isObject(error)) return;
  (error as ApiErrorLike)[ERROR_TOAST_MARK] = true;
};

export const toastApiError = (error: unknown, fallback: string) => {
  const message = getApiErrorMessage(error, fallback);

  if (!wasApiErrorToastShown(error)) {
    toast.error(message);
    markApiErrorToastShown(error);
  }

  return message;
};
