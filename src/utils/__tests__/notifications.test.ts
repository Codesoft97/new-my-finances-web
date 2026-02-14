import { toast } from 'sonner';
import {
  getApiErrorMessage,
  markApiErrorToastShown,
  toastApiError,
  wasApiErrorToastShown,
} from '../notifications';

jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
  },
}));

const mockedToastError = toast.error as jest.Mock;

describe('notifications utils', () => {
  beforeEach(() => {
    mockedToastError.mockClear();
  });

  it('extracts backend message when available', () => {
    const message = getApiErrorMessage(
      {
        response: {
          data: {
            message: 'Mensagem do backend',
          },
        },
      },
      'Fallback'
    );

    expect(message).toBe('Mensagem do backend');
  });

  it('falls back to default message when error has no known shape', () => {
    const message = getApiErrorMessage({}, 'Fallback');

    expect(message).toBe('Fallback');
  });

  it('marks error as already toasted', () => {
    const error = {} as Record<string, unknown>;

    expect(wasApiErrorToastShown(error)).toBe(false);
    markApiErrorToastShown(error);
    expect(wasApiErrorToastShown(error)).toBe(true);
  });

  it('shows toast only once per error object', () => {
    const error = {
      response: {
        data: {
          message: 'Erro de teste',
        },
      },
    };

    toastApiError(error, 'Fallback');
    toastApiError(error, 'Fallback');

    expect(mockedToastError).toHaveBeenCalledTimes(1);
    expect(mockedToastError).toHaveBeenCalledWith('Erro de teste');
  });
});
